import { router, useForm } from '@inertiajs/react';
import { FileText, LoaderCircle } from 'lucide-react';
import { useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { FormResponse } from '@/lib/constant';
import { update } from '@/routes/backoffice/setting/operational';
import type { OperationalSetting } from '@/types/operational-setting';

type Props = {
    operationalSetting: OperationalSetting;
    certificateTemplateUrl?: string | null;
    certificateTemplateName?: string | null;
};

export default function OperationalSettingForm({ operationalSetting, certificateTemplateUrl, certificateTemplateName }: Props) {
    const { data, setData, errors, processing } = useForm<Record<string, any>>({
        payment_instruction: operationalSetting.payment_instruction ?? '',
        certificate_template: null as File | null,
    });

    const [certFileName, setCertFileName] = useState<string | null>(certificateTemplateName ?? null);

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        router.post(update().url, { ...data, _method: 'PUT' }, { ...FormResponse, forceFormData: true });
    };

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Payment Instructions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                        <Label>Payment Instruction</Label>
                        <Textarea
                            rows={5}
                            value={data.payment_instruction}
                            onChange={(e) => setData('payment_instruction', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Instructions shown to customers after placing an order (e.g. bank account details, transfer steps)
                        </p>
                        <InputError message={errors?.payment_instruction} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Certificate Template</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-2">
                        {certFileName && (
                            <div className="flex items-center gap-2 rounded-md border bg-accent/50 px-3 py-2 text-sm">
                                <FileText className="size-4 text-muted-foreground" />
                                <span className="flex-1">{certFileName}</span>
                            </div>
                        )}
                        <input
                            type="file"
                            accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            className="block w-full text-sm file:mr-3 file:rounded-md file:border file:border-border file:bg-background file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-foreground hover:file:bg-accent"
                            onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                setData('certificate_template', file);
                                if (file) setCertFileName(file.name);
                            }}
                        />
                        <p className="text-xs text-muted-foreground">
                            Upload a .docx template for attendance certificates. Use these placeholders in your template:
                        </p>
                        <div className="rounded-md border bg-muted/50 p-3">
                            <div className="grid grid-cols-2 gap-1 text-xs font-mono">
                                <span>{'${attendee_name}'}</span>
                                <span className="text-muted-foreground">Customer name</span>
                                <span>{'${event_name}'}</span>
                                <span className="text-muted-foreground">Event name</span>
                                <span>{'${catalog_name}'}</span>
                                <span className="text-muted-foreground">Session/catalog name</span>
                                <span>{'${event_date}'}</span>
                                <span className="text-muted-foreground">Event date(s)</span>
                                <span>{'${certificate_id}'}</span>
                                <span className="text-muted-foreground">Unique certificate ID</span>
                                <span>{'${business_name}'}</span>
                                <span className="text-muted-foreground">Your business name</span>
                                <span>{'${checked_in_date}'}</span>
                                <span className="text-muted-foreground">Check-in date</span>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            If no template is uploaded, a default certificate design will be used.
                        </p>
                        <InputError message={errors?.certificate_template} />
                    </div>
                </CardContent>
            </Card>

            <div className="flex">
                <Button type="submit" disabled={processing}>
                    {processing && <LoaderCircle className="size-4 animate-spin" />}
                    Save
                </Button>
            </div>
        </form>
    );
}

OperationalSettingForm.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
