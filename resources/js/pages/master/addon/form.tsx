import { router, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MaskedInput } from '@/components/masked-input';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { FormResponse } from '@/lib/constant';
import { index, store, update } from '@/routes/backoffice/master/addon';
import type { Addon } from '@/types/addon';

type Props = {
    addon?: Addon;
};

export default function AddonForm({ addon }: Props) {
    const { data, setData, post, put, errors, processing } = useForm({
        name: addon?.name ?? '',
        description: addon?.description ?? '',
        strike_price: addon?.strike_price ?? '',
        price: addon?.price ?? '',
        status: addon?.status ?? 'draft',
        is_standalone: addon?.is_standalone ?? false,
        payment_gateway: addon?.payment_gateway ?? 'manual',
        currency: addon?.currency ?? 'IDR',
    });

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (addon) {
            put(update(addon.id).url, FormResponse);
        } else {
            post(store().url, FormResponse);
        }
    };

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{addon ? 'Edit Addon' : 'New Addon'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                        <Label>Name</Label>
                        <Input
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            The display name for this add-on item (e.g. "Mat Rental", "Towel Service")
                        </p>
                        <InputError message={errors?.name} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label>Description</Label>
                        <Textarea
                            rows={3}
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Brief explanation of what this add-on includes
                        </p>
                        <InputError message={errors?.description} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Pricing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                            <Label>Price</Label>
                            <MaskedInput
                                mask="currency"
                                prefix="Rp "
                                value={data.price}
                                onChange={(value) => setData('price', value as any)}
                            />
                            <p className="text-xs text-muted-foreground">
                                The actual selling price charged to the customer
                            </p>
                            <InputError message={errors?.price} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label>Strike Price</Label>
                            <MaskedInput
                                mask="currency"
                                prefix="Rp "
                                value={data.strike_price}
                                onChange={(value) => setData('strike_price', value as any)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Original price shown crossed out to indicate a discount (leave empty if no discount)
                            </p>
                            <InputError message={errors?.strike_price} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                            <Label>Status</Label>
                            <Select
                                value={data.status}
                                onValueChange={(val) => setData('status', val as any)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="published">Published</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Only published add-ons are visible on the landing page
                            </p>
                            <InputError message={errors?.status} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label>Payment Gateway</Label>
                            <Select
                                value={data.payment_gateway}
                                onValueChange={(val) => setData('payment_gateway', val as any)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="manual">Manual</SelectItem>
                                    <SelectItem value="xendit">Xendit</SelectItem>
                                    <SelectItem value="stripe">Stripe</SelectItem>
                                    <SelectItem value="midtrans">Midtrans</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                How customers pay for standalone purchases of this add-on
                            </p>
                            <InputError message={errors?.payment_gateway} />
                        </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                            <Label>Currency</Label>
                            <Select
                                value={data.currency}
                                onValueChange={(val) => setData('currency', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="IDR">IDR</SelectItem>
                                    <SelectItem value="USD">USD</SelectItem>
                                    <SelectItem value="SGD">SGD</SelectItem>
                                    <SelectItem value="EUR">EUR</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={errors?.currency} />
                        </div>
                        <div className="flex flex-col gap-3">
                            <Label>Standalone Purchase</Label>
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="is_standalone"
                                    checked={data.is_standalone}
                                    onCheckedChange={(val) => setData('is_standalone', val === true)}
                                />
                                <label htmlFor="is_standalone" className="text-sm text-muted-foreground">
                                    Allow standalone purchase
                                </label>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Allow this add-on to be purchased independently via the landing page
                            </p>
                            <InputError message={errors?.is_standalone} />
                        </div>
                    </div>
                </CardContent>
            </Card>

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

AddonForm.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
