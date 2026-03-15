import { Link, router } from '@inertiajs/react';
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from 'recharts';
import { Calendar, ClipboardList, DollarSign, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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

type RevenueDataPoint = {
    date: string;
    revenue: number;
    orders: number;
};

type UpcomingEvent = Event & {
    confirmed_count: number;
    total_orders_count: number;
};

type Props = {
    stats: Stats;
    revenueChart: RevenueDataPoint[];
    statusBreakdown: Record<string, number>;
    recentOrders: Order[];
    upcomingEvents: UpcomingEvent[];
};

export default function Backoffice({ stats, revenueChart, statusBreakdown, recentOrders, upcomingEvents }: Props) {
    const pieData = Object.entries(statusBreakdown).map(([status, count]) => ({
        name: statusConfig[status as OrderStatus]?.label || status,
        value: count,
        fill: statusConfig[status as OrderStatus]?.color || 'hsl(var(--muted))',
    }));

    const totalOrdersInPie = pieData.reduce((sum, d) => sum + d.value, 0);

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
                    <CardFooter className="text-xs text-muted-foreground">
                        From confirmed orders
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
                        {stats.pendingReviewCount > 0 ? (
                            <span className="text-xs text-amber-600 dark:text-amber-400">
                                {stats.pendingReviewCount} pending review
                            </span>
                        ) : (
                            <span className="text-xs text-muted-foreground">All caught up</span>
                        )}
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
                    <CardFooter className="text-xs text-muted-foreground">
                        Registered via Google
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
                            <Link href="/operational/order">View All</Link>
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
                            <Link href="/master/event">View All</Link>
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
        </div>
    );
}

Backoffice.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
