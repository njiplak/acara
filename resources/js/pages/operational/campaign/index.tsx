import { router } from '@inertiajs/react';
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table';
import { Send } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import IndexPage from '@/components/index-page';
import AppLayout from '@/layouts/app-layout';
import { createDateColumn } from '@/lib/column-helpers';
import {
    create,
    destroy as destroyRoute,
    destroyBulk,
    fetch as fetchRoute,
    send as sendRoute,
    show,
} from '@/routes/backoffice/operational/campaign';
import type { Campaign } from '@/types/campaign';
import type { CustomerTag } from '@/types/customer';

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

function handleSend(id: number) {
    if (!confirm('Are you sure you want to send this campaign? This cannot be undone.')) return;
    router.post(sendRoute(id).url);
}

const helper = createColumnHelper<Campaign>();

const columns: ColumnDef<Campaign, any>[] = [
    helper.accessor('name', {
        id: 'name',
        header: 'Name',
        enableColumnFilter: false,
    }),
    helper.display({
        id: 'target_tags',
        header: 'Target',
        enableColumnFilter: false,
        cell: (ctx) => (
            <div className="flex flex-wrap gap-1">
                {ctx.row.original.target_tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                        {tagLabels[tag] || tag}
                    </Badge>
                ))}
            </div>
        ),
    }),
    helper.display({
        id: 'template',
        header: 'Template',
        enableColumnFilter: false,
        cell: (ctx) => ctx.row.original.mail_template?.name || '-',
    }),
    helper.accessor('sent_count', {
        id: 'sent_count',
        header: 'Sent',
        enableColumnFilter: false,
        cell: (ctx) => {
            const row = ctx.row.original;
            return row.sent_at ? row.sent_count : '-';
        },
    }),
    helper.display({
        id: 'status',
        header: 'Status',
        enableColumnFilter: false,
        cell: (ctx) => {
            const row = ctx.row.original;
            if (row.sent_at) {
                return <Badge variant="default">Sent</Badge>;
            }
            return <Badge variant="outline">Draft</Badge>;
        },
    }),
    createDateColumn<Campaign>('created_at'),
    helper.display({
        id: 'action_send',
        header: '',
        enableColumnFilter: false,
        enableHiding: false,
        cell: (ctx) => {
            const row = ctx.row.original;
            if (row.sent_at) return null;
            return (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSend(row.id)}
                >
                    <Send className="size-4" />
                    Send
                </Button>
            );
        },
    }),
];

const routes = { fetch: fetchRoute, destroy: destroyRoute, destroyBulk, show, create };

export default function CampaignIndex() {
    return (
        <IndexPage<Campaign>
            title="Campaigns"
            description="Create and send re-engagement email campaigns to customer segments"
            addLabel="Create Campaign"
            columns={columns}
            routes={routes}
        />
    );
}

CampaignIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
