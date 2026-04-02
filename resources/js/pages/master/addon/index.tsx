import { createColumnHelper, type ColumnDef } from '@tanstack/react-table';

import { Badge } from '@/components/ui/badge';
import IndexPage from '@/components/index-page';
import AppLayout from '@/layouts/app-layout';
import { createDateColumn } from '@/lib/column-helpers';
import {
    create,
    destroy as destroyRoute,
    destroyBulk,
    fetch as fetchRoute,
    show,
} from '@/routes/backoffice/master/addon';
import type { Addon } from '@/types/addon';

const helper = createColumnHelper<Addon>();

const columns: ColumnDef<Addon, any>[] = [
    helper.accessor('id', {
        id: 'id',
        header: 'ID',
        enableColumnFilter: false,
        enableHiding: false,
    }),
    helper.accessor('name', {
        id: 'name',
        header: 'Name',
        enableColumnFilter: false,
        enableHiding: false,
    }),
    helper.accessor('price', {
        id: 'price',
        header: 'Price',
        enableColumnFilter: false,
        enableHiding: false,
        cell: (ctx) => `Rp ${Number(ctx.getValue()).toLocaleString('id-ID')}`,
    }),
    helper.accessor('status', {
        id: 'status',
        header: 'Status',
        enableColumnFilter: false,
        enableHiding: false,
        cell: (ctx) => (
            <Badge variant={ctx.getValue() === 'published' ? 'default' : 'secondary'}>
                {ctx.getValue()}
            </Badge>
        ),
    }),
    helper.accessor('is_standalone', {
        id: 'is_standalone',
        header: 'Standalone',
        enableColumnFilter: false,
        enableHiding: false,
        cell: (ctx) => ctx.getValue() ? 'Yes' : 'No',
    }),
    helper.accessor('payment_gateway', {
        id: 'payment_gateway',
        header: 'Gateway',
        enableColumnFilter: false,
        enableHiding: false,
        cell: (ctx) => (
            <Badge variant="outline" className="uppercase">
                {ctx.getValue()}
            </Badge>
        ),
    }),
    createDateColumn<Addon>('created_at'),
];

const routes = { fetch: fetchRoute, destroy: destroyRoute, destroyBulk, show, create };

export default function AddonIndex() {
    return (
        <IndexPage<Addon>
            title="Addon Management"
            description="Manage add-on items that can be attached to catalogs"
            addLabel="Add Addon"
            columns={columns}
            routes={routes}
        />
    );
}

AddonIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
