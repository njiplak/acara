import { Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from 'recharts';
import { AlertTriangle, BarChart3, Cake, Calendar, Check, ClipboardList, DollarSign, Gift, TrendingDown, TrendingUp, Users } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '@/components/ui/chart';
import AppLayout from '@/layouts/app-layout';
import { show as orderShow } from '@/routes/backoffice/operational/order';
import { registrants } from '@/routes/backoffice/master/event';
import type { Order, OrderStatus } from '@/types/order';
import type { Event } from '@/types/event';

function formatPrice(price: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
}

function formatCompactPrice(price: number) {
    if (price >= 1_000_000) return `Rp${(price / 1_000_000).toFixed(1)}M`;
    if (price >= 1_000) return `Rp${(price / 1_000).toFixed(0)}K`;
    return formatPrice(price);
}

function formatDate(date: string) {
    return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatShortDate(date: string) {
    return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

const statusConfig: Record<OrderStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; color: string }> = {
    pending_payment: { label: 'Pending', variant: 'outline', color: 'hsl(var(--muted-foreground))' },
    waiting_confirmation: { label: 'Waiting', variant: 'secondary', color: 'hsl(45 93% 47%)' },
    confirmed: { label: 'Confirmed', variant: 'default', color: 'hsl(142 71% 45%)' },
    rejected: { label: 'Rejected', variant: 'destructive', color: 'hsl(0 84% 60%)' },
    cancelled: { label: 'Cancelled', variant: 'outline', color: 'hsl(var(--muted-foreground) / 0.5)' },
    refunded: { label: 'Refunded', variant: 'secondary', color: 'hsl(280 60% 55%)' },
};

const revenueChartConfig: ChartConfig = {
    revenue: { label: 'Revenue', color: 'hsl(var(--primary))' },
};

const statusChartConfig: ChartConfig = {
    confirmed: { label: 'Confirmed', color: 'hsl(142 71% 45%)' },
    waiting_confirmation: { label: 'Waiting', color: 'hsl(45 93% 47%)' },
    pending_payment: { label: 'Pending', color: 'hsl(var(--muted-foreground))' },
    rejected: { label: 'Rejected', color: 'hsl(0 84% 60%)' },
    cancelled: { label: 'Cancelled', color: 'hsl(var(--muted-foreground) / 0.5)' },
    refunded: { label: 'Refunded', color: 'hsl(280 60% 55%)' },
};

type Stats = {
    totalRevenue: number;
    totalOrders: number;
    pendingReviewCount: number;
    totalCustomers: number;
    activeEvents: number;
};

type Trends = {
    revenue: number;
    orders: number;
    customers: number;
};

type LowFillEvent = {
    id: number;
    name: string;
    fillRate: number;
};

type Alerts = {
    waitingConfirmation: number;
    lowFillEvents: LowFillEvent[];
    draftEventsCount: number;
};

type TopReferrer = {
    referral_count: number;
    total_given: number;
    referrer: { id: number; name: string; referral_code: string };
};

type VoucherPerformanceItem = {
    uses: number;
    total_discount: number;
    voucher: { id: number; code: string; name: string };
};

type RevenueDataPoint = {
    date: string;
    revenue: number;
    orders: number;
};

type UpcomingEvent = Event & {
    confirmed_count: number;
    total_orders_count: number;
};

type BirthdayCustomer = {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    date_of_birth: string;
    has_birthday_voucher: boolean;
};

type Props = {
    stats: Stats;
    trends: Trends;
    alerts: Alerts;
    topReferrers: TopReferrer[];
    voucherPerformance: VoucherPerformanceItem[];
    revenueChart: RevenueDataPoint[];
    statusBreakdown: Record<string, number>;
    recentOrders: Order[];
    upcomingEvents: UpcomingEvent[];
    birthdayCustomers: BirthdayCustomer[];
};

function TrendIndicator({ value }: { value: number }) {
    if (value === 0) return <span className="text-xs text-muted-foreground">No change</span>;
    const isPositive = value > 0;
    return (
        <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {isPositive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {isPositive ? '+' : ''}{value}%
        </span>
    );
}

export default function Backoffice({ stats, trends, alerts, topReferrers, voucherPerformance, revenueChart, statusBreakdown, recentOrders, upcomingEvents, birthdayCustomers }: Props) {
    const pieData = Object.entries(statusBreakdown).map(([status, count]) => ({
        name: statusConfig[status as OrderStatus]?.label || status,
        value: count,
        fill: statusConfig[status as OrderStatus]?.color || 'hsl(var(--muted))',
    }));

    const totalOrdersInPie = pieData.reduce((sum, d) => sum + d.value, 0);

    const hasAlerts = alerts.waitingConfirmation > 0 || alerts.lowFillEvents.length > 0 || alerts.draftEventsCount > 0;

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-sm text-muted-foreground">Overview of your business</p>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader>
                        <CardDescription>Total Revenue</CardDescription>
                        <CardTitle className="text-2xl">{formatPrice(stats.totalRevenue)}</CardTitle>
                        <CardAction>
                            <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                                <DollarSign className="size-4 text-muted-foreground" />
                            </div>
                        </CardAction>
                    </CardHeader>
                    <CardFooter>
                        <TrendIndicator value={trends.revenue} />
                        <span className="ml-1 text-xs text-muted-foreground">vs last 30 days</span>
                    </CardFooter>
                </Card>
                <Card>
                    <CardHeader>
                        <CardDescription>Total Orders</CardDescription>
                        <CardTitle className="text-2xl">{stats.totalOrders}</CardTitle>
                        <CardAction>
                            <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                                <ClipboardList className="size-4 text-muted-foreground" />
                            </div>
                        </CardAction>
                    </CardHeader>
                    <CardFooter>
                        <TrendIndicator value={trends.orders} />
                        <span className="ml-1 text-xs text-muted-foreground">vs last 30 days</span>
                    </CardFooter>
                </Card>
                <Card>
                    <CardHeader>
                        <CardDescription>Customers</CardDescription>
                        <CardTitle className="text-2xl">{stats.totalCustomers}</CardTitle>
                        <CardAction>
                            <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                                <Users className="size-4 text-muted-foreground" />
                            </div>
                        </CardAction>
                    </CardHeader>
                    <CardFooter>
                        <TrendIndicator value={trends.customers} />
                        <span className="ml-1 text-xs text-muted-foreground">vs last 30 days</span>
                    </CardFooter>
                </Card>
                <Card>
                    <CardHeader>
                        <CardDescription>Active Events</CardDescription>
                        <CardTitle className="text-2xl">{stats.activeEvents}</CardTitle>
                        <CardAction>
                            <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                                <Calendar className="size-4 text-muted-foreground" />
                            </div>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="text-xs text-muted-foreground">
                        Published &amp; upcoming
                    </CardFooter>
                </Card>
            </div>

            {/* Needs Attention */}
            {hasAlerts && (
                <Card className="border-amber-200 dark:border-amber-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <AlertTriangle className="size-4 text-amber-500" />
                            Needs Attention
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {alerts.waitingConfirmation > 0 && (
                                <div className="flex items-center justify-between rounded-md bg-amber-50 px-3 py-2 dark:bg-amber-950/30">
                                    <span className="text-sm">
                                        <span className="font-semibold">{alerts.waitingConfirmation}</span> order{alerts.waitingConfirmation > 1 ? 's' : ''} waiting confirmation
                                    </span>
                                    <Button variant="outline" size="xs" asChild>
                                        <Link href="/backoffice/operational/order">Review</Link>
                                    </Button>
                                </div>
                            )}
                            {alerts.lowFillEvents.length > 0 && (
                                <div className="rounded-md bg-amber-50 px-3 py-2 dark:bg-amber-950/30">
                                    <p className="mb-1 text-sm">
                                        <span className="font-semibold">{alerts.lowFillEvents.length}</span> event{alerts.lowFillEvents.length > 1 ? 's' : ''} with low fill rate (&lt;30%)
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {alerts.lowFillEvents.map((e) => (
                                            <Badge key={e.id} variant="outline" className="text-xs">
                                                {e.name} ({e.fillRate}%)
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {alerts.draftEventsCount > 0 && (
                                <div className="flex items-center justify-between rounded-md bg-amber-50 px-3 py-2 dark:bg-amber-950/30">
                                    <span className="text-sm">
                                        <span className="font-semibold">{alerts.draftEventsCount}</span> draft event{alerts.draftEventsCount > 1 ? 's' : ''} not yet published
                                    </span>
                                    <Button variant="outline" size="xs" asChild>
                                        <Link href="/backoffice/master/event">View</Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Today's Birthdays */}
            {birthdayCustomers.length > 0 && (
                <Card className="border-pink-200 dark:border-pink-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Cake className="size-4 text-pink-500" />
                            Today's Birthdays
                        </CardTitle>
                        <CardDescription>{birthdayCustomers.length} customer{birthdayCustomers.length > 1 ? 's' : ''} celebrating today</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {birthdayCustomers.map((bc) => (
                                <BirthdayCustomerRow key={bc.id} customer={bc} />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Charts row */}
            <div className="grid gap-4 lg:grid-cols-3">
                {/* Revenue chart */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base">Revenue (Last 30 Days)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={revenueChartConfig} className="h-64 w-full">
                            <AreaChart data={revenueChart} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                                <defs>
                                    <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    tickFormatter={(value) => formatShortDate(value)}
                                    interval="preserveStartEnd"
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    tickFormatter={(value) => formatCompactPrice(value)}
                                    width={60}
                                />
                                <ChartTooltip
                                    content={
                                        <ChartTooltipContent
                                            labelFormatter={(value) => formatDate(value)}
                                            formatter={(value) => formatPrice(value as number)}
                                        />
                                    }
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="var(--color-revenue)"
                                    fill="url(#fillRevenue)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Status breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Order Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {totalOrdersInPie === 0 ? (
                            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                                No orders yet
                            </div>
                        ) : (
                            <>
                                <ChartContainer config={statusChartConfig} className="mx-auto h-48 w-full">
                                    <PieChart>
                                        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                                        <Pie
                                            data={pieData}
                                            dataKey="value"
                                            nameKey="name"
                                            innerRadius={50}
                                            outerRadius={80}
                                            paddingAngle={2}
                                        >
                                            {pieData.map((entry, i) => (
                                                <Cell key={i} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ChartContainer>
                                <div className="mt-2 flex flex-wrap justify-center gap-3">
                                    {pieData.map((entry) => (
                                        <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                                            <div className="size-2.5 rounded-full" style={{ backgroundColor: entry.fill }} />
                                            <span className="text-muted-foreground">{entry.name}</span>
                                            <span className="font-medium">{entry.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Bottom row */}
            <div className="grid gap-4 lg:grid-cols-2">
                {/* Recent Orders */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-base">Recent Orders</CardTitle>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/backoffice/operational/order">View All</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {recentOrders.length === 0 ? (
                            <p className="py-6 text-center text-sm text-muted-foreground">No orders yet</p>
                        ) : (
                            <div className="space-y-3">
                                {recentOrders.map((order) => {
                                    const config = statusConfig[order.status];
                                    return (
                                        <div
                                            key={order.id}
                                            className="flex cursor-pointer items-center justify-between rounded-md border p-3 transition-colors hover:bg-accent/50"
                                            onClick={() => router.visit(orderShow.url(order.id))}
                                        >
                                            <div className="flex items-center gap-3">
                                                {order.customer?.avatar ? (
                                                    <img src={order.customer.avatar} alt="" className="size-8 rounded-full" />
                                                ) : (
                                                    <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                                                        {order.customer?.name?.charAt(0).toUpperCase() || '?'}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-sm font-medium">{order.customer?.name}</p>
                                                    <p className="text-xs text-muted-foreground">{order.event?.name} - {order.catalog?.name}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-medium">{formatPrice(order.total_amount)}</span>
                                                <Badge variant={config.variant}>{config.label}</Badge>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Upcoming Events */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-base">Upcoming Events</CardTitle>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/backoffice/master/event">View All</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {upcomingEvents.length === 0 ? (
                            <p className="py-6 text-center text-sm text-muted-foreground">No upcoming events</p>
                        ) : (
                            <div className="space-y-3">
                                {upcomingEvents.map((event) => {
                                    const totalCapacity = event.catalogs?.reduce((sum, c) => sum + (c.pivot?.max_participant || 0), 0) || 0;
                                    const hasCapacity = totalCapacity > 0;
                                    const fillPercent = hasCapacity ? Math.min(100, Math.round((event.total_orders_count / totalCapacity) * 100)) : 0;

                                    return (
                                        <div
                                            key={event.id}
                                            className="cursor-pointer rounded-md border p-3 transition-colors hover:bg-accent/50"
                                            onClick={() => router.visit(registrants.url(event.id))}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium">{event.name}</p>
                                                    <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                                                        <Calendar className="size-3" />
                                                        <span>{formatDate(event.start_date)}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-semibold">{event.confirmed_count} confirmed</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {event.total_orders_count} total{hasCapacity ? ` / ${totalCapacity}` : ''}
                                                    </p>
                                                </div>
                                            </div>
                                            {hasCapacity && (
                                                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                                    <div
                                                        className="h-full rounded-full bg-primary transition-all"
                                                        style={{ width: `${fillPercent}%` }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Referrers & Vouchers row */}
            {(topReferrers.length > 0 || voucherPerformance.length > 0) && (
                <div className="grid gap-4 lg:grid-cols-2">
                    {/* Top Referrers */}
                    {topReferrers.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Users className="size-4" />
                                    Top Referrers
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {topReferrers.map((item, idx) => (
                                        <div key={item.referrer.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                                            <div className="flex items-center gap-3">
                                                <span className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-bold">
                                                    {idx + 1}
                                                </span>
                                                <div>
                                                    <p className="text-sm font-medium">{item.referrer.name}</p>
                                                    <p className="font-mono text-xs text-muted-foreground">{item.referrer.referral_code}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-semibold">{item.referral_count} referrals</p>
                                                <p className="text-xs text-muted-foreground">{formatCompactPrice(item.total_given)} earned</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Voucher Performance */}
                    {voucherPerformance.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <BarChart3 className="size-4" />
                                    Top Vouchers
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {voucherPerformance.map((item) => (
                                        <div key={item.voucher.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                                            <div>
                                                <p className="text-sm font-medium">{item.voucher.name}</p>
                                                <p className="font-mono text-xs text-muted-foreground">{item.voucher.code}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-semibold">{item.uses} uses</p>
                                                <p className="text-xs text-muted-foreground">{formatCompactPrice(item.total_discount)} discount</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
}

function BirthdayCustomerRow({ customer }: { customer: BirthdayCustomer }) {
    const [showForm, setShowForm] = useState(false);
    const [sent, setSent] = useState(customer.has_birthday_voucher);
    const [value, setValue] = useState('50000');

    const handleSend = () => {
        router.post(`/operational/customer/${customer.id}/birthday-voucher`, {
            value: parseInt(value),
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setSent(true);
                setShowForm(false);
                toast.success(`Birthday voucher sent to ${customer.name}`);
            },
            onError: (errors) => {
                toast.error(Object.values(errors)[0] as string || 'Failed to send voucher');
            },
        });
    };

    const age = new Date().getFullYear() - new Date(customer.date_of_birth).getFullYear();

    return (
        <div className="flex items-center justify-between rounded-md border px-3 py-2">
            <div className="flex items-center gap-3">
                {customer.avatar ? (
                    <img src={customer.avatar} alt="" className="size-8 rounded-full" />
                ) : (
                    <div className="flex size-8 items-center justify-center rounded-full bg-pink-100 text-xs font-medium text-pink-700 dark:bg-pink-900 dark:text-pink-200">
                        {customer.name.charAt(0).toUpperCase()}
                    </div>
                )}
                <div>
                    <p className="text-sm font-medium">{customer.name}</p>
                    <p className="text-xs text-muted-foreground">Turning {age}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                {sent ? (
                    <Badge variant="secondary" className="gap-1">
                        <Check className="size-3" />
                        Voucher Sent
                    </Badge>
                ) : showForm ? (
                    <div className="flex items-center gap-2">
                        <Input
                            type="number"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            className="h-8 w-28"
                            placeholder="Amount"
                        />
                        <Button size="sm" onClick={handleSend}>
                            <Gift className="size-3.5" />
                            Send
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>
                            Cancel
                        </Button>
                    </div>
                ) : (
                    <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
                        <Gift className="size-3.5" />
                        Send Voucher
                    </Button>
                )}
            </div>
        </div>
    );
}

Backoffice.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
