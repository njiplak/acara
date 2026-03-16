import { router, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { FormResponse } from '@/lib/constant';
import { index, store, update } from '@/routes/backoffice/master/venue';
import type { Venue } from '@/types/venue';

type Props = {
    venue?: Venue;
};

export default function VenueForm({ venue }: Props) {
    const { data, setData, post, put, errors, processing } = useForm({
        name: venue?.name ?? '',
        address: venue?.address ?? '',
        city: venue?.city ?? '',
        maps_url: venue?.maps_url ?? '',
        capacity: venue?.capacity ?? '',
        notes: venue?.notes ?? '',
    });

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (venue) {
            put(update(venue.id).url, FormResponse);
        } else {
            post(store().url, FormResponse);
        }
    };

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{venue ? 'Edit Venue' : 'New Venue'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                        <Label>Name</Label>
                        <Input
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            The venue or location name (e.g. "Grand Ballroom Hotel XYZ")
                        </p>
                        <InputError message={errors?.name} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label>Address</Label>
                        <Textarea
                            rows={2}
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Full street address of the venue
                        </p>
                        <InputError message={errors?.address} />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                            <Label>City</Label>
                            <Input
                                value={data.city}
                                onChange={(e) => setData('city', e.target.value)}
                            />
                            <InputError message={errors?.city} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label>Capacity</Label>
                            <Input
                                type="number"
                                min="1"
                                placeholder="Unlimited"
                                value={data.capacity}
                                onChange={(e) => setData('capacity', e.target.value ? Number(e.target.value) : ('' as any))}
                            />
                            <p className="text-xs text-muted-foreground">
                                Leave empty for no capacity limit
                            </p>
                            <InputError message={errors?.capacity} />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label>Maps URL</Label>
                        <Input
                            type="url"
                            placeholder="https://maps.google.com/..."
                            value={data.maps_url}
                            onChange={(e) => setData('maps_url', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Google Maps or other map link for directions
                        </p>
                        <InputError message={errors?.maps_url} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label>Notes</Label>
                        <Textarea
                            rows={3}
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Additional information (e.g. parking details, entrance instructions)
                        </p>
                        <InputError message={errors?.notes} />
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

VenueForm.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
