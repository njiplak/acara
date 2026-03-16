import { router, useForm } from '@inertiajs/react';
import { LoaderCircle, RefreshCw } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { FormResponse } from '@/lib/constant';
import { index, store, update } from '@/routes/backoffice/master/voucher';
import type { Catalog } from '@/types/catalog';
import type { Event } from '@/types/event';
import type { Order } from '@/types/order';
import type { Voucher } from '@/types/voucher';

function formatPrice(price: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
}

function formatDate(date: string) {
    return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function generateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

type Props = {
    voucher?: Voucher;
    events: Event[];
    catalogs: Catalog[];
    analytics?: {
        used_count: number;
        total_revenue: number;
        total_discount_given: number;
    };
    recentOrders?: Order[];
};

export default function VoucherForm({ voucher, events, catalogs, analytics, recentOrders }: Props) {
    const { data, setData, post, put, errors, processing } = useForm({
        code: voucher?.code ?? '',
        name: voucher?.name ?? '',
        type: voucher?.type ?? 'fixed',
        value: voucher?.value ?? '',
        max_discount: voucher?.max_discount ?? '',
        event_id: voucher?.event_id ?? '',
        catalog_id: voucher?.catalog_id ?? '',
        max_uses: voucher?.max_uses ?? '',
        max_uses_per_customer: voucher?.max_uses_per_customer ?? 1,
        min_order_amount: voucher?.min_order_amount ?? '',
        valid_from: voucher?.valid_from ? voucher.valid_from.slice(0, 16) : '',
        valid_until: voucher?.valid_until ? voucher.valid_until.slice(0, 16) : '',
        is_active: voucher?.is_active ?? true,
        stackable_with_referral: voucher?.stackable_with_referral ?? false,
    });

    const filteredCatalogs = data.event_id
        ? catalogs.filter((c) => {
              const event = events.find((e) => e.id === Number(data.event_id));
              return event?.catalogs?.some((ec) => ec.id === c.id);
          })
        : catalogs;

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (voucher) {
            put(update(voucher.id).url, FormResponse);
        } else {
            post(store().url, FormResponse);
        }
    };

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            {/* Analytics (edit mode only) */}
            {voucher && analytics && (
                <div className="grid gap-4 sm:grid-cols-3">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{analytics.used_count}</div>
                            <p className="text-xs text-muted-foreground">
                                Total Redemptions
                                {voucher.max_uses ? ` / ${voucher.max_uses}` : ''}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{formatPrice(analytics.total_revenue)}</div>
                            <p className="text-xs text-muted-foreground">Revenue from Voucher Orders</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{formatPrice(analytics.total_discount_given)}</div>
                            <p className="text-xs text-muted-foreground">Total Discount Given</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Basic Info */}
            <Card>
                <CardHeader>
                    <CardTitle>{voucher ? 'Edit Voucher' : 'New Voucher'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                        <Label>Name</Label>
                        <Input
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g. Flash Sale March, KOL Promo"
                        />
                        <p className="text-xs text-muted-foreground">Internal label for your reference</p>
                        <InputError message={errors?.name} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label>Code</Label>
                        <div className="flex gap-2">
                            <Input
                                value={data.code}
                                onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                placeholder="PROMO50"
                                maxLength={50}
                                className="font-mono uppercase"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setData('code', generateCode())}
                                title="Generate random code"
                            >
                                <RefreshCw className="size-4" />
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">The code customers will enter at checkout</p>
                        <InputError message={errors?.code} />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="flex flex-col gap-1.5">
                            <Label>Type</Label>
                            <Select value={data.type} onValueChange={(v) => setData('type', v as 'fixed' | 'percentage')}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="fixed">Fixed Amount (Rp)</SelectItem>
                                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={errors?.type} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label>{data.type === 'percentage' ? 'Percentage' : 'Amount'}</Label>
                            <Input
                                type="number"
                                min="1"
                                max={data.type === 'percentage' ? 100 : undefined}
                                value={data.value}
                                onChange={(e) => setData('value', e.target.value ? Number(e.target.value) : ('' as any))}
                                placeholder={data.type === 'percentage' ? 'e.g. 50' : 'e.g. 25000'}
                            />
                            <InputError message={errors?.value} />
                        </div>
                        {data.type === 'percentage' && (
                            <div className="flex flex-col gap-1.5">
                                <Label>Max Discount (Rp)</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={data.max_discount}
                                    onChange={(e) => setData('max_discount', e.target.value ? Number(e.target.value) : ('' as any))}
                                    placeholder="e.g. 100000"
                                />
                                <p className="text-xs text-muted-foreground">Cap the maximum discount amount</p>
                                <InputError message={errors?.max_discount} />
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Scope */}
            <Card>
                <CardHeader>
                    <CardTitle>Scope</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                            <Label>Event</Label>
                            <Select
                                value={data.event_id ? String(data.event_id) : 'all'}
                                onValueChange={(v) => {
                                    setData('event_id', v === 'all' ? ('' as any) : Number(v));
                                    if (v === 'all') setData('catalog_id', '' as any);
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Events</SelectItem>
                                    {events.map((event) => (
                                        <SelectItem key={event.id} value={String(event.id)}>
                                            {event.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">Leave as "All Events" for a platform-wide voucher</p>
                            <InputError message={errors?.event_id} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label>Catalog / Session</Label>
                            <Select
                                value={data.catalog_id ? String(data.catalog_id) : 'all'}
                                onValueChange={(v) => setData('catalog_id', v === 'all' ? ('' as any) : Number(v))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Sessions</SelectItem>
                                    {filteredCatalogs.map((catalog) => (
                                        <SelectItem key={catalog.id} value={String(catalog.id)}>
                                            {catalog.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">Optionally restrict to a specific session</p>
                            <InputError message={errors?.catalog_id} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Limits */}
            <Card>
                <CardHeader>
                    <CardTitle>Limits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="flex flex-col gap-1.5">
                            <Label>Max Total Uses</Label>
                            <Input
                                type="number"
                                min="1"
                                placeholder="Unlimited"
                                value={data.max_uses}
                                onChange={(e) => setData('max_uses', e.target.value ? Number(e.target.value) : ('' as any))}
                            />
                            <p className="text-xs text-muted-foreground">Leave empty for unlimited</p>
                            <InputError message={errors?.max_uses} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label>Max Uses Per Customer</Label>
                            <Input
                                type="number"
                                min="1"
                                value={data.max_uses_per_customer}
                                onChange={(e) => setData('max_uses_per_customer', e.target.value ? Number(e.target.value) : ('' as any))}
                            />
                            <InputError message={errors?.max_uses_per_customer} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label>Min Order Amount (Rp)</Label>
                            <Input
                                type="number"
                                min="0"
                                placeholder="No minimum"
                                value={data.min_order_amount}
                                onChange={(e) => setData('min_order_amount', e.target.value ? Number(e.target.value) : ('' as any))}
                            />
                            <InputError message={errors?.min_order_amount} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Validity */}
            <Card>
                <CardHeader>
                    <CardTitle>Validity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                            <Label>Valid From</Label>
                            <Input
                                type="datetime-local"
                                value={data.valid_from}
                                onChange={(e) => setData('valid_from', e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">Leave empty for immediately valid</p>
                            <InputError message={errors?.valid_from} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label>Valid Until</Label>
                            <Input
                                type="datetime-local"
                                value={data.valid_until}
                                onChange={(e) => setData('valid_until', e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">Leave empty for no expiry</p>
                            <InputError message={errors?.valid_until} />
                        </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                            <Label>Status</Label>
                            <Select
                                value={data.is_active ? 'active' : 'inactive'}
                                onValueChange={(v) => setData('is_active', v === 'active')}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={errors?.is_active} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label>Referral Stacking</Label>
                            <Select
                                value={data.stackable_with_referral ? 'yes' : 'no'}
                                onValueChange={(v) => setData('stackable_with_referral', v === 'yes')}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="no">Not stackable (replaces referral)</SelectItem>
                                    <SelectItem value="yes">Stackable with referral</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">Whether this voucher can be combined with referral discounts</p>
                            <InputError message={errors?.stackable_with_referral} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Orders (edit mode only) */}
            {voucher && recentOrders && recentOrders.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Redemptions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {recentOrders.map((order) => (
                                <div key={order.id} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono text-xs text-muted-foreground">{order.order_code}</span>
                                        <span>{order.customer?.name}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-muted-foreground">{formatPrice(order.total_amount)}</span>
                                        <Badge variant={order.status === 'confirmed' ? 'default' : 'outline'} className="text-xs">
                                            {order.status}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">{formatDate(order.created_at)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.visit(index().url)}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={processing}>
                    {processing && <LoaderCircle className="size-4 animate-spin" />}
                    Save
                </Button>
            </div>
        </form>
    );
}

VoucherForm.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
