import { router, useForm } from '@inertiajs/react';
import { LoaderCircle, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import InputError from '@/components/input-error';
import TiptapEditor from '@/components/tiptap-editor';
import { Badge } from '@/components/ui/badge';
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
import AppLayout from '@/layouts/app-layout';
import { FormResponse } from '@/lib/constant';
import { index, store, update } from '@/routes/backoffice/setting/mail-template';
import type { MailTemplate } from '@/types/mail-template';

type Props = {
    mail_template?: MailTemplate;
};

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export default function MailTemplateForm({ mail_template }: Props) {
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!mail_template);
    const [newVariable, setNewVariable] = useState('');

    const { data, setData, post, put, errors, processing } = useForm({
        slug: mail_template?.slug ?? '',
        name: mail_template?.name ?? '',
        subject: mail_template?.subject ?? '',
        body: mail_template?.body ?? '',
        variables: mail_template?.variables ?? ([] as string[]),
        is_active: mail_template?.is_active ?? true,
    });

    useEffect(() => {
        if (!slugManuallyEdited) {
            setData('slug', slugify(data.name));
        }
    }, [data.name, slugManuallyEdited]);

    const addVariable = () => {
        const trimmed = newVariable.trim().replace(/\s+/g, '_').toLowerCase();
        if (trimmed && !data.variables.includes(trimmed)) {
            setData('variables', [...data.variables, trimmed]);
            setNewVariable('');
        }
    };

    const removeVariable = (variable: string) => {
        setData(
            'variables',
            data.variables.filter((v) => v !== variable),
        );
    };

    const insertVariable = (variable: string) => {
        navigator.clipboard.writeText(`{{${variable}}}`);
    };

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (mail_template) {
            put(update(mail_template.id).url, FormResponse);
        } else {
            post(store().url, FormResponse);
        }
    };

    return (
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
            <h1 className="text-xl font-semibold">
                {mail_template ? 'Edit Mail Template' : 'New Mail Template'}
            </h1>
            <form onSubmit={onSubmit} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                        <Label>Name</Label>
                        <Input
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g. Order Confirmation"
                        />
                        <InputError message={errors?.name} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label>Slug</Label>
                        <Input
                            value={data.slug}
                            onChange={(e) => {
                                setSlugManuallyEdited(true);
                                setData('slug', e.target.value);
                            }}
                            placeholder="e.g. order-confirmation"
                        />
                        <InputError message={errors?.slug} />
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                        <Label>Subject</Label>
                        <Input
                            value={data.subject}
                            onChange={(e) => setData('subject', e.target.value)}
                            placeholder="e.g. Your order #{{order_number}} is confirmed"
                        />
                        <p className="text-xs text-muted-foreground">
                            Use {'{{variable_name}}'} for dynamic content
                        </p>
                        <InputError message={errors?.subject} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label>Status</Label>
                        <Select
                            value={data.is_active ? 'active' : 'inactive'}
                            onValueChange={(value) =>
                                setData('is_active', value === 'active')
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={errors?.is_active} />
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label>Variables</Label>
                    <div className="flex gap-2">
                        <Input
                            value={newVariable}
                            onChange={(e) => setNewVariable(e.target.value)}
                            placeholder="e.g. customer_name"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addVariable();
                                }
                            }}
                        />
                        <Button type="button" variant="outline" size="icon" onClick={addVariable}>
                            <Plus className="size-4" />
                        </Button>
                    </div>
                    {data.variables.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                            {data.variables.map((variable) => (
                                <Badge
                                    key={variable}
                                    variant="secondary"
                                    className="cursor-pointer gap-1 pr-1"
                                    title={`Click to copy {{${variable}}}`}
                                    onClick={() => insertVariable(variable)}
                                >
                                    <code className="text-xs">{`{{${variable}}}`}</code>
                                    <button
                                        type="button"
                                        className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeVariable(variable);
                                        }}
                                    >
                                        <X className="size-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                        Click a variable badge to copy its placeholder to clipboard,
                        then paste into the subject or body
                    </p>
                    <InputError message={errors?.variables} />
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label>Body</Label>
                    <TiptapEditor
                        content={data.body}
                        onChange={(html) => setData('body', html)}
                        placeholder="Start writing..."
                    />
                    <InputError message={errors?.body} />
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

MailTemplateForm.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
