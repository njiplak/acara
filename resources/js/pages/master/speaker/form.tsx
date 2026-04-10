import { router, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

import InputError from '@/components/input-error';
import TiptapEditor from '@/components/tiptap-editor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { FormResponse } from '@/lib/constant';
import { index, store, update } from '@/routes/backoffice/master/speaker';
import type { Speaker } from '@/types/speaker';

type Props = {
    speaker?: Speaker;
};

export default function SpeakerForm({ speaker }: Props) {
    const { data, setData, post, errors, processing } = useForm({
        name: speaker?.name ?? '',
        title: speaker?.title ?? '',
        bio: speaker?.bio ?? '',
        photo: null as File | null,
    });

    const currentPhoto = speaker?.media?.[0]?.original_url;

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (speaker) {
            router.post(
                update(speaker.id).url,
                { ...data, _method: 'PUT' } as any,
                { ...FormResponse, forceFormData: true },
            );
        } else {
            post(store().url, { ...FormResponse, forceFormData: true });
        }
    };

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{speaker ? 'Edit Speaker' : 'New Speaker'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                        <Label>Name</Label>
                        <Input
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            The full name of the speaker
                        </p>
                        <InputError message={errors?.name} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label>Title</Label>
                        <Input
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Professional title or role (e.g. "Yoga Instructor", "Keynote Speaker")
                        </p>
                        <InputError message={errors?.title} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label>Bio</Label>
                        <TiptapEditor
                            content={data.bio}
                            onChange={(html) => setData('bio', html)}
                            placeholder="Write the speaker's biography..."
                        />
                        <p className="text-xs text-muted-foreground">
                            A short biography or description of the speaker
                        </p>
                        <InputError message={errors?.bio} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Photo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {currentPhoto && !data.photo && (
                        <div className="flex flex-col gap-1.5">
                            <Label>Current Photo</Label>
                            <img
                                src={currentPhoto}
                                alt={speaker?.name}
                                className="h-24 w-24 rounded-md object-cover"
                            />
                        </div>
                    )}
                    <div className="flex flex-col gap-1.5">
                        <Label>{currentPhoto ? 'Replace Photo' : 'Upload Photo'}</Label>
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setData('photo', e.target.files?.[0] ?? null)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Upload a photo of the speaker (max 2MB)
                        </p>
                        <InputError message={errors?.photo} />
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

SpeakerForm.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
