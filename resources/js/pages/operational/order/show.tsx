import { router, useForm } from '@inertiajs/react';
import { Calendar, CheckCircle, ScanLine, XCircle } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { checkIn, confirm, index, refund, reject, undoCheckIn } from '@/routes/backoffice/operational/order';
import type { Order, OrderStatus } from '@/types/order';

function formatPrice(price: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
}

function formatDate(date: string) {
    return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const statusConfig: Record<OrderStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    pending_payment: { label: 'Pending Payment', variant: 'outline' },
    waiting_confirmation: { label: 'Waiting Confirmation', variant: 'secondary' },
    confirmed: { label: 'Confirmed', variant: 'default' },
    rejected: { label: 'Rejected', variant: 'destructive' },
    cancelled: { label: 'Cancelled', variant: 'outline' },
    refunded: { label: 'Refunded', variant: 'secondary' },
};

type Props = {
    order: Order;
};

export default function OrderShow({ order }: Props) {
    const config = statusConfig[order.status];
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [showRefundForm, setShowRefundForm] = useState(false);
    const rejectForm = useForm({ rejection_reason: '' });
    const refundForm = useForm({ refund_reason: '' });

    const handleConfirm = () => {
        if (!window.confirm('Confirm this order? This will mark the payment as verified.')) return;
        router.post(confirm.url(order.id));
    };

    const handleReject = (e: React.FormEvent) => {
        e.preventDefault();
        rejectForm.post(reject.url(order.id));
    };

    const handleRefund = (e: React.FormEvent) => {
        e.preventDefault();
        refundForm.post(refund.url(order.id));
    };

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <span className="font-mono text-xs text-muted-foreground">{order.order_code}</span>
                    <h1 className="text-xl font-semibold">Order Detail</h1>
                </div>
                <Badge variant={config.variant}>{config.label}</Badge>
            </div>

            {/* Customer */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <h2 className="mb-3 text-sm font-semibold">Customer</h2>
                {order.customer && (
                    <div className="flex items-center gap-3">
                        {order.customer.avatar ? (
                            <img src={order.customer.avatar} alt={order.customer.name} className="size-10 rounded-full" />
                        ) : (
                            <div className="flex size-10 items-center justify-center rounded-full bg-muted text-sm font-medium">
                                {order.customer.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <p className="font-medium">{order.customer.name}</p>
                            <p className="text-sm text-muted-foreground">{order.customer.email}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Event & Session */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <h2 className="mb-3 text-sm font-semibold">Event & Session</h2>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Event</span>
                        <span className="text-sm font-medium">{order.event?.name}</span>
                    </div>
                    {order.event && (
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Date</span>
                            <div className="flex items-center gap-1.5 text-sm">
                                <Calendar className="size-3.5" />
                                <span>{formatDate(order.event.start_date)}</span>
                            </div>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Session</span>
                        <span className="text-sm font-medium">{order.catalog?.name}</span>
                    </div>
                </div>
            </div>

            {/* Pricing */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <h2 className="mb-3 text-sm font-semibold">Pricing</h2>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">{order.catalog?.name}</span>
                        <span className="text-sm">{formatPrice(order.catalog_price)}</span>
                    </div>
                    {order.addons && order.addons.length > 0 && order.addons.map((addon) => (
                        <div key={addon.id} className="flex justify-between">
                            <span className="text-sm text-muted-foreground">{addon.pivot?.addon_name || addon.name}</span>
                            <span className="text-sm">{formatPrice(addon.pivot?.addon_price || addon.price)}</span>
                        </div>
                    ))}
                    {order.voucher_discount > 0 && (
                        <div className="flex justify-between text-green-600 dark:text-green-400">
                            <span className="text-sm">Promo discount{order.voucher ? ` (${order.voucher.code})` : ''}</span>
                            <span className="text-sm">-{formatPrice(order.voucher_discount)}</span>
                        </div>
                    )}
                    {order.referral_discount > 0 && (
                        <div className="flex justify-between text-green-600 dark:text-green-400">
                            <span className="text-sm">Referral discount</span>
                            <span className="text-sm">-{formatPrice(order.referral_discount)}</span>
                        </div>
                    )}
                    {order.balance_used > 0 && (
                        <div className="flex justify-between text-green-600 dark:text-green-400">
                            <span className="text-sm">Balance used</span>
                            <span className="text-sm">-{formatPrice(order.balance_used)}</span>
                        </div>
                    )}
                    <div className="border-t pt-2">
                        <div className="flex justify-between">
                            <span className="text-sm font-semibold">Total</span>
                            <span className="text-lg font-bold">{formatPrice(order.total_amount)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Referral info */}
            {order.referrer && (
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                    <h2 className="mb-3 text-sm font-semibold">Referral</h2>
                    <div className="flex items-center gap-3">
                        {order.referrer.avatar ? (
                            <img src={order.referrer.avatar} alt={order.referrer.name} className="size-8 rounded-full" />
                        ) : (
                            <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                                {order.referrer.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <p className="text-sm font-medium">Referred by {order.referrer.name}</p>
                            <p className="text-xs text-muted-foreground">{order.referrer.email}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Proof */}
            {order.payment_proof && (
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                    <h2 className="mb-3 text-sm font-semibold">Payment Proof</h2>
                    <img
                        src={`/storage/${order.payment_proof}`}
                        alt="Payment proof"
                        className="max-h-80 rounded-md border"
                    />
                    {order.paid_at && (
                        <p className="mt-2 text-xs text-muted-foreground">Submitted {formatDate(order.paid_at)}</p>
                    )}
                </div>
            )}

            {/* Admin Actions */}
            {order.status === 'waiting_confirmation' && (
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                    <h2 className="mb-3 text-sm font-semibold">Actions</h2>
                    <div className="flex gap-3">
                        <Button onClick={handleConfirm} className="gap-2">
                            <CheckCircle className="size-4" />
                            Confirm Payment
                        </Button>
                        <Button variant="outline" onClick={() => setShowRejectForm(!showRejectForm)} className="gap-2 text-destructive hover:text-destructive">
                            <XCircle className="size-4" />
                            Reject
                        </Button>
                    </div>

                    {showRejectForm && (
                        <form onSubmit={handleReject} className="mt-4 space-y-3">
                            <Textarea
                                placeholder="Reason for rejection..."
                                value={rejectForm.data.rejection_reason}
                                onChange={(e) => rejectForm.setData('rejection_reason', e.target.value)}
                                rows={3}
                            />
                            {rejectForm.errors.rejection_reason && (
                                <p className="text-xs text-destructive">{rejectForm.errors.rejection_reason}</p>
                            )}
                            <Button type="submit" variant="destructive" disabled={rejectForm.processing || !rejectForm.data.rejection_reason}>
                                {rejectForm.processing ? 'Rejecting...' : 'Confirm Rejection'}
                            </Button>
                        </form>
                    )}
                </div>
            )}

            {/* Check-in status & actions */}
            {order.status === 'confirmed' && (
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                    <h2 className="mb-3 text-sm font-semibold">Check-in</h2>
                    {order.checked_in_at ? (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                <CheckCircle className="size-4" />
                                <span className="text-sm font-medium">Checked in at {formatDate(order.checked_in_at)}</span>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.post(undoCheckIn.url(order.id))}
                            >
                                Undo Check In
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Not checked in yet</span>
                            <Button
                                size="sm"
                                className="gap-2"
                                onClick={() => router.post(checkIn.url(order.id))}
                            >
                                <ScanLine className="size-4" />
                                Check In
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* Invoice download for confirmed orders */}
            {order.status === 'confirmed' && (
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                    <h2 className="mb-3 text-sm font-semibold">Invoice</h2>
                    <a
                        href={`/operational/order/${order.id}/invoice`}
                        className="inline-flex items-center gap-2 text-sm font-medium text-foreground underline underline-offset-2 hover:no-underline"
                    >
                        Download Invoice (PDF)
                    </a>
                </div>
            )}

            {/* Refund action for confirmed orders */}
            {order.status === 'confirmed' && (
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                    <h2 className="mb-3 text-sm font-semibold">Actions</h2>
                    <Button variant="outline" onClick={() => setShowRefundForm(!showRefundForm)} className="gap-2 text-destructive hover:text-destructive">
                        <XCircle className="size-4" />
                        Refund
                    </Button>

                    {showRefundForm && (
                        <form onSubmit={handleRefund} className="mt-4 space-y-3">
                            <Textarea
                                placeholder="Reason for refund..."
                                value={refundForm.data.refund_reason}
                                onChange={(e) => refundForm.setData('refund_reason', e.target.value)}
                                rows={3}
                            />
                            {refundForm.errors.refund_reason && (
                                <p className="text-xs text-destructive">{refundForm.errors.refund_reason}</p>
                            )}
                            <Button type="submit" variant="destructive" disabled={refundForm.processing || !refundForm.data.refund_reason}>
                                {refundForm.processing ? 'Processing...' : 'Confirm Refund'}
                            </Button>
                        </form>
                    )}
                </div>
            )}

            {/* Confirmation info */}
            {order.confirmed_at && (
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                    <h2 className="mb-3 text-sm font-semibold">Confirmation</h2>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Confirmed at</span>
                            <span className="text-sm">{formatDate(order.confirmed_at)}</span>
                        </div>
                        {order.confirmed_by_user && (
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Confirmed by</span>
                                <span className="text-sm">{order.confirmed_by_user.name}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Rejection info */}
            {order.rejection_reason && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-900 dark:bg-red-950">
                    <h2 className="mb-2 text-sm font-semibold text-red-800 dark:text-red-200">Rejection Reason</h2>
                    <p className="text-sm text-red-700 dark:text-red-300">{order.rejection_reason}</p>
                </div>
            )}

            {/* Refund info */}
            {order.refund_reason && (
                <div className="rounded-xl border border-purple-200 bg-purple-50 p-5 dark:border-purple-900 dark:bg-purple-950">
                    <h2 className="mb-2 text-sm font-semibold text-purple-800 dark:text-purple-200">Refund Reason</h2>
                    <p className="text-sm text-purple-700 dark:text-purple-300">{order.refund_reason}</p>
                    {order.refunded_at && (
                        <p className="mt-2 text-xs text-purple-600 dark:text-purple-400">Refunded on {formatDate(order.refunded_at)}</p>
                    )}
                </div>
            )}

            {/* Timestamps */}
            <div className="text-xs text-muted-foreground">
                <p>Created: {formatDate(order.created_at)}</p>
            </div>

            {/* Back button */}
            <div>
                <Button variant="outline" onClick={() => router.visit(index().url)}>
                    Back
                </Button>
            </div>
        </div>
    );
}

OrderShow.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
