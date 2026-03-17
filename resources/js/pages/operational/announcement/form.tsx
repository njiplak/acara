import { router, useForm } from '@inertiajs/react';
import { LoaderCircle, Send, Users } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

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
import {
    index,
    store,
    recipientCount as recipientCountRoute,
} from '@/routes/backoffice/operational/announcement';
import type { Event } from '@/types/event';

type Props = {
    events: Event[];
};

export default function AnnouncementForm({ events }: Props) {
    const { data, setData, post, errors, processing } = useForm({
        event_id: '' as string | number,
        subject: '',
        message: '',
    });

    const [recipientCount, setRecipientCount] = useState<number | null>(null);
    const [loadingCount, setLoadingCount] = useState(false);

    const fetchRecipientCount = useCallback((eventId: string | number) => {
        if (!eventId) {
            setRecipientCount(0);
            return;
        }

        setLoadingCount(true);
        fetch(`${recipientCountRoute().url}?event_id=${eventId}`)
            .then((res) => res.json())
            .then((json) => setRecipientCount(json.count))
            .catch(() => setRecipientCount(null))
            .finally(() => setLoadingCount(false));
    }, []);

    useEffect(() => {
        fetchRecipientCount(data.event_id);
    }, [data.event_id, fetchRecipientCount]);

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!confirm(`Send this announcement to ${recipientCount ?? 0} attendee(s)? This cannot be undone.`)) return;
        post(store().url, {
            onSuccess: () => {
                router.visit(index().url);
            },
        });
    };

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>New Announcement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                        <Label>Event</Label>
                        <Select
                            value={String(data.event_id)}
                            onValueChange={(v) => setData('event_id', Number(v))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select an event" />
                            </SelectTrigger>
                            <SelectContent>
                                {events.map((event) => (
                                    <SelectItem key={event.id} value={String(event.id)}>
                                        {event.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            The announcement will be sent to all checked-in attendees of this event.
                        </p>
                        <InputError message={errors?.event_id} />
                    </div>

                    {data.event_id && (
                        <div className="flex items-center gap-2 rounded-md border bg-accent/50 px-3 py-2 text-sm">
                            <Users className="size-4 text-muted-foreground" />
                            {loadingCount ? (
                                <span className="text-muted-foreground">Counting recipients...</span>
                            ) : (
                                <span>
                                    <strong>{recipientCount ?? 0}</strong> checked-in attendee{(recipientCount ?? 0) !== 1 ? 's' : ''} will receive this
                                </span>
                            )}
                        </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                        <Label>Subject</Label>
                        <Input
                            value={data.subject}
                            onChange={(e) => setData('subject', e.target.value)}
                            placeholder="e.g. Room Change: Session moved to Hall B"
                        />
                        <InputError message={errors?.subject} />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label>Message</Label>
                        <Textarea
                            rows={5}
                            value={data.message}
                            onChange={(e) => setData('message', e.target.value)}
                            placeholder="Write your announcement here..."
                        />
                        <p className="text-xs text-muted-foreground">
                            This message will be sent as an email to all checked-in attendees.
                        </p>
                        <InputError message={errors?.message} />
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
                <Button
                    type="submit"
                    disabled={processing || !data.event_id || !data.subject || !data.message || recipientCount === 0}
                >
                    {processing ? (
                        <LoaderCircle className="size-4 animate-spin" />
                    ) : (
                        <Send className="size-4" />
                    )}
                    {processing ? 'Sending...' : `Send to ${recipientCount ?? 0} attendee${(recipientCount ?? 0) !== 1 ? 's' : ''}`}
                </Button>
            </div>
        </form>
    );
}

AnnouncementForm.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
