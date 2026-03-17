import { router, useForm } from '@inertiajs/react';
import { CalendarPlus, LoaderCircle } from 'lucide-react';
import { useMemo } from 'react';

import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { index } from '@/routes/backoffice/master/event-template';
import { generate } from '@/routes/backoffice/master/event-template';
import type { Venue } from '@/types/venue';

type EventTemplate = {
    id: number;
    name: string;
    description: string | null;
    template_data: {
        description?: string;
        payment_method?: string;
        schedule?: any[];
        catalogs?: any[];
    };
};

type Props = {
    template: EventTemplate;
    venues: Venue[];
};

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const dayShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function countOccurrences(days: number[], startDate: string, endDate: string): number {
    if (!startDate || !endDate || days.length === 0) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    let count = 0;
    const current = new Date(start);
    while (current <= end) {
        if (days.includes(current.getDay())) count++;
        current.setDate(current.getDate() + 1);
    }
    return count;
}

export default function GenerateRecurring({ template, venues }: Props) {
    const { data, setData, post, errors, processing } = useForm({
        days: [] as number[],
        start_date: '',
        end_date: '',
        event_time: '',
        venue_id: '' as string | number,
    });

    const eventCount = useMemo(
        () => countOccurrences(data.days, data.start_date, data.end_date),
        [data.days, data.start_date, data.end_date],
    );

    const toggleDay = (day: number) => {
        const next = data.days.includes(day)
            ? data.days.filter((d) => d !== day)
            : [...data.days, day].sort();
        setData('days', next);
    };

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (eventCount === 0) return;
        if (!confirm(`This will create ${eventCount} events as draft. Continue?`)) return;
        post(generate(template.id).url);
    };

    const catalogCount = template.template_data.catalogs?.length ?? 0;
    const scheduleCount = template.template_data.schedule?.length ?? 0;

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Generate Recurring Events</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="rounded-md border bg-accent/50 p-4">
                        <p className="text-sm font-medium">Template: {template.name}</p>
                        <div className="mt-1 flex gap-2 text-xs text-muted-foreground">
                            <span>{catalogCount} catalog{catalogCount !== 1 ? 's' : ''}</span>
                            <span>{scheduleCount} schedule item{scheduleCount !== 1 ? 's' : ''}</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label>Days of Week</Label>
                        <div className="flex flex-wrap gap-2">
                            {dayNames.map((name, idx) => {
                                const isSelected = data.days.includes(idx);
                                return (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => toggleDay(idx)}
                                    >
                                        <Badge variant={isSelected ? 'default' : 'outline'}>
                                            {dayShort[idx]}
                                        </Badge>
                                    </button>
                                );
                            })}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Select which days of the week to generate events for
                        </p>
                        <InputError message={errors?.days} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                            <Label>Start Date</Label>
                            <Input
                                type="date"
                                value={data.start_date}
                                onChange={(e) => setData('start_date', e.target.value)}
                            />
                            <InputError message={errors?.start_date} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label>End Date</Label>
                            <Input
                                type="date"
                                value={data.end_date}
                                onChange={(e) => setData('end_date', e.target.value)}
                            />
                            <InputError message={errors?.end_date} />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                            <Label>Event Time</Label>
                            <Input
                                type="time"
                                value={data.event_time}
                                onChange={(e) => setData('event_time', e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Start time for each generated event
                            </p>
                            <InputError message={errors?.event_time} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label>Venue</Label>
                            <Select
                                value={String(data.venue_id)}
                                onValueChange={(v) => setData('venue_id', Number(v) as any)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select venue (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    {venues.map((venue) => (
                                        <SelectItem key={venue.id} value={String(venue.id)}>
                                            {venue.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors?.venue_id} />
                        </div>
                    </div>

                    {eventCount > 0 && (
                        <div className="flex items-center gap-2 rounded-md border bg-accent/50 px-3 py-2 text-sm">
                            <CalendarPlus className="size-4 text-muted-foreground" />
                            <span>
                                Will generate <strong>{eventCount}</strong> event{eventCount !== 1 ? 's' : ''} as draft
                            </span>
                        </div>
                    )}
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
                <Button type="submit" disabled={processing || eventCount === 0}>
                    {processing ? (
                        <LoaderCircle className="size-4 animate-spin" />
                    ) : (
                        <CalendarPlus className="size-4" />
                    )}
                    {processing ? 'Generating...' : `Generate ${eventCount} Event${eventCount !== 1 ? 's' : ''}`}
                </Button>
            </div>
        </form>
    );
}

GenerateRecurring.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
