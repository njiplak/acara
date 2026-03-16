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
} from '@/routes/backoffice/master/event-template';
import type { Model } from '@/types/model';

type EventTemplate = Model & {
    name: string;
    description: string | null;
};

const helper = createColumnHelper<EventTemplate>();

const columns: ColumnDef<EventTemplate, any>[] = [
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
    helper.accessor('description', {
        id: 'description',
        header: 'Description',
        enableColumnFilter: false,
        enableHiding: false,
        cell: (ctx) => {
            const val = ctx.getValue();
            if (!val) return '-';
            return val.length > 60 ? val.slice(0, 60) + '...' : val;
        },
    }),
    createDateColumn<EventTemplate>('created_at'),
];

const routes = { fetch: fetchRoute, destroy: destroyRoute, destroyBulk, show, create };

export default function EventTemplateIndex() {
    return (
        <IndexPage<EventTemplate>
            title="Event Templates"
            description="Manage reusable event configurations"
            addLabel="Add Template"
            columns={columns}
            routes={routes}
        />
    );
}

EventTemplateIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
