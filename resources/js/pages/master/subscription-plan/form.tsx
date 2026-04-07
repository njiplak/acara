import { router, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { FormResponse } from '@/lib/constant';
import { index, store, update } from '@/routes/backoffice/master/subscription-plan';
import type { SubscriptionFeature, SubscriptionPlan } from '@/types/subscription';

function formatPrice(price: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
}

type Props = {
    plan?: SubscriptionPlan;
    features: SubscriptionFeature[];
    analytics?: {
        subscribers_count: number;
    };
};

export default function SubscriptionPlanForm({ plan, features, analytics }: Props) {
    const existingFeatures = plan?.features?.map((f) => ({
        id: f.id,
        charges: f.pivot?.charges ?? ('' as any),
    })) ?? [];

    const { data, setData, post, put, errors, processing } = useForm({
        name: plan?.name ?? '',
        description: plan?.description ?? '',
        price: plan?.price ?? '',
        periodicity: plan?.periodicity ?? 1,
        periodicity_type: plan?.periodicity_type ?? 'Month',
        grace_days: plan?.grace_days ?? 0,
        is_active: plan?.is_active ?? true,
        sort_order: plan?.sort_order ?? 0,
        features: existingFeatures as { id: number; charges: number | '' }[],
    });

    const toggleFeature = (featureId: number, checked: boolean) => {
        if (checked) {
            setData('features', [...data.features, { id: featureId, charges: '' }]);
        } else {
            setData('features', data.features.filter((f) => f.id !== featureId));
        }
    };

    const setFeatureCharges = (featureId: number, charges: number | '') => {
        setData('features', data.features.map((f) => (f.id === featureId ? { ...f, charges } : f)));
    };

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (plan) {
            put(update(plan.id).url, FormResponse);
        } else {
            post(store().url, FormResponse);
        }
    };

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            {plan && analytics && (
                <div className="grid gap-4 sm:grid-cols-2">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{analytics.subscribers_count}</div>
                            <p className="text-xs text-muted-foreground">Active Subscribers</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{formatPrice(plan.price)}</div>
                            <p className="text-xs text-muted-foreground">Plan Price</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>{plan ? 'Edit Plan' : 'New Plan'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                        <Label>Name</Label>
                        <Input
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g. Basic, Premium, VIP"
                        />
                        <InputError message={errors?.name} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label>Description</Label>
                        <Input
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Brief description of this plan"
                        />
                        <InputError message={errors?.description} />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="flex flex-col gap-1.5">
                            <Label>Price (Rp)</Label>
                            <Input
                                type="number"
                                min="0"
                                value={data.price}
                                onChange={(e) => setData('price', e.target.value ? Number(e.target.value) : ('' as any))}
                                placeholder="e.g. 100000"
                            />
                            <InputError message={errors?.price} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label>Billing Period</Label>
                            <Input
                                type="number"
                                min="1"
                                value={data.periodicity}
                                onChange={(e) => setData('periodicity', e.target.value ? Number(e.target.value) : ('' as any))}
                            />
                            <InputError message={errors?.periodicity} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label>Period Type</Label>
                            <Select value={data.periodicity_type} onValueChange={(v) => setData('periodicity_type', v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Day">Day</SelectItem>
                                    <SelectItem value="Week">Week</SelectItem>
                                    <SelectItem value="Month">Month</SelectItem>
                                    <SelectItem value="Year">Year</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={errors?.periodicity_type} />
                        </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="flex flex-col gap-1.5">
                            <Label>Grace Days</Label>
                            <Input
                                type="number"
                                min="0"
                                value={data.grace_days}
                                onChange={(e) => setData('grace_days', e.target.value ? Number(e.target.value) : 0)}
                            />
                            <p className="text-xs text-muted-foreground">Days after expiry before access is revoked</p>
                            <InputError message={errors?.grace_days} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label>Sort Order</Label>
                            <Input
                                type="number"
                                min="0"
                                value={data.sort_order}
                                onChange={(e) => setData('sort_order', e.target.value ? Number(e.target.value) : 0)}
                            />
                            <InputError message={errors?.sort_order} />
                        </div>
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
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Plan Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <p className="text-xs text-muted-foreground">
                        Select what this plan includes. For consumable features, set the amount (e.g. 10 class attempts per month).
                    </p>
                    <InputError message={errors?.features} />

                    {features.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                            No features created yet. Go to Sub. Features to create some first.
                        </p>
                    )}

                    {features.map((feature) => {
                        const attached = data.features.find((f) => f.id === feature.id);
                        return (
                            <div key={feature.id} className="flex items-center gap-3 rounded-md border p-3">
                                <Checkbox
                                    checked={!!attached}
                                    onCheckedChange={(checked) => toggleFeature(feature.id, !!checked)}
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium">{feature.name}</p>
                                        <Badge variant={feature.consumable ? 'secondary' : 'outline'} className="text-xs">
                                            {feature.consumable ? 'Consumable' : 'Access'}
                                        </Badge>
                                    </div>
                                    {feature.description && (
                                        <p className="text-xs text-muted-foreground">{feature.description}</p>
                                    )}
                                </div>
                                {attached && feature.consumable && (
                                    <div className="flex items-center gap-2">
                                        <Label className="text-xs text-muted-foreground whitespace-nowrap">Amount</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            className="w-24"
                                            placeholder="e.g. 10"
                                            value={attached.charges}
                                            onChange={(e) =>
                                                setFeatureCharges(feature.id, e.target.value ? Number(e.target.value) : '')
                                            }
                                        />
                                    </div>
                                )}
                                {attached && !feature.consumable && (
                                    <Badge variant="default" className="text-xs">Included</Badge>
                                )}
                            </div>
                        );
                    })}
                </CardContent>
            </Card>

            <div className="flex flex-col gap-2 sm:flex-row">
                <Button type="button" variant="outline" onClick={() => router.visit(index().url)}>
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

SubscriptionPlanForm.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
