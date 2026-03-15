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
    helper.accessor('strike_price', {
        id: 'strike_price',
        header: 'Strike Price',
        enableColumnFilter: false,
        enableHiding: false,
        cell: (ctx) => {
            const val = ctx.getValue();
            return val ? `Rp ${Number(val).toLocaleString('id-ID')}` : '-';
        },
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
