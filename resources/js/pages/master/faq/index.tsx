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
} from '@/routes/backoffice/master/faq';
import type { Faq } from '@/types/faq';

const helper = createColumnHelper<Faq>();

const columns: ColumnDef<Faq, any>[] = [
    helper.accessor('id', {
        id: 'id',
        header: 'ID',
        enableColumnFilter: false,
        enableHiding: false,
    }),
    helper.accessor('question', {
        id: 'question',
        header: 'Question',
        enableColumnFilter: false,
        enableHiding: false,
    }),
    helper.accessor('sort_order', {
        id: 'sort_order',
        header: 'Order',
        enableColumnFilter: false,
        enableHiding: false,
    }),
    helper.accessor('is_active', {
        id: 'is_active',
        header: 'Status',
        enableColumnFilter: false,
        enableHiding: false,
        cell: (ctx) =>
            ctx.getValue() ? (
                <Badge variant="default">Active</Badge>
            ) : (
                <Badge variant="secondary">Inactive</Badge>
            ),
    }),
    createDateColumn<Faq>('created_at'),
];

const routes = { fetch: fetchRoute, destroy: destroyRoute, destroyBulk, show, create };

export default function FaqIndex() {
    return (
        <IndexPage<Faq>
            title="FAQ Management"
            description="Manage frequently asked questions displayed on the landing page"
            addLabel="Add FAQ"
            columns={columns}
            routes={routes}
        />
    );
}

FaqIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
