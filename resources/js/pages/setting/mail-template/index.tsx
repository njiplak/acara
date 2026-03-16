import { createColumnHelper, type ColumnDef } from '@tanstack/react-table';

import IndexPage from '@/components/index-page';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { createDateColumn } from '@/lib/column-helpers';
import {
    create,
    destroy as destroyRoute,
    destroyBulk,
    fetch as fetchRoute,
    show,
} from '@/routes/backoffice/setting/mail-template';
import type { MailTemplate } from '@/types/mail-template';

const helper = createColumnHelper<MailTemplate>();

const columns: ColumnDef<MailTemplate, any>[] = [
    helper.accessor('name', {
        id: 'name',
        header: 'Name',
        enableColumnFilter: false,
        enableHiding: false,
    }),
    helper.accessor('slug', {
        id: 'slug',
        header: 'Slug',
        enableColumnFilter: false,
        enableHiding: false,
        cell: (ctx) => (
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                {ctx.getValue()}
            </code>
        ),
    }),
    helper.accessor('subject', {
        id: 'subject',
        header: 'Subject',
        enableColumnFilter: false,
        enableHiding: false,
    }),
    helper.accessor('is_active', {
        id: 'is_active',
        header: 'Status',
        enableColumnFilter: false,
        enableHiding: false,
        cell: (ctx) => (
            <Badge variant={ctx.getValue() ? 'default' : 'secondary'}>
                {ctx.getValue() ? 'Active' : 'Inactive'}
            </Badge>
        ),
    }),
    createDateColumn<MailTemplate>('created_at'),
];

const routes = { fetch: fetchRoute, destroy: destroyRoute, destroyBulk, show, create };

export default function MailTemplateIndex() {
    return (
        <IndexPage<MailTemplate>
            title="Mail Templates"
            description="Manage email templates and wording"
            addLabel="Add Template"
            columns={columns}
            routes={routes}
        />
    );
}

MailTemplateIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
