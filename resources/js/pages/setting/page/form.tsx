import { router, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import {
    EditorContent,
    EditorRoot,
    useEditor,
} from 'novel';
import { useEffect, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
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
import { index, store, update } from '@/routes/backoffice/setting/page';
import type { Page } from '@/types/page';

type Props = {
    page_data?: Page;
};

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function EditorSyncer({ setContent }: { setContent: (html: string) => void }) {
    const { editor } = useEditor();

    useEffect(() => {
        if (!editor) return;
        const handler = () => setContent(editor.getHTML());
        editor.on('update', handler);
        return () => {
            editor.off('update', handler);
        };
    }, [editor, setContent]);

    return null;
}

export default function PageForm({ page_data }: Props) {
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!page_data);
    const [htmlLoaded, setHtmlLoaded] = useState(false);

    const { data, setData, post, put, errors, processing } = useForm({
        title: page_data?.title ?? '',
        slug: page_data?.slug ?? '',
        content: page_data?.content ?? '',
        status: page_data?.status ?? 'draft',
        meta_description: page_data?.meta_description ?? '',
    });

    useEffect(() => {
        if (!slugManuallyEdited) {
            setData('slug', slugify(data.title));
        }
    }, [data.title, slugManuallyEdited]);

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (page_data) {
            put(update(page_data.id).url, FormResponse);
        } else {
            post(store().url, FormResponse);
        }
    };

    return (
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">
                    {page_data ? 'Edit Page' : 'New Page'}
                </h1>
                {page_data?.is_system && (
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                        System Page
                    </span>
                )}
            </div>
            <form onSubmit={onSubmit} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                        <Label>Title</Label>
                        <Input
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                        />
                        <InputError message={errors?.title} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label>Slug</Label>
                        <Input
                            value={data.slug}
                            onChange={(e) => {
                                setSlugManuallyEdited(true);
                                setData('slug', e.target.value);
                            }}
                        />
                        <InputError message={errors?.slug} />
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                        <Label>Status</Label>
                        <Select
                            value={data.status}
                            onValueChange={(value) =>
                                setData('status', value as 'draft' | 'published')
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="published">Published</SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={errors?.status} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label>Meta Description</Label>
                        <Textarea
                            rows={1}
                            value={data.meta_description}
                            onChange={(e) =>
                                setData('meta_description', e.target.value)
                            }
                        />
                        <InputError message={errors?.meta_description} />
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label>Content</Label>
                    <div className="min-h-64 rounded-md border border-input">
                        <EditorRoot>
                            <EditorContent
                                onUpdate={({ editor }) => {
                                    setData('content', editor.getHTML());
                                }}
                                onCreate={({ editor }) => {
                                    if (page_data?.content && !htmlLoaded) {
                                        editor.commands.setContent(page_data.content);
                                        setHtmlLoaded(true);
                                    }
                                }}
                                className="prose dark:prose-invert max-w-none p-4 focus:outline-none [&_.tiptap]:min-h-48 [&_.tiptap]:focus:outline-none"
                                immediatelyRender={false}
                            />
                        </EditorRoot>
                    </div>
                    <InputError message={errors?.content} />
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.visit(index().url)}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={processing}>
                        {processing && (
                            <LoaderCircle className="size-4 animate-spin" />
                        )}
                        Save
                    </Button>
                </div>
            </form>
        </div>
    );
}

PageForm.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
