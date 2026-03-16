import { router, useForm } from '@inertiajs/react';
import { ArrowLeft, LoaderCircle } from 'lucide-react';
import { Link } from '@inertiajs/react';

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
import { index, store, update } from '@/routes/backoffice/master/event/materials';
import type { Event } from '@/types/event';
import type { EventMaterial } from '@/types/event-material';

type Props = {
    event: Event;
    material?: EventMaterial;
};

export default function MaterialForm({ event, material }: Props) {
    const catalogs = event.catalogs || [];
    const { data, setData, post, errors, processing } = useForm({
        event_id: event.id,
        catalog_id: material?.catalog_id ?? '',
        title: material?.title ?? '',
        type: material?.type ?? 'link',
        content: material?.content ?? '',
        attachment: null as File | null,
        available_from: material?.available_from ? material.available_from.slice(0, 16) : '',
        available_until: material?.available_until ? material.available_until.slice(0, 16) : '',
    });

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (material) {
            router.post(
                update(event.id, material.id).url,
                { ...data, _method: 'PUT' },
                { ...FormResponse, forceFormData: true },
            );
        } else {
            post(store(event.id).url, { ...FormResponse, forceFormData: true });
        }
    };

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <Link
                href={index(event.id).url}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
                <ArrowLeft className="size-3.5" />
                Back to Materials
            </Link>

            <Card>
                <CardHeader>
                    <CardTitle>{material ? 'Edit Material' : 'New Material'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                        <Label>Title</Label>
                        <Input
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder="e.g. Session Slides, Recording Link"
                        />
                        <InputError message={errors?.title} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                            <Label>Type</Label>
                            <Select
                                value={data.type}
                                onValueChange={(val) => setData('type', val as any)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="file">File</SelectItem>
                                    <SelectItem value="link">Link</SelectItem>
                                    <SelectItem value="note">Note</SelectItem>
                                    <SelectItem value="video">Video</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={errors?.type} />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label>Scope</Label>
                            <Select
                                value={data.catalog_id?.toString() ?? 'all'}
                                onValueChange={(val) => setData('catalog_id', val === 'all' ? ('' as any) : Number(val))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All attendees</SelectItem>
                                    {catalogs.map((c) => (
                                        <SelectItem key={c.id} value={c.id.toString()}>
                                            {c.name} only
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Who can see this material
                            </p>
                            <InputError message={errors?.catalog_id} />
                        </div>
                    </div>

                    {data.type === 'file' && (
                        <div className="flex flex-col gap-1.5">
                            <Label>File</Label>
                            <input
                                type="file"
                                className="block w-full text-sm file:mr-3 file:rounded-md file:border file:border-border file:bg-background file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-foreground hover:file:bg-accent"
                                onChange={(e) => setData('attachment', e.target.files?.[0] || null)}
                            />
                            <p className="text-xs text-muted-foreground">Max 10MB</p>
                            {material?.media?.[0] && (
                                <p className="text-xs text-muted-foreground">
                                    Current file: {material.media[0].file_name}
                                </p>
                            )}
                            <InputError message={errors?.attachment} />
                        </div>
                    )}

                    {data.type === 'video' && (
                        <div className="flex flex-col gap-1.5">
                            <Label>Video URL</Label>
                            <Input
                                type="url"
                                placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                                value={data.content}
                                onChange={(e) => setData('content', e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Supports YouTube and Vimeo links. The video will be embedded for attendees.
                            </p>
                            <InputError message={errors?.content} />
                        </div>
                    )}

                    {(data.type === 'link' || data.type === 'note') && (
                        <div className="flex flex-col gap-1.5">
                            <Label>{data.type === 'link' ? 'URL' : 'Note Content'}</Label>
                            {data.type === 'link' ? (
                                <Input
                                    type="url"
                                    placeholder="https://drive.google.com/..."
                                    value={data.content}
                                    onChange={(e) => setData('content', e.target.value)}
                                />
                            ) : (
                                <Textarea
                                    rows={4}
                                    placeholder="Write your notes here..."
                                    value={data.content}
                                    onChange={(e) => setData('content', e.target.value)}
                                />
                            )}
                            <InputError message={errors?.content} />
                        </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                            <Label>Available From</Label>
                            <Input
                                type="datetime-local"
                                value={data.available_from}
                                onChange={(e) => setData('available_from', e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Leave empty to make available immediately
                            </p>
                            <InputError message={errors?.available_from} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label>Available Until</Label>
                            <Input
                                type="datetime-local"
                                value={data.available_until}
                                onChange={(e) => setData('available_until', e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Leave empty for no expiry
                            </p>
                            <InputError message={errors?.available_until} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.visit(index(event.id).url)}
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

MaterialForm.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
