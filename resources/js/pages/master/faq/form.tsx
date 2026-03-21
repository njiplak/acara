import { router, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { FormResponse } from '@/lib/constant';
import { index, store, update } from '@/routes/backoffice/master/faq';
import type { Faq } from '@/types/faq';

type Props = {
    faq?: Faq;
};

export default function FaqForm({ faq }: Props) {
    const { data, setData, post, put, errors, processing } = useForm({
        question: faq?.question ?? '',
        answer: faq?.answer ?? '',
        sort_order: faq?.sort_order ?? 0,
        is_active: faq?.is_active ?? true,
    });

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (faq) {
            put(update(faq.id).url, FormResponse);
        } else {
            post(store().url, FormResponse);
        }
    };

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{faq ? 'Edit FAQ' : 'New FAQ'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                        <Label>Question</Label>
                        <Input
                            value={data.question}
                            onChange={(e) => setData('question', e.target.value)}
                        />
                        <InputError message={errors?.question} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label>Answer</Label>
                        <Textarea
                            rows={4}
                            value={data.answer}
                            onChange={(e) => setData('answer', e.target.value)}
                        />
                        <InputError message={errors?.answer} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label>Sort Order</Label>
                        <Input
                            type="number"
                            min={0}
                            value={data.sort_order}
                            onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Lower numbers appear first
                        </p>
                        <InputError message={errors?.sort_order} />
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="is_active"
                            checked={data.is_active}
                            onCheckedChange={(checked) => setData('is_active', checked === true)}
                        />
                        <Label htmlFor="is_active">Active</Label>
                    </div>
                    <InputError message={errors?.is_active} />
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

FaqForm.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
