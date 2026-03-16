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
} from '@/routes/backoffice/master/venue';
import type { Venue } from '@/types/venue';

const helper = createColumnHelper<Venue>();

const columns: ColumnDef<Venue, any>[] = [
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
    helper.accessor('city', {
        id: 'city',
        header: 'City',
        enableColumnFilter: false,
        enableHiding: false,
    }),
    helper.accessor('capacity', {
        id: 'capacity',
        header: 'Capacity',
        enableColumnFilter: false,
        enableHiding: false,
        cell: (ctx) => {
            const val = ctx.getValue();
            return val ? val.toLocaleString('id-ID') : 'Unlimited';
        },
    }),
    createDateColumn<Venue>('created_at'),
];

const routes = { fetch: fetchRoute, destroy: destroyRoute, destroyBulk, show, create };

export default function VenueIndex() {
    return (
        <IndexPage<Venue>
            title="Venue Management"
            description="Manage event venues and locations"
            addLabel="Add Venue"
            columns={columns}
            routes={routes}
        />
    );
}

VenueIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
