import { router, useForm } from '@inertiajs/react';
import { Clock, LoaderCircle, Trash2 } from 'lucide-react';

import InputError from '@/components/input-error';
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
import { index, store, update } from '@/routes/backoffice/master/event';
import type { Catalog } from '@/types/catalog';
import type { Event } from '@/types/event';
import type { Venue } from '@/types/venue';

type ScheduleEntry = {
    time: string;
    end_time: string;
    title: string;
    description: string;
};

type CatalogEntry = {
    catalog_id: number | '';
    max_participant: number | '';
};

type Props = {
    event?: Event;
    catalogs?: Catalog[];
    venues?: Venue[];
};

export default function EventForm({ event, catalogs = [], venues = [] }: Props) {
    const initialSchedule: ScheduleEntry[] =
        event?.schedule?.map((s) => ({
            time: s.time ?? '',
            end_time: s.end_time ?? '',
            title: s.title ?? '',
            description: s.description ?? '',
        })) ?? [];

    const initialCatalogs: CatalogEntry[] =
        event?.catalogs?.map((c) => ({
            catalog_id: c.id,
            max_participant: c.pivot?.max_participant ?? '',
        })) ?? [];

    const { data, setData, post, put, errors, processing } = useForm({
        name: event?.name ?? '',
        description: event?.description ?? '',
        start_date: event?.start_date ?? '',
        end_date: event?.end_date ?? '',
        status: event?.status ?? 'draft',
        payment_method: event?.payment_method ?? 'manual',
        venue_id: event?.venue_id ?? '',
        material_require_checkin: event?.material_require_checkin ?? true,
        schedule: initialSchedule,
        catalogs: initialCatalogs,
    });

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (event) {
            put(update(event.id).url, FormResponse);
        } else {
            post(store().url, FormResponse);
        }
    };

    const addCatalog = () => {
        setData('catalogs', [...data.catalogs, { catalog_id: '', max_participant: '' }]);
    };

    const removeCatalog = (idx: number) => {
        setData(
            'catalogs',
            data.catalogs.filter((_, i) => i !== idx),
        );
    };

    const updateCatalog = (idx: number, field: keyof CatalogEntry, value: any) => {
        const updated = [...data.catalogs];
        updated[idx] = { ...updated[idx], [field]: value };
        setData('catalogs', updated);
    };

    const addScheduleItem = () => {
        setData('schedule', [...data.schedule, { time: '', end_time: '', title: '', description: '' }]);
    };

    const removeScheduleItem = (idx: number) => {
        setData('schedule', data.schedule.filter((_, i) => i !== idx));
    };

    const updateScheduleItem = (idx: number, field: keyof ScheduleEntry, value: string) => {
        const updated = [...data.schedule];
        updated[idx] = { ...updated[idx], [field]: value };
        setData('schedule', updated);
    };

    const selectedCatalogIds = data.catalogs.map((c) => c.catalog_id).filter(Boolean);

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{event ? 'Edit Event' : 'New Event'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                        <Label>Name</Label>
                        <Input
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            The event name visible to customers (e.g. "Weekend Wellness Retreat")
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
                            Describe the event purpose and what participants can expect
                        </p>
                        <InputError message={errors?.description} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Schedule & Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                            <Label>Start Date</Label>
                            <Input
                                type="date"
                                value={data.start_date}
                                onChange={(e) => setData('start_date', e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                When the event begins
                            </p>
                            <InputError message={errors?.start_date} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label>End Date</Label>
                            <Input
                                type="date"
                                value={data.end_date}
                                onChange={(e) => setData('end_date', e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                When the event ends (must be on or after start date)
                            </p>
                            <InputError message={errors?.end_date} />
                        </div>
                    </div>
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
                                Draft events are not visible to customers, published events are live
                            </p>
                            <InputError message={errors?.status} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label>Payment Method</Label>
                            <Select
                                value={data.payment_method}
                                onValueChange={(val) => setData('payment_method', val as any)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="manual">Manual</SelectItem>
                                    <SelectItem value="qris">QRIS</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                How customers pay for this event — manual transfer or QRIS scan
                            </p>
                            <InputError message={errors?.payment_method} />
                        </div>
                    </div>
                    {venues.length > 0 && (
                        <div className="flex flex-col gap-1.5">
                            <Label>Venue</Label>
                            <Select
                                value={data.venue_id?.toString() ?? ''}
                                onValueChange={(val) => setData('venue_id', val === 'none' ? ('' as any) : Number(val))}
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
                                Assign a venue to this event (optional)
                            </p>
                            <InputError message={errors?.venue_id} />
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
                            aria-checked={data.material_require_checkin}
                            onClick={() => setData('material_require_checkin', !data.material_require_checkin)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                                data.material_require_checkin ? 'bg-foreground' : 'bg-muted'
                            }`}
                        >
                            <span
                                className={`pointer-events-none inline-block size-5 rounded-full bg-background shadow-lg transition-transform ${
                                    data.material_require_checkin ? 'translate-x-5' : 'translate-x-0'
                                }`}
                            />
                        </button>
                    </div>
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
                        Build the event timeline with time slots and activity descriptions
                    </p>
                    {data.schedule.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                            No schedule items yet. Click "Add Item" to build the timeline.
                        </p>
                    )}
                    <div className="space-y-3">
                        {data.schedule.map((entry, idx) => (
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
                                            <InputError message={(errors as any)?.[`schedule.${idx}.time`]} />
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
                                            <InputError message={(errors as any)?.[`schedule.${idx}.end_time`]} />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <Label>Title</Label>
                                        <Input
                                            value={entry.title}
                                            onChange={(e) => updateScheduleItem(idx, 'title', e.target.value)}
                                            placeholder="e.g. Registration, Session 1, Break"
                                        />
                                        <InputError message={(errors as any)?.[`schedule.${idx}.title`]} />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <Label>Description</Label>
                                        <Textarea
                                            rows={2}
                                            value={entry.description}
                                            onChange={(e) => updateScheduleItem(idx, 'description', e.target.value)}
                                            placeholder="Optional details about this activity"
                                        />
                                        <InputError message={(errors as any)?.[`schedule.${idx}.description`]} />
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
                    <InputError message={errors?.schedule} />
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
                        Attach catalog items to this event and set the maximum participants for each
                    </p>
                    {data.catalogs.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                            No catalogs attached yet. Click "Add Catalog" to get started.
                        </p>
                    )}
                    <div className="space-y-3">
                        {data.catalogs.map((entry, idx) => (
                            <div
                                key={idx}
                                className="flex items-start gap-3 rounded-md border p-3"
                            >
                                <div className="grid flex-1 gap-3 sm:grid-cols-2">
                                    <div className="flex flex-col gap-1.5">
                                        <Label>Catalog</Label>
                                        <Select
                                            value={entry.catalog_id?.toString() ?? ''}
                                            onValueChange={(val) =>
                                                updateCatalog(idx, 'catalog_id', Number(val))
                                            }
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
                                                        <SelectItem
                                                            key={c.id}
                                                            value={c.id.toString()}
                                                        >
                                                            {c.name} — Rp{' '}
                                                            {Number(c.price).toLocaleString('id-ID')}
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError
                                            message={
                                                (errors as any)?.[`catalogs.${idx}.catalog_id`]
                                            }
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <Label>Max Participant</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            placeholder="Unlimited"
                                            value={entry.max_participant}
                                            onChange={(e) =>
                                                updateCatalog(
                                                    idx,
                                                    'max_participant',
                                                    e.target.value ? Number(e.target.value) : '',
                                                )
                                            }
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Leave empty for unlimited capacity
                                        </p>
                                        <InputError
                                            message={
                                                (errors as any)?.[
                                                    `catalogs.${idx}.max_participant`
                                                ]
                                            }
                                        />
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
                        ))}
                    </div>
                    <InputError message={errors?.catalogs} />
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

EventForm.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
