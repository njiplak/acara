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
} from '@/routes/backoffice/master/catalog';
import type { Catalog } from '@/types/catalog';

const helper = createColumnHelper<Catalog>();

const columns: ColumnDef<Catalog, any>[] = [
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
    helper.display({
        id: 'addons_count',
        header: 'Addons',
        enableColumnFilter: false,
        enableHiding: false,
        cell: (ctx) => ctx.row.original.addons?.length ?? 0,
    }),
    createDateColumn<Catalog>('created_at'),
];

const routes = { fetch: fetchRoute, destroy: destroyRoute, destroyBulk, show, create };

export default function CatalogIndex() {
    return (
        <IndexPage<Catalog>
            title="Catalog Management"
            description="Manage catalog items like classes, sessions, or services"
            addLabel="Add Catalog"
            columns={columns}
            routes={routes}
        />
    );
}

CatalogIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
