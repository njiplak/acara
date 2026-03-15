import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Calendar, ClipboardList } from 'lucide-react';
import { logout } from '@/actions/App/Http/Controllers/Auth/CustomerAuthController';
import { show } from '@/actions/App/Http/Controllers/Customer/OrderController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { SharedData } from '@/types';
import type { Order, OrderStatus } from '@/types/order';

function formatPrice(price: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
}

function formatDate(date: string) {
    return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

const statusConfig: Record<OrderStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    pending_payment: { label: 'Pending Payment', variant: 'outline' },
    waiting_confirmation: { label: 'Waiting Confirmation', variant: 'secondary' },
    confirmed: { label: 'Confirmed', variant: 'default' },
    rejected: { label: 'Rejected', variant: 'destructive' },
    cancelled: { label: 'Cancelled', variant: 'outline' },
    refunded: { label: 'Refunded', variant: 'secondary' },
};

export default function CustomerOrdersIndex({ orders }: { orders: Order[] }) {
    const { auth, name } = usePage<SharedData>().props;
    const customer = auth.customer!;
    const appName = (name as string) || 'Acara';

    return (
        <>
            <Head>
                <title>{`My Orders - ${appName}`}</title>
            </Head>

            <div className="relative flex min-h-svh flex-col bg-background">
                <div className="h-px w-full bg-border" />

                {/* Header */}
                <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:px-12">
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="flex size-8 items-center justify-center rounded-md bg-foreground">
                            <span className="text-sm font-bold tracking-tight text-background">{appName.charAt(0)}</span>
                        </div>
                        <span className="text-lg font-semibold tracking-tight text-foreground">{appName}</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            {customer.avatar ? (
                                <img src={customer.avatar} alt={customer.name} className="size-7 rounded-full" />
                            ) : (
                                <div className="flex size-7 items-center justify-center rounded-full bg-muted text-xs font-medium">
                                    {customer.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <span className="hidden text-sm font-medium sm:inline">{customer.name}</span>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.post(logout.url())}
                        >
                            Logout
                        </Button>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 px-6 py-8 lg:px-12 lg:py-12">
                    <div className="mx-auto max-w-3xl">
                        <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
                            <ArrowLeft className="size-3.5" />
                            Back to Events
                        </Link>

                        <h1 className="mb-6 text-2xl font-bold tracking-tight text-foreground">My Orders</h1>

                        {orders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
                                <ClipboardList className="mb-3 size-8 text-muted-foreground/50" />
                                <p className="text-sm font-medium text-muted-foreground">No orders yet</p>
                                <p className="mt-1 text-xs text-muted-foreground/70">Browse events and register for a session</p>
                                <Button asChild variant="outline" size="sm" className="mt-4">
                                    <Link href="/">Browse Events</Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {orders.map((order) => {
                                    const config = statusConfig[order.status];
                                    return (
                                        <Link
                                            key={order.id}
                                            href={show.url({ order: order.id })}
                                            className="group flex flex-col gap-3 rounded-lg border bg-card p-4 transition-colors hover:border-foreground/20 hover:bg-accent/50 sm:flex-row sm:items-center sm:justify-between"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-mono text-muted-foreground">{order.order_code}</span>
                                                    <Badge variant={config.variant}>{config.label}</Badge>
                                                </div>
                                                <h3 className="mt-1.5 font-semibold text-foreground">{order.event?.name}</h3>
                                                <p className="text-sm text-muted-foreground">{order.catalog?.name}</p>
                                                {order.event && (
                                                    <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                                                        <Calendar className="size-3" />
                                                        <span>{formatDate(order.event.start_date)}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <span className="text-lg font-bold text-foreground">{formatPrice(order.total_amount)}</span>
                                                <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
}
