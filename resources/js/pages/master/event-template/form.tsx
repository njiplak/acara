import { router, useForm } from '@inertiajs/react';
import { Clock, LoaderCircle, Plus, Trash2, Users, Package } from 'lucide-react';
import type { PricingType } from '@/types/event';

import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { FormResponse } from '@/lib/constant';
import { index, store, update } from '@/routes/backoffice/master/event-template';
import type { Catalog } from '@/types/catalog';
import type { Model } from '@/types/model';
import type { Venue } from '@/types/venue';

type EventTemplate = Model & {
    name: string;
    description: string | null;
    template_data: Record<string, any>;
};

type ScheduleEntry = {
    time: string;
    end_time: string;
    title: string;
    description: string;
};

type TierEntry = {
    label: string;
    price: number | '';
    end_date: string;
    max_seats: number | '';
};

type CatalogEntry = {
    catalog_id: number | '';
    max_participant: number | '';
    pricing_type: PricingType;
    pricing_tiers: TierEntry[];
};

type Props = {
    template?: EventTemplate;
    catalogs?: (Catalog & { speakers?: { id: number; name: string }[]; addons?: { id: number; name: string }[] })[];
    venues?: Venue[];
};

export default function EventTemplateForm({ template, catalogs = [], venues = [] }: Props) {
    const td = template?.template_data ?? {};

    const initialSchedule: ScheduleEntry[] =
        td.schedule?.map((s: any) => ({
            time: s.time ?? '',
            end_time: s.end_time ?? '',
            title: s.title ?? '',
            description: s.description ?? '',
        })) ?? [];

    const initialCatalogs: CatalogEntry[] =
        td.catalogs?.map((c: any) => ({
            catalog_id: c.catalog_id ?? '',
            max_participant: c.max_participant ?? '',
            pricing_type: c.pricing_type ?? 'fixed',
            pricing_tiers: c.pricing_tiers?.map((t: any) => ({
                label: t.label ?? '',
                price: t.price ?? '',
                end_date: t.end_date ?? '',
                max_seats: t.max_seats ?? '',
            })) ?? [],
        })) ?? [];

    const { data, setData, post, put, errors, processing } = useForm({
        name: template?.name ?? '',
        description: template?.description ?? '',
        template_data: {
            description: td.description ?? '',
            payment_gateway: td.payment_gateway ?? 'manual',
            currency: td.currency ?? 'IDR',
            material_require_checkin: td.material_require_checkin ?? true,
            venue_id: td.venue_id ?? '',
            schedule: initialSchedule,
            catalogs: initialCatalogs,
        },
    });

    const templateData = data.template_data;

    const setTemplateField = <K extends keyof typeof templateData>(key: K, value: (typeof templateData)[K]) => {
        setData('template_data', { ...templateData, [key]: value });
    };

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (template) {
            put(update(template.id).url, FormResponse);
        } else {
            post(store().url, FormResponse);
        }
    };

    // --- Schedule helpers ---
    const addScheduleItem = () => {
        setTemplateField('schedule', [...templateData.schedule, { time: '', end_time: '', title: '', description: '' }]);
    };

    const removeScheduleItem = (idx: number) => {
        setTemplateField('schedule', templateData.schedule.filter((_: any, i: number) => i !== idx));
    };

    const updateScheduleItem = (idx: number, field: keyof ScheduleEntry, value: string) => {
        const updated = [...templateData.schedule];
        updated[idx] = { ...updated[idx], [field]: value };
        setTemplateField('schedule', updated);
    };

    // --- Catalog helpers ---
    const addCatalog = () => {
        setTemplateField('catalogs', [...templateData.catalogs, { catalog_id: '', max_participant: '', pricing_type: 'fixed' as PricingType, pricing_tiers: [] }]);
    };

    const removeCatalog = (idx: number) => {
        setTemplateField('catalogs', templateData.catalogs.filter((_: any, i: number) => i !== idx));
    };

    const updateCatalog = (idx: number, field: keyof CatalogEntry, value: any) => {
        const updated = [...templateData.catalogs];
        updated[idx] = { ...updated[idx], [field]: value };
        setTemplateField('catalogs', updated);
    };

    const handlePricingTypeChange = (catalogIdx: number, type: PricingType) => {
        const updated = [...templateData.catalogs];
        updated[catalogIdx] = {
            ...updated[catalogIdx],
            pricing_type: type,
            pricing_tiers: type === 'fixed' ? [] : [
                { label: '', price: '', end_date: '', max_seats: '' },
                { label: '', price: '', end_date: '', max_seats: '' },
            ],
        };
        setTemplateField('catalogs', updated);
    };

    const addTier = (catalogIdx: number) => {
        const updated = [...templateData.catalogs];
        const tiers = [...updated[catalogIdx].pricing_tiers];
        tiers.splice(tiers.length - 1, 0, { label: '', price: '', end_date: '', max_seats: '' });
        updated[catalogIdx] = { ...updated[catalogIdx], pricing_tiers: tiers };
        setTemplateField('catalogs', updated);
    };

    const removeTier = (catalogIdx: number, tierIdx: number) => {
        const updated = [...templateData.catalogs];
        updated[catalogIdx] = {
            ...updated[catalogIdx],
            pricing_tiers: updated[catalogIdx].pricing_tiers.filter((_: any, i: number) => i !== tierIdx),
        };
        setTemplateField('catalogs', updated);
    };

    const updateTier = (catalogIdx: number, tierIdx: number, field: keyof TierEntry, value: any) => {
        const updated = [...templateData.catalogs];
        const tiers = [...updated[catalogIdx].pricing_tiers];
        tiers[tierIdx] = { ...tiers[tierIdx], [field]: value };
        updated[catalogIdx] = { ...updated[catalogIdx], pricing_tiers: tiers };
        setTemplateField('catalogs', updated);
    };

    const selectedCatalogIds = templateData.catalogs.map((c: CatalogEntry) => c.catalog_id).filter(Boolean);

    const getCatalogMeta = (catalogId: number | '') => {
        if (!catalogId) return null;
        return catalogs.find((c) => c.id === catalogId) ?? null;
    };

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{template ? 'Edit Template' : 'New Template'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                        <Label>Template Name</Label>
                        <Input
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            A label for this template (e.g. "Weekend Workshop", "Monthly Meetup")
                        </p>
                        <InputError message={errors?.name} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label>Description</Label>
                        <Textarea
                            rows={2}
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Optional note about when to use this template
                        </p>
                        <InputError message={errors?.description} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Default Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                        <Label>Event Description</Label>
                        <Textarea
                            rows={3}
                            value={templateData.description}
                            onChange={(e) => setTemplateField('description', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Default event description when using this template
                        </p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                            <Label>Payment Gateway</Label>
                            <Select
                                value={templateData.payment_gateway}
                                onValueChange={(val) => setTemplateField('payment_gateway', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="manual">Manual Transfer</SelectItem>
                                    <SelectItem value="xendit">Xendit</SelectItem>
                                    <SelectItem value="stripe">Stripe</SelectItem>
                                    <SelectItem value="midtrans">Midtrans</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label>Currency</Label>
                            <Select
                                value={templateData.currency}
                                onValueChange={(val) => setTemplateField('currency', val)}
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
                        </div>
                    </div>
                    {venues.length > 0 && (
                        <div className="flex flex-col gap-1.5">
                            <Label>Default Venue</Label>
                            <Select
                                value={templateData.venue_id?.toString() ?? ''}
                                onValueChange={(val) => setTemplateField('venue_id', val === 'none' ? '' : Number(val))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select venue (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No venue</SelectItem>
                                    {venues.map((v) => (
                                        <SelectItem key={v.id} value={v.id.toString()}>
                                            {v.name} — {v.city}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Pre-filled when creating events from this template
                            </p>
                        </div>
                    )}
                    <div className="flex items-center justify-between rounded-md border px-4 py-3">
                        <div>
                            <p className="text-sm font-medium">Require check-in for materials</p>
                            <p className="text-xs text-muted-foreground">
                                When enabled, customers must be checked in to access distributed materials
                            </p>
                        </div>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={templateData.material_require_checkin}
                            onClick={() => setTemplateField('material_require_checkin', !templateData.material_require_checkin)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                                templateData.material_require_checkin ? 'bg-foreground' : 'bg-muted'
                            }`}
                        >
                            <span
                                className={`pointer-events-none inline-block size-5 rounded-full bg-background shadow-lg transition-transform ${
                                    templateData.material_require_checkin ? 'translate-x-5' : 'translate-x-0'
                                }`}
                            />
                        </button>
                    </div>
                    <InputError message={errors?.template_data} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex-row items-center justify-between">
                    <CardTitle>Schedule / Timeline</CardTitle>
                    <Button type="button" variant="outline" size="sm" onClick={addScheduleItem}>
                        Add Item
                    </Button>
                </CardHeader>
                <CardContent>
                    <p className="mb-3 text-xs text-muted-foreground">
                        Build the default event timeline with time slots and activity descriptions
                    </p>
                    {templateData.schedule.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                            No schedule items yet. Click "Add Item" to build the timeline.
                        </p>
                    )}
                    <div className="space-y-3">
                        {templateData.schedule.map((entry: ScheduleEntry, idx: number) => (
                            <div key={idx} className="flex items-start gap-3 rounded-md border p-3">
                                <div className="grid flex-1 gap-3">
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <div className="flex flex-col gap-1.5">
                                            <Label>Start Time</Label>
                                            <div className="relative">
                                                <Clock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    type="time"
                                                    className="pl-9"
                                                    value={entry.time}
                                                    onChange={(e) => updateScheduleItem(idx, 'time', e.target.value)}
                                                />
                                            </div>
                                            <InputError message={(errors as any)?.[`template_data.schedule.${idx}.time`]} />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <Label>End Time</Label>
                                            <div className="relative">
                                                <Clock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    type="time"
                                                    className="pl-9"
                                                    value={entry.end_time}
                                                    onChange={(e) => updateScheduleItem(idx, 'end_time', e.target.value)}
                                                />
                                            </div>
                                            <InputError message={(errors as any)?.[`template_data.schedule.${idx}.end_time`]} />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <Label>Title</Label>
                                        <Input
                                            value={entry.title}
                                            onChange={(e) => updateScheduleItem(idx, 'title', e.target.value)}
                                            placeholder="e.g. Registration, Session 1, Break"
                                        />
                                        <InputError message={(errors as any)?.[`template_data.schedule.${idx}.title`]} />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <Label>Description</Label>
                                        <Textarea
                                            rows={2}
                                            value={entry.description}
                                            onChange={(e) => updateScheduleItem(idx, 'description', e.target.value)}
                                            placeholder="Optional details about this activity"
                                        />
                                        <InputError message={(errors as any)?.[`template_data.schedule.${idx}.description`]} />
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="mt-6 shrink-0 text-red-500 hover:text-red-600"
                                    onClick={() => removeScheduleItem(idx)}
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex-row items-center justify-between">
                    <CardTitle>Catalogs</CardTitle>
                    <Button type="button" variant="outline" size="sm" onClick={addCatalog}>
                        Add Catalog
                    </Button>
                </CardHeader>
                <CardContent>
                    <p className="mb-3 text-xs text-muted-foreground">
                        Attach catalog items and configure pricing. Speakers and addons are inherited from each catalog.
                    </p>
                    {templateData.catalogs.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                            No catalogs attached yet. Click "Add Catalog" to get started.
                        </p>
                    )}
                    <div className="space-y-3">
                        {templateData.catalogs.map((entry: CatalogEntry, idx: number) => {
                            const isLastTier = (tierIdx: number) => tierIdx === entry.pricing_tiers.length - 1;
                            const meta = getCatalogMeta(entry.catalog_id);
                            return (
                                <div key={idx} className="rounded-md border p-3">
                                    <div className="flex items-start gap-3">
                                        <div className="grid flex-1 gap-3 sm:grid-cols-2">
                                            <div className="flex flex-col gap-1.5">
                                                <Label>Catalog</Label>
                                                <Select
                                                    value={entry.catalog_id?.toString() ?? ''}
                                                    onValueChange={(val) => updateCatalog(idx, 'catalog_id', Number(val))}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select catalog" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {catalogs
                                                            .filter(
                                                                (c) =>
                                                                    !selectedCatalogIds.includes(c.id) ||
                                                                    c.id === entry.catalog_id,
                                                            )
                                                            .map((c) => (
                                                                <SelectItem key={c.id} value={c.id.toString()}>
                                                                    {c.name} — Rp {Number(c.price).toLocaleString('id-ID')}
                                                                </SelectItem>
                                                            ))}
                                                    </SelectContent>
                                                </Select>
                                                <InputError message={(errors as any)?.[`template_data.catalogs.${idx}.catalog_id`]} />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <Label>Max Participant</Label>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    placeholder="Unlimited"
                                                    value={entry.max_participant}
                                                    onChange={(e) =>
                                                        updateCatalog(idx, 'max_participant', e.target.value ? Number(e.target.value) : '')
                                                    }
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Leave empty for unlimited capacity
                                                </p>
                                                <InputError message={(errors as any)?.[`template_data.catalogs.${idx}.max_participant`]} />
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="mt-6 shrink-0 text-red-500 hover:text-red-600"
                                            onClick={() => removeCatalog(idx)}
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>

                                    {/* Speaker & Addon badges */}
                                    {meta && ((meta.speakers && meta.speakers.length > 0) || (meta.addons && meta.addons.length > 0)) && (
                                        <div className="mt-3 flex flex-wrap gap-3">
                                            {meta.speakers && meta.speakers.length > 0 && (
                                                <div className="flex items-center gap-1.5">
                                                    <Users className="size-3.5 text-muted-foreground" />
                                                    <div className="flex flex-wrap gap-1">
                                                        {meta.speakers.map((s) => (
                                                            <Badge key={s.id} variant="secondary" className="text-xs">
                                                                {s.name}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {meta.addons && meta.addons.length > 0 && (
                                                <div className="flex items-center gap-1.5">
                                                    <Package className="size-3.5 text-muted-foreground" />
                                                    <div className="flex flex-wrap gap-1">
                                                        {meta.addons.map((a) => (
                                                            <Badge key={a.id} variant="outline" className="text-xs">
                                                                {a.name}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Pricing Type */}
                                    <div className="mt-3 flex flex-col gap-1.5">
                                        <Label>Pricing</Label>
                                        <Select
                                            value={entry.pricing_type}
                                            onValueChange={(val) => handlePricingTypeChange(idx, val as PricingType)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="fixed">Fixed (Default)</SelectItem>
                                                <SelectItem value="date">Date-based Tiers</SelectItem>
                                                <SelectItem value="quantity">Quantity-based Tiers</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError message={(errors as any)?.[`template_data.catalogs.${idx}.pricing_type`]} />
                                    </div>

                                    {/* Pricing Tiers */}
                                    {entry.pricing_type !== 'fixed' && (
                                        <div className="mt-3 rounded-md bg-muted/30 p-3">
                                            <div className="mb-2 flex items-center justify-between">
                                                <p className="text-xs font-medium text-muted-foreground">
                                                    {entry.pricing_type === 'date' ? 'Date-based' : 'Quantity-based'} Pricing Tiers
                                                </p>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => addTier(idx)}
                                                >
                                                    <Plus className="size-3" />
                                                    Add Tier
                                                </Button>
                                            </div>
                                            <InputError message={(errors as any)?.[`template_data.catalogs.${idx}.pricing_tiers`]} />
                                            <div className="space-y-2">
                                                {entry.pricing_tiers.map((tier: TierEntry, tIdx: number) => (
                                                    <div key={tIdx} className="flex items-start gap-2 rounded border bg-background p-2">
                                                        <div className="grid flex-1 gap-2 sm:grid-cols-3">
                                                            <div className="flex flex-col gap-1">
                                                                <Label className="text-xs">Label</Label>
                                                                <Input
                                                                    value={tier.label}
                                                                    onChange={(e) => updateTier(idx, tIdx, 'label', e.target.value)}
                                                                    placeholder={isLastTier(tIdx) ? 'e.g. Regular' : 'e.g. Early Bird'}
                                                                    className="h-8 text-sm"
                                                                />
                                                                <InputError message={(errors as any)?.[`template_data.catalogs.${idx}.pricing_tiers.${tIdx}.label`]} />
                                                            </div>
                                                            <div className="flex flex-col gap-1">
                                                                <Label className="text-xs">Price</Label>
                                                                <Input
                                                                    type="number"
                                                                    min="0"
                                                                    value={tier.price}
                                                                    onChange={(e) => updateTier(idx, tIdx, 'price', e.target.value ? Number(e.target.value) : '')}
                                                                    placeholder="0"
                                                                    className="h-8 text-sm"
                                                                />
                                                                <InputError message={(errors as any)?.[`template_data.catalogs.${idx}.pricing_tiers.${tIdx}.price`]} />
                                                            </div>
                                                            {entry.pricing_type === 'date' && (
                                                                <div className="flex flex-col gap-1">
                                                                    <Label className="text-xs">End Date</Label>
                                                                    {isLastTier(tIdx) ? (
                                                                        <Input
                                                                            disabled
                                                                            placeholder="No end date (catch-all)"
                                                                            className="h-8 text-sm"
                                                                        />
                                                                    ) : (
                                                                        <Input
                                                                            type="date"
                                                                            value={tier.end_date}
                                                                            onChange={(e) => updateTier(idx, tIdx, 'end_date', e.target.value)}
                                                                            className="h-8 text-sm"
                                                                        />
                                                                    )}
                                                                    <InputError message={(errors as any)?.[`template_data.catalogs.${idx}.pricing_tiers.${tIdx}.end_date`]} />
                                                                </div>
                                                            )}
                                                            {entry.pricing_type === 'quantity' && (
                                                                <div className="flex flex-col gap-1">
                                                                    <Label className="text-xs">Max Seats</Label>
                                                                    {isLastTier(tIdx) ? (
                                                                        <Input
                                                                            disabled
                                                                            placeholder="Unlimited (catch-all)"
                                                                            className="h-8 text-sm"
                                                                        />
                                                                    ) : (
                                                                        <Input
                                                                            type="number"
                                                                            min="1"
                                                                            value={tier.max_seats}
                                                                            onChange={(e) => updateTier(idx, tIdx, 'max_seats', e.target.value ? Number(e.target.value) : '')}
                                                                            className="h-8 text-sm"
                                                                        />
                                                                    )}
                                                                    <InputError message={(errors as any)?.[`template_data.catalogs.${idx}.pricing_tiers.${tIdx}.max_seats`]} />
                                                                </div>
                                                            )}
                                                        </div>
                                                        {!isLastTier(tIdx) && entry.pricing_tiers.length > 2 && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="mt-5 size-8 shrink-0 text-red-500 hover:text-red-600"
                                                                onClick={() => removeTier(idx, tIdx)}
                                                            >
                                                                <Trash2 className="size-3" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
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

EventTemplateForm.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
