import { router, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

import InputError from '@/components/input-error';
import TiptapEditor from '@/components/tiptap-editor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { FormResponse } from '@/lib/constant';
import { index, store, update } from '@/routes/backoffice/master/article';
import type { Article } from '@/types/article';

type Props = {
    article?: Article;
};

export default function ArticleForm({ article }: Props) {
    const { data, setData, post, errors, processing } = useForm({
        title: article?.title ?? '',
        excerpt: article?.excerpt ?? '',
        content: article?.content ?? '',
        is_published: article?.is_published ?? false,
        featured_image: null as File | null,
    });

    const currentImage = article?.media?.[0]?.original_url;

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (article) {
            router.post(
                update(article.id).url,
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
                    <CardTitle>{article ? 'Edit Article' : 'New Article'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                        <Label>Title</Label>
                        <Input
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                        />
                        <InputError message={errors?.title} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label>Excerpt</Label>
                        <Textarea
                            rows={3}
                            value={data.excerpt}
                            onChange={(e) => setData('excerpt', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            A short summary shown on the blog listing page
                        </p>
                        <InputError message={errors?.excerpt} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label>Content</Label>
                        <TiptapEditor
                            content={data.content}
                            onChange={(html) => setData('content', html)}
                            placeholder="Write your article content..."
                        />
                        <InputError message={errors?.content} />
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="is_published"
                            checked={data.is_published}
                            onCheckedChange={(checked) => setData('is_published', checked === true)}
                        />
                        <Label htmlFor="is_published">Publish</Label>
                    </div>
                    <InputError message={errors?.is_published} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Featured Image</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {currentImage && !data.featured_image && (
                        <div className="flex flex-col gap-1.5">
                            <Label>Current Image</Label>
                            <img
                                src={currentImage}
                                alt={article?.title}
                                className="h-32 w-auto rounded-md object-cover"
                            />
                        </div>
                    )}
                    <div className="flex flex-col gap-1.5">
                        <Label>{currentImage ? 'Replace Image' : 'Upload Image'}</Label>
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setData('featured_image', e.target.files?.[0] ?? null)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Featured image for the article (max 2MB)
                        </p>
                        <InputError message={errors?.featured_image} />
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

ArticleForm.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
