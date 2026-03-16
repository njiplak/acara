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
} from '@/routes/backoffice/master/speaker';
import type { Speaker } from '@/types/speaker';

const helper = createColumnHelper<Speaker>();

const columns: ColumnDef<Speaker, any>[] = [
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
    helper.accessor('title', {
        id: 'title',
        header: 'Title',
        enableColumnFilter: false,
        enableHiding: false,
        cell: (ctx) => ctx.getValue() || '-',
    }),
    createDateColumn<Speaker>('created_at'),
];

const routes = { fetch: fetchRoute, destroy: destroyRoute, destroyBulk, show, create };

export default function SpeakerIndex() {
    return (
        <IndexPage<Speaker>
            title="Speaker Management"
            description="Manage speakers that can be assigned to catalogs"
            addLabel="Add Speaker"
            columns={columns}
            routes={routes}
        />
    );
}

SpeakerIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
