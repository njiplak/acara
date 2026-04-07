import { router, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import AppLayout from '@/layouts/app-layout';
import { FormResponse } from '@/lib/constant';
import { index, store, update } from '@/routes/backoffice/master/subscription-feature';
import type { SubscriptionFeature } from '@/types/subscription';

type Props = {
    feature?: SubscriptionFeature;
};

export default function SubscriptionFeatureForm({ feature }: Props) {
    const { data, setData, post, put, errors, processing } = useForm({
        name: feature?.name ?? '',
        description: feature?.description ?? '',
        consumable: feature?.consumable ?? false,
        quota: feature?.quota ?? false,
        periodicity: feature?.periodicity ?? '',
        periodicity_type: feature?.periodicity_type ?? 'Month',
    });

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (feature) {
            put(update(feature.id).url, FormResponse);
        } else {
            post(store().url, FormResponse);
        }
    };

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{feature ? 'Edit Feature' : 'New Feature'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                        <Label>Name</Label>
                        <Input
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g. max_class_attempt, priority_support"
                            className="font-mono"
                        />
                        <p className="text-xs text-muted-foreground">Use snake_case for programmatic access</p>
                        <InputError message={errors?.name} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label>Description</Label>
                        <Input
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Human-readable description"
                        />
                        <InputError message={errors?.description} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Behavior</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 rounded-md border p-3">
                        <Checkbox
                            checked={data.consumable}
                            onCheckedChange={(v) => setData('consumable', !!v)}
                        />
                        <div>
                            <p className="text-sm font-medium">Consumable</p>
                            <p className="text-xs text-muted-foreground">Track usage with a limited quota that resets periodically</p>
                        </div>
                    </div>

                    {data.consumable && (
                        <>
                            <div className="flex items-center gap-3 rounded-md border p-3">
                                <Checkbox
                                    checked={data.quota}
                                    onCheckedChange={(v) => setData('quota', !!v)}
                                />
                                <div>
                                    <p className="text-sm font-medium">Quota Mode</p>
                                    <p className="text-xs text-muted-foreground">Track as a single running total instead of individual records</p>
                                </div>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="flex flex-col gap-1.5">
                                    <Label>Reset Period</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={data.periodicity}
                                        onChange={(e) => setData('periodicity', e.target.value ? Number(e.target.value) : ('' as any))}
                                        placeholder="e.g. 1"
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
                        </>
                    )}
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

SubscriptionFeatureForm.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
