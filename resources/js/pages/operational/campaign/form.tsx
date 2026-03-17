import { router, useForm } from '@inertiajs/react';
import { LoaderCircle, Send, Users } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
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
import AppLayout from '@/layouts/app-layout';
import { FormResponse } from '@/lib/constant';
import {
    index,
    store,
    send as sendRoute,
    previewCount as previewCountRoute,
} from '@/routes/backoffice/operational/campaign';
import type { Campaign } from '@/types/campaign';
import type { CustomerTag } from '@/types/customer';
import type { MailTemplate } from '@/types/mail-template';

type Props = {
    campaign?: Campaign;
    mailTemplates: MailTemplate[];
};

const tagGroups: { label: string; tags: CustomerTag[] }[] = [
    { label: 'Frequency', tags: ['new', 'returning', 'loyal'] },
    { label: 'Recency', tags: ['active', 'lapsed', 'inactive'] },
    { label: 'Behavior', tags: ['no-show', 'big-spender', 'referrer'] },
];

const tagLabels: Record<CustomerTag, string> = {
    new: 'New',
    returning: 'Returning',
    loyal: 'Loyal',
    active: 'Active',
    lapsed: 'Lapsed',
    inactive: 'Inactive',
    'no-show': 'No-show',
    'big-spender': 'Big Spender',
    referrer: 'Referrer',
};

export default function CampaignForm({ campaign, mailTemplates }: Props) {
    const isSent = !!campaign?.sent_at;

    const { data, setData, post, errors, processing } = useForm({
        name: campaign?.name ?? '',
        target_tags: (campaign?.target_tags ?? []) as CustomerTag[],
        mail_template_id: campaign?.mail_template_id ?? '',
    });

    const [previewCount, setPreviewCount] = useState<number | null>(null);
    const [loadingCount, setLoadingCount] = useState(false);

    const fetchPreviewCount = useCallback((tags: CustomerTag[]) => {
        if (tags.length === 0) {
            setPreviewCount(0);
            return;
        }

        setLoadingCount(true);
        const params = new URLSearchParams();
        tags.forEach((tag) => params.append('tags[]', tag));

        fetch(`${previewCountRoute().url}?${params.toString()}`)
            .then((res) => res.json())
            .then((json) => setPreviewCount(json.count))
            .catch(() => setPreviewCount(null))
            .finally(() => setLoadingCount(false));
    }, []);

    useEffect(() => {
        fetchPreviewCount(data.target_tags);
    }, [data.target_tags, fetchPreviewCount]);

    const toggleTag = (tag: CustomerTag) => {
        const next = data.target_tags.includes(tag)
            ? data.target_tags.filter((t) => t !== tag)
            : [...data.target_tags, tag];
        setData('target_tags', next);
    };

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(store().url, FormResponse);
    };

    const handleSend = () => {
        if (!campaign) return;
        if (!confirm('Are you sure you want to send this campaign? This cannot be undone.')) return;
        router.post(sendRoute(campaign.id).url);
    };

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>
                        {isSent ? 'Campaign Details' : campaign ? 'Edit Campaign' : 'New Campaign'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                        <Label>Campaign Name</Label>
                        <Input
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g. March re-engagement — lapsed customers"
                            disabled={isSent}
                        />
                        <InputError message={errors?.name} />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label>Mail Template</Label>
                        <Select
                            value={String(data.mail_template_id)}
                            onValueChange={(v) => setData('mail_template_id', Number(v) as any)}
                            disabled={isSent}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a template" />
                            </SelectTrigger>
                            <SelectContent>
                                {mailTemplates.map((tpl) => (
                                    <SelectItem key={tpl.id} value={String(tpl.id)}>
                                        {tpl.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            Only active mail templates are shown. Template must include {'{{customer_name}}'} variable.
                        </p>
                        <InputError message={errors?.mail_template_id} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Target Audience</CardTitle>
                        <div className="flex items-center gap-2 text-sm">
                            <Users className="size-4 text-muted-foreground" />
                            {loadingCount ? (
                                <span className="text-muted-foreground">Counting...</span>
                            ) : previewCount !== null ? (
                                <span className="font-semibold">
                                    {previewCount} customer{previewCount !== 1 ? 's' : ''} match
                                </span>
                            ) : null}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="mb-4 text-sm text-muted-foreground">
                        Select one or more tags. Customers matching <strong>any</strong> of the selected tags will receive the email.
                    </p>
                    <div className="space-y-4">
                        {tagGroups.map((group) => (
                            <div key={group.label} className="flex flex-col gap-2">
                                <span className="text-sm font-medium text-muted-foreground">
                                    {group.label}
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                    {group.tags.map((tag) => {
                                        const isSelected = data.target_tags.includes(tag);
                                        return (
                                            <button
                                                key={tag}
                                                type="button"
                                                onClick={() => !isSent && toggleTag(tag)}
                                                disabled={isSent}
                                            >
                                                <Badge variant={isSelected ? 'default' : 'outline'}>
                                                    {tagLabels[tag]}
                                                </Badge>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                    <InputError message={errors?.target_tags} />
                </CardContent>
            </Card>

            {isSent ? (
                <div className="rounded-lg border bg-card p-5">
                    <div className="flex items-center gap-3 text-sm">
                        <Badge variant="default">Sent</Badge>
                        <span className="text-muted-foreground">
                            Sent to {campaign.sent_count} customer{campaign.sent_count !== 1 ? 's' : ''} on{' '}
                            {new Date(campaign.sent_at!).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </span>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.visit(index().url)}
                    >
                        Cancel
                    </Button>
                    {!campaign ? (
                        <Button type="submit" disabled={processing}>
                            {processing && <LoaderCircle className="size-4 animate-spin" />}
                            Save Campaign
                        </Button>
                    ) : (
                        <Button type="button" onClick={handleSend} disabled={previewCount === 0}>
                            <Send className="size-4" />
                            Send to {previewCount ?? 0} customer{(previewCount ?? 0) !== 1 ? 's' : ''}
                        </Button>
                    )}
                </div>
            )}
        </form>
    );
}

CampaignForm.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
