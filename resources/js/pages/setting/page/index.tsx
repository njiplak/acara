import { createColumnHelper, type ColumnDef } from '@tanstack/react-table';

import IndexPage from '@/components/index-page';
import AppLayout from '@/layouts/app-layout';
import { createDateColumn } from '@/lib/column-helpers';
import {
    create,
    destroy as destroyRoute,
    destroyBulk,
    fetch as fetchRoute,
    show,
} from '@/routes/backoffice/setting/page';
import type { Page } from '@/types/page';

const helper = createColumnHelper<Page>();

const columns: ColumnDef<Page, any>[] = [
    helper.accessor('title', {
        id: 'title',
        header: 'Title',
        enableColumnFilter: false,
        enableHiding: false,
    }),
    helper.accessor('slug', {
        id: 'slug',
        header: 'Slug',
        enableColumnFilter: false,
        enableHiding: false,
        cell: (ctx) => (
            <span className="font-mono text-xs text-muted-foreground">
                /{ctx.getValue()}
            </span>
        ),
    }),
    helper.accessor('status', {
        id: 'status',
        header: 'Status',
        enableColumnFilter: false,
        enableHiding: false,
        cell: (ctx) => {
            const status = ctx.getValue();
            return (
                <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                        status === 'published'
                            ? 'bg-green-50 text-green-700 ring-green-600/20'
                            : 'bg-yellow-50 text-yellow-700 ring-yellow-600/20'
                    }`}
                >
                    {status}
                </span>
            );
        },
    }),
    helper.display({
        id: 'is_system',
        header: 'Type',
        enableColumnFilter: false,
        enableHiding: false,
        cell: (ctx) => {
            const isSystem = ctx.row.original.is_system;
            return isSystem ? (
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                    System
                </span>
            ) : (
                <span className="text-xs text-muted-foreground">Custom</span>
            );
        },
    }),
    createDateColumn<Page>('updated_at', 'Last Updated'),
];

const routes = { fetch: fetchRoute, destroy: destroyRoute, destroyBulk, show, create };

export default function PageIndex() {
    return (
        <IndexPage<Page>
            title="Page Management"
            description="Manage content pages like Terms of Service, Privacy Policy, etc."
            addLabel="Add Page"
            columns={columns}
            routes={routes}
        />
    );
}

PageIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
