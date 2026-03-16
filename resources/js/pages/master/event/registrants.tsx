import { Link, router, useForm } from '@inertiajs/react';
import { Calendar, FileText, Users } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { index as eventIndex } from '@/routes/backoffice/master/event';
import { checkIn, confirm, refund, reject, undoCheckIn } from '@/routes/backoffice/operational/order';
import { show as orderShow } from '@/routes/backoffice/operational/order';
import type { Event } from '@/types/event';
import type { Order, OrderStatus } from '@/types/order';

function formatPrice(price: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
}

function formatDate(date: string) {
    return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDateTime(date: string) {
    return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const statusConfig: Record<OrderStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    pending_payment: { label: 'Pending Payment', variant: 'outline' },
    waiting_confirmation: { label: 'Waiting', variant: 'secondary' },
    confirmed: { label: 'Confirmed', variant: 'default' },
    rejected: { label: 'Rejected', variant: 'destructive' },
    cancelled: { label: 'Cancelled', variant: 'outline' },
    refunded: { label: 'Refunded', variant: 'secondary' },
};

type Props = {
    event: Event;
    orders: Order[];
};

export default function EventRegistrants({ event, orders }: Props) {
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
    const [rejectOrderId, setRejectOrderId] = useState<number | null>(null);
    const [refundOrderId, setRefundOrderId] = useState<number | null>(null);
    const [proofImage, setProofImage] = useState<string | null>(null);
    const rejectForm = useForm({ rejection_reason: '' });
    const refundForm = useForm({ refund_reason: '' });

    const filteredOrders = statusFilter === 'all' ? orders : orders.filter((o) => o.status === statusFilter);

    const confirmedCount = orders.filter((o) => o.status === 'confirmed').length;
    const waitingCount = orders.filter((o) => o.status === 'waiting_confirmation').length;
    const pendingCount = orders.filter((o) => o.status === 'pending_payment').length;
    const refundedCount = orders.filter((o) => o.status === 'refunded').length;
    const checkedInCount = orders.filter((o) => o.checked_in_at).length;
    const totalRevenue = orders.filter((o) => o.status === 'confirmed').reduce((sum, o) => sum + o.total_amount, 0);

    const handleConfirm = (orderId: number) => {
        if (!window.confirm('Confirm this payment?')) return;
        router.post(confirm.url(orderId), {}, {
            preserveScroll: true,
            onSuccess: () => router.reload(),
        });
    };

    const handleReject = (e: React.FormEvent) => {
        e.preventDefault();
        if (!rejectOrderId) return;
        rejectForm.post(reject.url(rejectOrderId), {
            preserveScroll: true,
            onSuccess: () => {
                setRejectOrderId(null);
                rejectForm.reset();
                router.reload();
            },
        });
    };

    const handleRefund = (e: React.FormEvent) => {
        e.preventDefault();
        if (!refundOrderId) return;
        refundForm.post(refund.url(refundOrderId), {
            preserveScroll: true,
            onSuccess: () => {
                setRefundOrderId(null);
                refundForm.reset();
                router.reload();
            },
        });
    };

    // Group orders by catalog
    const catalogs = event.catalogs || [];
    const ordersByCatalog = catalogs.map((catalog) => ({
        catalog,
        orders: filteredOrders.filter((o) => o.catalog_id === catalog.id),
    }));
    const uncategorized = filteredOrders.filter((o) => !catalogs.some((c) => c.id === o.catalog_id));

    return (
        <>
            {/* Reject dialog */}
            <Dialog open={rejectOrderId !== null} onOpenChange={() => { setRejectOrderId(null); rejectForm.reset(); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Payment</DialogTitle>
                        <DialogDescription>Provide a reason for rejecting this payment. The customer will be able to re-upload.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleReject}>
                        <Textarea
                            placeholder="Reason for rejection..."
                            value={rejectForm.data.rejection_reason}
                            onChange={(e) => rejectForm.setData('rejection_reason', e.target.value)}
                            rows={3}
                        />
                        {rejectForm.errors.rejection_reason && (
                            <p className="mt-1 text-xs text-destructive">{rejectForm.errors.rejection_reason}</p>
                        )}
                        <DialogFooter className="mt-4">
                            <Button type="button" variant="outline" onClick={() => { setRejectOrderId(null); rejectForm.reset(); }}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="destructive" disabled={rejectForm.processing || !rejectForm.data.rejection_reason}>
                                Reject
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Refund dialog */}
            <Dialog open={refundOrderId !== null} onOpenChange={() => { setRefundOrderId(null); refundForm.reset(); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Refund Order</DialogTitle>
                        <DialogDescription>Provide a reason for refunding this order.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleRefund}>
                        <Textarea
                            placeholder="Reason for refund..."
                            value={refundForm.data.refund_reason}
                            onChange={(e) => refundForm.setData('refund_reason', e.target.value)}
                            rows={3}
                        />
                        {refundForm.errors.refund_reason && (
                            <p className="mt-1 text-xs text-destructive">{refundForm.errors.refund_reason}</p>
                        )}
                        <DialogFooter className="mt-4">
                            <Button type="button" variant="outline" onClick={() => { setRefundOrderId(null); refundForm.reset(); }}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="destructive" disabled={refundForm.processing || !refundForm.data.refund_reason}>
                                Refund
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Payment proof preview */}
            <Dialog open={proofImage !== null} onOpenChange={() => setProofImage(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Payment Proof</DialogTitle>
                    </DialogHeader>
                    {proofImage && <img src={proofImage} alt="Payment proof" className="w-full rounded-md" />}
                </DialogContent>
            </Dialog>

            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="size-4" />
                            <span>{formatDate(event.start_date)} - {formatDate(event.end_date)}</span>
                        </div>
                        <h1 className="text-xl font-semibold">{event.name} — Registrants</h1>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild variant="outline">
                            <Link href={`/master/event/${event.id}/materials`}>
                                <FileText className="size-4" />
                                Materials
                            </Link>
                        </Button>
                        <Button variant="outline" onClick={() => router.visit(eventIndex().url)}>
                            Back to Events
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                    <div className="rounded-lg border bg-card p-4">
                        <p className="text-xs text-muted-foreground">Confirmed</p>
                        <p className="text-2xl font-bold text-foreground">{confirmedCount}</p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                        <p className="text-xs text-muted-foreground">Checked In</p>
                        <p className="text-2xl font-bold text-foreground">{checkedInCount}</p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                        <p className="text-xs text-muted-foreground">Waiting Review</p>
                        <p className="text-2xl font-bold text-foreground">{waitingCount}</p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                        <p className="text-xs text-muted-foreground">Pending Payment</p>
                        <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                        <p className="text-xs text-muted-foreground">Revenue (Confirmed)</p>
                        <p className="text-2xl font-bold text-foreground">{formatPrice(totalRevenue)}</p>
                    </div>
                </div>

                {/* Filter */}
                <div className="flex flex-wrap gap-2">
                    {(['all', 'waiting_confirmation', 'confirmed', 'pending_payment', 'rejected', 'refunded'] as const).map((status) => {
                        const labels: Record<string, string> = {
                            all: `All (${orders.length})`,
                            waiting_confirmation: `Waiting (${waitingCount})`,
                            confirmed: `Confirmed (${confirmedCount})`,
                            pending_payment: `Pending (${pendingCount})`,
                            rejected: `Rejected (${orders.filter((o) => o.status === 'rejected').length})`,
                            refunded: `Refunded (${refundedCount})`,
                        };
                        return (
                            <Button
                                key={status}
                                variant={statusFilter === status ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setStatusFilter(status)}
                            >
                                {labels[status]}
                            </Button>
                        );
                    })}
                </div>

                {/* Registrants grouped by catalog */}
                {ordersByCatalog.map(({ catalog, orders: catalogOrders }) => (
                    <div key={catalog.id}>
                        <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h2 className="text-base font-semibold">{catalog.name}</h2>
                                <span className="text-sm text-muted-foreground">
                                    ({catalogOrders.length}{catalog.pivot?.max_participant ? ` / ${catalog.pivot.max_participant}` : ''})
                                </span>
                            </div>
                            <span className="text-sm font-medium">{formatPrice(catalog.price)}</span>
                        </div>

                        {catalogOrders.length === 0 ? (
                            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                                No registrants
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-lg border">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Customer</th>
                                            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Order Code</th>
                                            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Add-ons</th>
                                            <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Total</th>
                                            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Status</th>
                                            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Date</th>
                                            <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {catalogOrders.map((order) => {
                                            const config = statusConfig[order.status];
                                            return (
                                                <tr key={order.id} className="border-b last:border-0">
                                                    <td className="px-4 py-3">
                                                        {order.customer && (
                                                            <div className="flex items-center gap-2">
                                                                {order.customer.avatar ? (
                                                                    <img src={order.customer.avatar} alt={order.customer.name} className="size-6 rounded-full" />
                                                                ) : (
                                                                    <div className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                                                                        {order.customer.name.charAt(0).toUpperCase()}
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <p className="font-medium">{order.customer.name}</p>
                                                                    <p className="text-xs text-muted-foreground">{order.customer.email}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="font-mono text-xs">{order.order_code}</span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {order.addons && order.addons.length > 0 ? (
                                                            <div className="flex flex-wrap gap-1">
                                                                {order.addons.map((addon) => (
                                                                    <Badge key={addon.id} variant="outline" className="text-xs">
                                                                        {addon.pivot?.addon_name || addon.name}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-medium">
                                                        {formatPrice(order.total_amount)}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex flex-wrap gap-1">
                                                            <Badge variant={config.variant}>{config.label}</Badge>
                                                            {order.checked_in_at && (
                                                                <Badge variant="default" className="bg-green-600">Checked In</Badge>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-xs text-muted-foreground">
                                                        {formatDate(order.created_at)}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="outline" size="sm">Action</Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => router.visit(orderShow.url(order.id))}>
                                                                    Detail
                                                                </DropdownMenuItem>
                                                                {order.payment_proof && (
                                                                    <DropdownMenuItem onClick={() => setProofImage(`/storage/${order.payment_proof}`)}>
                                                                        View Payment Proof
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {order.status === 'waiting_confirmation' && (
                                                                    <>
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuItem onClick={() => handleConfirm(order.id)}>
                                                                            Confirm Payment
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem
                                                                            className="text-destructive focus:text-destructive"
                                                                            onClick={() => setRejectOrderId(order.id)}
                                                                        >
                                                                            Reject Payment
                                                                        </DropdownMenuItem>
                                                                    </>
                                                                )}
                                                                {order.status === 'confirmed' && (
                                                                    <>
                                                                        <DropdownMenuSeparator />
                                                                        {!order.checked_in_at ? (
                                                                            <DropdownMenuItem
                                                                                onClick={() => {
                                                                                    router.post(checkIn.url(order.id), {}, {
                                                                                        preserveScroll: true,
                                                                                        onSuccess: () => router.reload(),
                                                                                    });
                                                                                }}
                                                                            >
                                                                                Check In
                                                                            </DropdownMenuItem>
                                                                        ) : (
                                                                            <DropdownMenuItem
                                                                                onClick={() => {
                                                                                    router.post(undoCheckIn.url(order.id), {}, {
                                                                                        preserveScroll: true,
                                                                                        onSuccess: () => router.reload(),
                                                                                    });
                                                                                }}
                                                                            >
                                                                                Undo Check In
                                                                            </DropdownMenuItem>
                                                                        )}
                                                                        <DropdownMenuItem
                                                                            className="text-destructive focus:text-destructive"
                                                                            onClick={() => setRefundOrderId(order.id)}
                                                                        >
                                                                            Refund
                                                                        </DropdownMenuItem>
                                                                    </>
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ))}

                {uncategorized.length > 0 && (
                    <div>
                        <h2 className="mb-3 text-base font-semibold">Other</h2>
                        <p className="text-sm text-muted-foreground">{uncategorized.length} orders</p>
                    </div>
                )}

                {orders.length === 0 && (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
                        <Users className="mb-3 size-8 text-muted-foreground/50" />
                        <p className="text-sm font-medium text-muted-foreground">No registrants yet</p>
                        <p className="mt-1 text-xs text-muted-foreground/70">Registrants will appear here once customers place orders</p>
                    </div>
                )}
            </div>
        </>
    );
}

EventRegistrants.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
