import { Link } from '@inertiajs/react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ArrowLeft, CheckCircle, DollarSign, PercentIcon, ShoppingBag, UserX, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '@/components/ui/chart';
import AppLayout from '@/layouts/app-layout';
import { index } from '@/routes/backoffice/master/event';
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

type Economics = {
    totalCapacity: number;
    totalRegistrations: number;
    confirmedCount: number;
    checkedInCount: number;
    actualRevenue: number;
    potentialRevenue: number;
    referralDiscount: number;
    voucherDiscount: number;
    balanceUsed: number;
    addonRevenue: number;
    fillRate: number | null;
    checkInRate: number;
    noShowCount: number | null;
    isEventEnded: boolean;
    revenueByCatalog: { catalog_id: number; count: number; revenue: number; catalog: { id: number; name: string } }[];
    dailyRevenue: { date: string; revenue: number; orders: number }[];
};

type Props = {
    event: Event;
    economics: Economics;
};

const revenueChartConfig: ChartConfig = {
    revenue: { label: 'Revenue', color: 'hsl(var(--primary))' },
};

const catalogChartConfig: ChartConfig = {
    revenue: { label: 'Revenue', color: 'hsl(var(--primary))' },
};

export default function EventEconomics({ event, economics }: Props) {
    const catalogData = economics.revenueByCatalog.map((item) => ({
        name: item.catalog?.name ?? `Catalog #${item.catalog_id}`,
        revenue: Number(item.revenue),
        count: Number(item.count),
    }));

    const totalDiscount = economics.referralDiscount + economics.voucherDiscount + economics.balanceUsed;

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-start gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href={index().url}>
                        <ArrowLeft className="size-4" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold">{event.name}</h1>
                        <Badge variant={event.status === 'published' ? 'default' : 'secondary'}>
                            {event.status}
                        </Badge>
                        {economics.isEventEnded && <Badge variant="outline">Ended</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {formatDate(event.start_date)} — {formatDate(event.end_date)}
                        {event.venue && ` at ${event.venue.name}`}
                    </p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader>
                        <CardDescription>Revenue</CardDescription>
                        <CardTitle className="text-2xl">{formatPrice(economics.actualRevenue)}</CardTitle>
                        <CardAction>
                            <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                                <DollarSign className="size-4 text-muted-foreground" />
                            </div>
                        </CardAction>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader>
                        <CardDescription>Fill Rate</CardDescription>
                        <CardTitle className="text-2xl">
                            {economics.fillRate !== null ? `${economics.fillRate}%` : 'N/A'}
                        </CardTitle>
                        <CardAction>
                            <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                                <Users className="size-4 text-muted-foreground" />
                            </div>
                        </CardAction>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <p className="text-xs text-muted-foreground">
                            {economics.totalRegistrations} registered
                            {economics.totalCapacity > 0 ? ` / ${economics.totalCapacity} capacity` : ''}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardDescription>Check-in Rate</CardDescription>
                        <CardTitle className="text-2xl">{economics.checkInRate}%</CardTitle>
                        <CardAction>
                            <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                                <CheckCircle className="size-4 text-muted-foreground" />
                            </div>
                        </CardAction>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <p className="text-xs text-muted-foreground">
                            {economics.checkedInCount} checked in / {economics.confirmedCount} confirmed
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardDescription>Addon Revenue</CardDescription>
                        <CardTitle className="text-2xl">{formatPrice(economics.addonRevenue)}</CardTitle>
                        <CardAction>
                            <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                                <ShoppingBag className="size-4 text-muted-foreground" />
                            </div>
                        </CardAction>
                    </CardHeader>
                </Card>
            </div>

            {/* No-show card for ended events */}
            {economics.isEventEnded && economics.noShowCount !== null && economics.noShowCount > 0 && (
                <Card className="border-amber-200 dark:border-amber-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <UserX className="size-4 text-amber-500" />
                            No-shows
                        </CardTitle>
                        <CardDescription>
                            {economics.noShowCount} confirmed attendee{economics.noShowCount > 1 ? 's' : ''} did not check in
                        </CardDescription>
                    </CardHeader>
                </Card>
            )}

            {/* Discounts + Revenue by Catalog */}
            <div className="grid gap-4 lg:grid-cols-2">
                {/* Discounts breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <PercentIcon className="size-4" />
                            Discounts Applied
                        </CardTitle>
                        <CardDescription>
                            Total discounts: {formatPrice(totalDiscount)}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {totalDiscount === 0 ? (
                            <p className="py-4 text-center text-sm text-muted-foreground">No discounts applied</p>
                        ) : (
                            <div className="space-y-3">
                                {economics.voucherDiscount > 0 && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Voucher Discounts</span>
                                        <span className="text-sm font-medium">{formatPrice(economics.voucherDiscount)}</span>
                                    </div>
                                )}
                                {economics.referralDiscount > 0 && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Referral Discounts</span>
                                        <span className="text-sm font-medium">{formatPrice(economics.referralDiscount)}</span>
                                    </div>
                                )}
                                {economics.balanceUsed > 0 && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Balance Used</span>
                                        <span className="text-sm font-medium">{formatPrice(economics.balanceUsed)}</span>
                                    </div>
                                )}
                                {totalDiscount > 0 && (
                                    <>
                                        <div className="border-t" />
                                        <div className="flex items-center justify-between font-medium">
                                            <span className="text-sm">Total</span>
                                            <span className="text-sm">{formatPrice(totalDiscount)}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Revenue by Catalog */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Revenue by Catalog</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {catalogData.length === 0 ? (
                            <p className="py-4 text-center text-sm text-muted-foreground">No revenue data</p>
                        ) : (
                            <ChartContainer config={catalogChartConfig} className="h-48 w-full">
                                <BarChart data={catalogData} layout="vertical" margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                                    <CartesianGrid horizontal={false} />
                                    <XAxis
                                        type="number"
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(v) => formatCompactPrice(v)}
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        tickLine={false}
                                        axisLine={false}
                                        width={100}
                                        className="text-xs"
                                    />
                                    <ChartTooltip
                                        content={
                                            <ChartTooltipContent
                                                formatter={(value) => formatPrice(value as number)}
                                            />
                                        }
                                    />
                                    <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                                </BarChart>
                            </ChartContainer>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Daily Revenue Chart */}
            {economics.dailyRevenue.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Daily Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={revenueChartConfig} className="h-64 w-full">
                            <AreaChart data={economics.dailyRevenue} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                                <defs>
                                    <linearGradient id="fillEconRevenue" x1="0" y1="0" x2="0" y2="1">
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
                                    fill="url(#fillEconRevenue)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

EventEconomics.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
