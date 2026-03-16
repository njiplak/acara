import { Link, router } from '@inertiajs/react';
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table';
import { BarChart3, Copy, Users } from 'lucide-react';
import { createElement, useState } from 'react';

import IndexPage from '@/components/index-page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import { createDateColumn } from '@/lib/column-helpers';
import {
    create,
    destroy as destroyRoute,
    destroyBulk,
    economics,
    fetch as fetchRoute,
    registrants,
    show,
} from '@/routes/backoffice/master/event';
import type { Event } from '@/types/event';

const helper = createColumnHelper<Event>();

const columns: ColumnDef<Event, any>[] = [
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
    helper.accessor('start_date', {
        id: 'start_date',
        header: 'Start Date',
        enableColumnFilter: false,
        enableHiding: false,
        cell: (ctx) =>
            new Date(ctx.getValue()).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            }),
    }),
    helper.accessor('end_date', {
        id: 'end_date',
        header: 'End Date',
        enableColumnFilter: false,
        enableHiding: false,
        cell: (ctx) =>
            new Date(ctx.getValue()).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            }),
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
    helper.accessor('payment_method', {
        id: 'payment_method',
        header: 'Payment',
        enableColumnFilter: false,
        enableHiding: false,
        cell: (ctx) => (
            <Badge variant="outline" className="uppercase">
                {ctx.getValue()}
            </Badge>
        ),
    }),
    helper.display({
        id: 'catalogs_count',
        header: 'Catalogs',
        enableColumnFilter: false,
        enableHiding: false,
        cell: (ctx) => ctx.row.original.catalogs?.length ?? 0,
    }),
    createDateColumn<Event>('created_at'),
];

const routes = { fetch: fetchRoute, destroy: destroyRoute, destroyBulk, show, create };

export default function EventIndex() {
    return (
        <IndexPage<Event>
            title="Event Management"
            description="Manage events that group catalogs within a date range"
            addLabel="Add Event"
            columns={columns}
            routes={routes}
            actionExtras={(row) =>
                createElement('div', null,
                    createElement(
                        Link,
                        { href: registrants.url(row.id), method: 'get' } as any,
                        createElement(DropdownMenuItem, null, createElement(Users, { className: 'size-4' }), ' Registrants'),
                    ),
                    createElement(
                        Link,
                        { href: economics.url(row.id), method: 'get' } as any,
                        createElement(DropdownMenuItem, null, createElement(BarChart3, { className: 'size-4' }), ' Economics'),
                    ),
                )
            }
        />
    );
}

EventIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
