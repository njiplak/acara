import { router, useForm } from '@inertiajs/react';
import { CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { confirm, index, reject } from '@/routes/backoffice/operational/subscription-order';
import type { SubscriptionOrder, SubscriptionOrderStatus } from '@/types/subscription';

function formatPrice(price: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
}

function formatDate(date: string) {
    return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const statusConfig: Record<SubscriptionOrderStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    pending_payment: { label: 'Pending Payment', variant: 'outline' },
    waiting_confirmation: { label: 'Waiting Confirmation', variant: 'secondary' },
    confirmed: { label: 'Confirmed', variant: 'default' },
    rejected: { label: 'Rejected', variant: 'destructive' },
    cancelled: { label: 'Cancelled', variant: 'outline' },
};

type Props = {
    order: SubscriptionOrder & {
        confirmed_by_user?: { name: string } | null;
    };
};

export default function SubscriptionOrderShow({ order }: Props) {
    const config = statusConfig[order.status];
    const [showRejectForm, setShowRejectForm] = useState(false);
    const rejectForm = useForm({ rejection_reason: '' });

    const handleConfirm = () => {
        if (!window.confirm('Confirm this subscription? This will activate the membership for this customer.')) return;
        router.post(confirm.url(order.id));
    };

    const handleReject = (e: React.FormEvent) => {
        e.preventDefault();
        rejectForm.post(reject.url(order.id));
    };

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <span className="font-mono text-xs text-muted-foreground">{order.order_code}</span>
                    <h1 className="text-xl font-semibold">Subscription Order</h1>
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

            {/* Plan Details */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <h2 className="mb-3 text-sm font-semibold">Plan Details</h2>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Plan</span>
                        <span className="text-sm font-medium">{order.plan?.name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Type</span>
                        <Badge variant="outline" className="capitalize">{order.type}</Badge>
                    </div>
                    {order.plan && (
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Billing Cycle</span>
                            <span className="text-sm">{order.plan.periodicity} {order.plan.periodicity_type}</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Plan Price</span>
                        <span className="text-sm">{formatPrice(order.plan?.price ?? 0)}</span>
                    </div>
                    {order.pro_rate_credit > 0 && (
                        <div className="flex justify-between text-green-600 dark:text-green-400">
                            <span className="text-sm">Pro-rate Credit</span>
                            <span className="text-sm">-{formatPrice(order.pro_rate_credit)}</span>
                        </div>
                    )}
                    <div className="border-t pt-2">
                        <div className="flex justify-between">
                            <span className="text-sm font-semibold">Amount Due</span>
                            <span className="text-lg font-bold">{formatPrice(order.amount)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Info */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <h2 className="mb-3 text-sm font-semibold">Payment</h2>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Gateway</span>
                        <Badge variant="outline" className="capitalize">{order.payment_gateway}</Badge>
                    </div>
                    {order.paid_at && (
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Paid at</span>
                            <span className="text-sm">{formatDate(order.paid_at)}</span>
                        </div>
                    )}
                    {order.confirmed_at && (
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Confirmed at</span>
                            <span className="text-sm">{formatDate(order.confirmed_at)}</span>
                        </div>
                    )}
                    {order.confirmed_by_user && (
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Confirmed by</span>
                            <span className="text-sm">{order.confirmed_by_user.name}</span>
                        </div>
                    )}
                    {order.rejection_reason && (
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Rejection reason</span>
                            <span className="text-sm text-destructive">{order.rejection_reason}</span>
                        </div>
                    )}
                </div>
            </div>

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
                            Confirm & Activate
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

            <div>
                <Button variant="outline" onClick={() => router.visit(index().url)}>
                    Back to List
                </Button>
            </div>
        </div>
    );
}

SubscriptionOrderShow.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
