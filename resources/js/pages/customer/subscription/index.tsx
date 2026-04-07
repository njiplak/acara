import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Check, Clock, Crown, LoaderCircle, Upload, X, XCircle } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { logout } from '@/actions/App/Http/Controllers/Auth/CustomerAuthController';
import { index as ordersIndex } from '@/actions/App/Http/Controllers/Customer/OrderController';
import { show as profileShow } from '@/actions/App/Http/Controllers/Customer/ProfileController';
import {
    subscribe,
    uploadProof,
    cancel as cancelOrder,
    cancelSubscription,
} from '@/actions/App/Http/Controllers/Customer/SubscriptionController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { SharedData } from '@/types';
import type { Subscription, SubscriptionOrder, SubscriptionOrderStatus, SubscriptionPlan } from '@/types/subscription';

function formatPrice(price: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
}

function formatDate(date: string) {
    return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

const orderStatusConfig: Record<SubscriptionOrderStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    pending_payment: { label: 'Pending Payment', variant: 'outline' },
    waiting_confirmation: { label: 'Waiting Confirmation', variant: 'secondary' },
    confirmed: { label: 'Confirmed', variant: 'default' },
    rejected: { label: 'Rejected', variant: 'destructive' },
    cancelled: { label: 'Cancelled', variant: 'outline' },
};

export default function CustomerSubscriptionIndex({
    plans,
    subscription,
    pendingOrder,
    recentOrders,
}: {
    plans: SubscriptionPlan[];
    subscription: Subscription | null;
    pendingOrder: SubscriptionOrder | null;
    recentOrders: SubscriptionOrder[];
}) {
    const { auth, name } = usePage<SharedData>().props;
    const customer = auth.customer!;
    const appName = (name as string) || 'Acara';
    const [processing, setProcessing] = useState<number | null>(null);
    const [showCancelSubDialog, setShowCancelSubDialog] = useState(false);
    const [cancelSubProcessing, setCancelSubProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const proofForm = useForm<{ payment_proof: File | null }>({
        payment_proof: null,
    });

    const handleSubscribe = (planId: number) => {
        setProcessing(planId);
        router.post(
            subscribe.url(),
            { plan_id: planId },
            {
                onSuccess: () => toast.success('Subscription order created'),
                onError: (err) => toast.error(err.errors || 'Something went wrong'),
                onFinish: () => setProcessing(null),
            },
        );
    };

    const handleUploadProof = (e: React.FormEvent) => {
        e.preventDefault();
        if (!proofForm.data.payment_proof || !pendingOrder) return;
        proofForm.post(uploadProof.url(pendingOrder.id), {
            forceFormData: true,
            onSuccess: () => toast.success('Payment proof uploaded'),
            onError: (err) => toast.error(err.errors || 'Upload failed'),
        });
    };

    const handleCancelOrder = (orderId: number) => {
        if (!confirm('Cancel this subscription order?')) return;
        router.post(cancelOrder.url(orderId), {}, {
            onSuccess: () => toast.success('Order cancelled'),
            onError: (err) => toast.error(err.errors || 'Something went wrong'),
        });
    };

    const handleCancelSubscription = () => {
        setCancelSubProcessing(true);
        router.post(cancelSubscription.url(), {}, {
            onSuccess: () => {
                toast.success('Subscription cancelled');
                setShowCancelSubDialog(false);
            },
            onError: (err) => toast.error(err.errors || 'Something went wrong'),
            onFinish: () => setCancelSubProcessing(false),
        });
    };

    const currentPlanId = subscription?.plan_id;
    const isCanceled = !!subscription?.canceled_at;
    const hasPendingOrder = !!pendingOrder;

    return (
        <>
            <Head>
                <title>{`Membership - ${appName}`}</title>
            </Head>

            <div className="relative flex min-h-svh flex-col bg-background">
                <div className="h-px w-full bg-border" />

                <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:px-12">
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="flex size-8 items-center justify-center rounded-md bg-foreground">
                            <span className="text-sm font-bold tracking-tight text-background">{appName.charAt(0)}</span>
                        </div>
                        <span className="text-lg font-semibold tracking-tight text-foreground">{appName}</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <Link
                            href={profileShow.url()}
                            className="flex items-center gap-2 rounded-md px-2 py-1 transition-colors hover:bg-accent"
                        >
                            {customer.avatar ? (
                                <img src={customer.avatar} alt={customer.name} className="size-7 rounded-full" />
                            ) : (
                                <div className="flex size-7 items-center justify-center rounded-full bg-muted text-xs font-medium">
                                    {customer.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <span className="hidden text-sm font-medium sm:inline">{customer.name}</span>
                        </Link>
                        <Button variant="outline" size="sm" onClick={() => router.post(logout.url())}>
                            Logout
                        </Button>
                    </div>
                </header>

                <main className="flex-1 px-6 py-8 lg:px-12 lg:py-12">
                    <div className="mx-auto max-w-4xl">
                        <Link
                            href={ordersIndex.url()}
                            className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            <ArrowLeft className="size-3.5" />
                            Back to Orders
                        </Link>

                        <div className="mb-8">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">Membership</h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Choose a plan to unlock exclusive access and features
                            </p>
                        </div>

                        {/* Current subscription */}
                        {subscription && !isCanceled && (
                            <div className="mb-6 rounded-lg border bg-card p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Crown className="size-5 text-amber-500" />
                                        <div>
                                            <p className="text-sm font-semibold">
                                                Current Plan: {subscription.plan?.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {subscription.expired_at
                                                    ? `Expires ${formatDate(subscription.expired_at)}`
                                                    : 'Active'}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                        onClick={() => setShowCancelSubDialog(true)}
                                    >
                                        <X className="mr-1 size-3.5" />
                                        Cancel
                                    </Button>
                                </div>

                                {subscription.plan?.features && subscription.plan.features.length > 0 && (
                                    <div className="mt-3 border-t pt-3">
                                        <p className="mb-2 text-xs font-medium text-muted-foreground">Your Features</p>
                                        <div className="flex flex-wrap gap-2">
                                            {subscription.plan.features.map((f: any) => (
                                                <Badge key={f.id} variant="secondary">
                                                    {f.description || f.name}
                                                    {f.consumable && f.pivot?.charges && ` (${f.pivot.charges}x)`}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Pending order banner */}
                        {pendingOrder && (
                            <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3">
                                        <Clock className="mt-0.5 size-5 text-amber-600 dark:text-amber-400" />
                                        <div>
                                            <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                                                {pendingOrder.status === 'pending_payment'
                                                    ? 'Payment Required'
                                                    : pendingOrder.status === 'waiting_confirmation'
                                                      ? 'Waiting for Admin Confirmation'
                                                      : 'Order ' + pendingOrder.status}
                                            </p>
                                            <p className="mt-0.5 text-sm text-amber-800 dark:text-amber-200">
                                                {pendingOrder.plan?.name} — {formatPrice(pendingOrder.amount)}
                                                {pendingOrder.pro_rate_credit > 0 && (
                                                    <span className="text-xs"> (Pro-rate credit: {formatPrice(pendingOrder.pro_rate_credit)})</span>
                                                )}
                                            </p>
                                            <p className="mt-0.5 font-mono text-xs text-amber-600 dark:text-amber-400">
                                                {pendingOrder.order_code}
                                            </p>
                                        </div>
                                    </div>
                                    {pendingOrder.status === 'pending_payment' && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-amber-700 hover:text-amber-900 dark:text-amber-300"
                                            onClick={() => handleCancelOrder(pendingOrder.id)}
                                        >
                                            Cancel
                                        </Button>
                                    )}
                                </div>

                                {/* Upload proof form */}
                                {pendingOrder.status === 'pending_payment' && (
                                    <form onSubmit={handleUploadProof} className="mt-4 border-t border-amber-200 pt-4 dark:border-amber-800">
                                        <p className="mb-2 text-xs font-medium text-amber-800 dark:text-amber-200">Upload Payment Proof</p>
                                        <div className="flex items-center gap-3">
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => proofForm.setData('payment_proof', e.target.files?.[0] ?? null)}
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="border-amber-300 bg-white text-amber-900 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-900 dark:text-amber-100"
                                            >
                                                <Upload className="mr-1.5 size-3.5" />
                                                {proofForm.data.payment_proof ? proofForm.data.payment_proof.name : 'Choose File'}
                                            </Button>
                                            {proofForm.data.payment_proof && (
                                                <Button type="submit" size="sm" disabled={proofForm.processing}>
                                                    {proofForm.processing && <LoaderCircle className="mr-1 size-3.5 animate-spin" />}
                                                    Upload
                                                </Button>
                                            )}
                                        </div>
                                    </form>
                                )}

                                {/* Show uploaded proof */}
                                {pendingOrder.status === 'waiting_confirmation' && pendingOrder.payment_proof && (
                                    <div className="mt-4 border-t border-amber-200 pt-4 dark:border-amber-800">
                                        <p className="mb-2 text-xs font-medium text-amber-800 dark:text-amber-200">Payment Proof Submitted</p>
                                        <img
                                            src={`/storage/${pendingOrder.payment_proof}`}
                                            alt="Payment proof"
                                            className="max-h-40 rounded-md border border-amber-200 dark:border-amber-700"
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Rejected order banner */}
                        {pendingOrder && pendingOrder.status === 'rejected' as any && (
                            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
                                <div className="flex items-start gap-3">
                                    <XCircle className="mt-0.5 size-5 text-red-600 dark:text-red-400" />
                                    <div>
                                        <p className="text-sm font-semibold text-red-900 dark:text-red-100">Payment Rejected</p>
                                        {pendingOrder.rejection_reason && (
                                            <p className="mt-0.5 text-sm text-red-800 dark:text-red-200">{pendingOrder.rejection_reason}</p>
                                        )}
                                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">You can re-upload payment proof or cancel this order.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Plan cards */}
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {plans.map((plan) => {
                                const isCurrentPlan = plan.id === currentPlanId && !isCanceled;
                                const isUpgrade = currentPlanId && !isCanceled && plan.price > (subscription?.plan?.price ?? 0);

                                return (
                                    <div
                                        key={plan.id}
                                        className={`relative flex flex-col rounded-xl border bg-card p-6 transition-shadow hover:shadow-md ${isCurrentPlan ? 'border-primary ring-2 ring-primary/20' : ''}`}
                                    >
                                        {isCurrentPlan && (
                                            <Badge className="absolute -top-2.5 left-4">Current Plan</Badge>
                                        )}

                                        <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                                        {plan.description && (
                                            <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                                        )}

                                        <div className="mt-4">
                                            <span className="text-3xl font-bold tracking-tight">{formatPrice(plan.price)}</span>
                                            <span className="text-sm text-muted-foreground">
                                                /{plan.periodicity} {plan.periodicity_type?.toLowerCase()}
                                            </span>
                                        </div>

                                        {plan.features && plan.features.length > 0 && (
                                            <ul className="mt-4 flex-1 space-y-2">
                                                {plan.features.map((f) => (
                                                    <li key={f.id} className="flex items-center gap-2 text-sm">
                                                        <Check className="size-4 shrink-0 text-green-600" />
                                                        <span>
                                                            {f.description || f.name}
                                                            {f.consumable && f.pivot?.charges && (
                                                                <span className="text-muted-foreground"> ({f.pivot.charges}x)</span>
                                                            )}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}

                                        <div className="mt-6">
                                            {isCurrentPlan ? (
                                                <Button disabled className="w-full" variant="outline">
                                                    Current Plan
                                                </Button>
                                            ) : (
                                                <Button
                                                    className="w-full"
                                                    disabled={processing !== null || hasPendingOrder}
                                                    onClick={() => handleSubscribe(plan.id)}
                                                >
                                                    {processing === plan.id && <LoaderCircle className="mr-1 size-4 animate-spin" />}
                                                    {isUpgrade ? 'Upgrade' : 'Subscribe'}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {plans.length === 0 && (
                            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
                                <Crown className="mb-3 size-8 text-muted-foreground/50" />
                                <p className="text-sm font-medium text-muted-foreground">No plans available yet</p>
                            </div>
                        )}

                        {/* Order history */}
                        {recentOrders.length > 0 && (
                            <div className="mt-10">
                                <h2 className="mb-4 text-lg font-semibold">Order History</h2>
                                <div className="space-y-2">
                                    {recentOrders.map((order) => {
                                        const cfg = orderStatusConfig[order.status];
                                        return (
                                            <div
                                                key={order.id}
                                                className="flex items-center justify-between rounded-lg border bg-card p-3"
                                            >
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-xs text-muted-foreground">{order.order_code}</span>
                                                        <Badge variant={cfg.variant}>{cfg.label}</Badge>
                                                        <Badge variant="outline" className="text-xs capitalize">{order.type}</Badge>
                                                    </div>
                                                    <p className="mt-1 text-sm font-medium">{order.plan?.name}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold">{formatPrice(order.amount)}</p>
                                                    <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            <AlertDialog open={showCancelSubDialog} onOpenChange={setShowCancelSubDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to cancel your membership? You will lose access to your plan benefits.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Keep Membership</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleCancelSubscription}
                            disabled={cancelSubProcessing}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {cancelSubProcessing && <LoaderCircle className="mr-1 size-4 animate-spin" />}
                            Cancel Subscription
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
