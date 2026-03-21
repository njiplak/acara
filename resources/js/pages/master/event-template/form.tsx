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
import { index, store, update } from '@/routes/backoffice/master/event-template';
import type { Model } from '@/types/model';

type EventTemplate = Model & {
    name: string;
    description: string | null;
    template_data: Record<string, any>;
};

type Props = {
    template?: EventTemplate;
};

export default function EventTemplateForm({ template }: Props) {
    const { data, setData, post, put, errors, processing } = useForm({
        name: template?.name ?? '',
        description: template?.description ?? '',
        template_data: template?.template_data ?? {
            description: '',
            payment_gateway: 'manual',
            currency: 'IDR',
            material_require_checkin: true,
            schedule: [],
            catalogs: [],
        },
    });

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (template) {
            put(update(template.id).url, FormResponse);
        } else {
            post(store().url, FormResponse);
        }
    };

    const templateData = data.template_data;

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{template ? 'Edit Template' : 'New Template'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                        <Label>Template Name</Label>
                        <Input
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            A label for this template (e.g. "Weekend Workshop", "Monthly Meetup")
                        </p>
                        <InputError message={errors?.name} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label>Description</Label>
                        <Textarea
                            rows={2}
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Optional note about when to use this template
                        </p>
                        <InputError message={errors?.description} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Template Data</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                        <Label>Event Description</Label>
                        <Textarea
                            rows={3}
                            value={templateData.description ?? ''}
                            onChange={(e) => setData('template_data', { ...templateData, description: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">
                            Default event description when using this template
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label>Payment Gateway</Label>
                            <select
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                                value={templateData.payment_gateway ?? 'manual'}
                                onChange={(e) => setData('template_data', { ...templateData, payment_gateway: e.target.value })}
                            >
                                <option value="manual">Manual Transfer</option>
                                <option value="xendit">Xendit</option>
                                <option value="stripe">Stripe</option>
                                <option value="midtrans">Midtrans</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label>Currency</Label>
                            <select
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                                value={templateData.currency ?? 'IDR'}
                                onChange={(e) => setData('template_data', { ...templateData, currency: e.target.value })}
                            >
                                <option value="IDR">IDR</option>
                                <option value="USD">USD</option>
                                <option value="SGD">SGD</option>
                                <option value="EUR">EUR</option>
                            </select>
                        </div>
                    </div>

                    {templateData.catalogs && templateData.catalogs.length > 0 && (
                        <div className="flex flex-col gap-1.5">
                            <Label>Saved Catalogs</Label>
                            <p className="text-xs text-muted-foreground">
                                {templateData.catalogs.length} catalog(s) pre-configured in this template
                            </p>
                        </div>
                    )}

                    {templateData.schedule && templateData.schedule.length > 0 && (
                        <div className="flex flex-col gap-1.5">
                            <Label>Saved Schedule</Label>
                            <p className="text-xs text-muted-foreground">
                                {templateData.schedule.length} schedule item(s) pre-configured in this template
                            </p>
                        </div>
                    )}

                    <InputError message={errors?.template_data} />
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

EventTemplateForm.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
