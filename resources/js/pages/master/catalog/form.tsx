import { router, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { MaskedInput } from '@/components/masked-input';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { FormResponse } from '@/lib/constant';
import { index, store, update } from '@/routes/backoffice/master/catalog';
import type { Addon } from '@/types/addon';
import type { Catalog } from '@/types/catalog';
import type { Speaker } from '@/types/speaker';

type Props = {
    catalog?: Catalog;
    addons?: Addon[];
    speakers?: Speaker[];
};

export default function CatalogForm({ catalog, addons = [], speakers = [] }: Props) {
    const initialAddonIds = catalog?.addons?.map((a) => a.id) ?? [];
    const initialSpeakerIds = catalog?.speakers?.map((s) => s.id) ?? [];

    const { data, setData, post, put, errors, processing } = useForm({
        name: catalog?.name ?? '',
        description: catalog?.description ?? '',
        strike_price: catalog?.strike_price ?? '',
        price: catalog?.price ?? '',
        addon_ids: initialAddonIds,
        speaker_ids: initialSpeakerIds,
    });

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (catalog) {
            put(update(catalog.id).url, FormResponse);
        } else {
            post(store().url, FormResponse);
        }
    };

    const toggleAddon = (id: number) => {
        setData(
            'addon_ids',
            data.addon_ids.includes(id)
                ? data.addon_ids.filter((a) => a !== id)
                : [...data.addon_ids, id],
        );
    };

    const toggleSpeaker = (id: number) => {
        setData(
            'speaker_ids',
            data.speaker_ids.includes(id)
                ? data.speaker_ids.filter((s) => s !== id)
                : [...data.speaker_ids, id],
        );
    };

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{catalog ? 'Edit Catalog' : 'New Catalog'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                        <Label>Name</Label>
                        <Input
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            The name of this catalog item (e.g. "Morning Yoga", "Sound Bath Session")
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
                            Describe what this catalog item offers to the customer
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

            {addons.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Addons</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-3 text-xs text-muted-foreground">
                            Select which add-on items are available for purchase with this catalog
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                            {addons.map((addon) => (
                                <label
                                    key={addon.id}
                                    className="flex items-center gap-2 rounded-md border p-3 text-sm"
                                >
                                    <Checkbox
                                        checked={data.addon_ids.includes(addon.id)}
                                        onCheckedChange={() => toggleAddon(addon.id)}
                                    />
                                    <div className="flex flex-col">
                                        <span className="font-medium">{addon.name}</span>
                                        <span className="text-xs text-muted-foreground">
                                            Rp {Number(addon.price).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                </label>
                            ))}
                        </div>
                        <InputError message={errors?.addon_ids} />
                    </CardContent>
                </Card>
            )}

            {speakers.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Speakers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-3 text-xs text-muted-foreground">
                            Select which speakers are associated with this catalog
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                            {speakers.map((speaker) => (
                                <label
                                    key={speaker.id}
                                    className="flex items-center gap-2 rounded-md border p-3 text-sm"
                                >
                                    <Checkbox
                                        checked={data.speaker_ids.includes(speaker.id)}
                                        onCheckedChange={() => toggleSpeaker(speaker.id)}
                                    />
                                    <div className="flex flex-col">
                                        <span className="font-medium">{speaker.name}</span>
                                        {speaker.title && (
                                            <span className="text-xs text-muted-foreground">
                                                {speaker.title}
                                            </span>
                                        )}
                                    </div>
                                </label>
                            ))}
                        </div>
                        <InputError message={errors?.speaker_ids} />
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

CatalogForm.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
