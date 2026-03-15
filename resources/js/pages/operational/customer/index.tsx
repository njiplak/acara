import { createColumnHelper, type ColumnDef } from '@tanstack/react-table';

import IndexPage from '@/components/index-page';
import AppLayout from '@/layouts/app-layout';
import { createDateColumn } from '@/lib/column-helpers';
import {
    destroy as destroyRoute,
    destroyBulk,
    fetch as fetchRoute,
    show,
} from '@/routes/backoffice/operational/customer';
import type { Customer } from '@/types/customer';

const helper = createColumnHelper<Customer>();

const columns: ColumnDef<Customer, any>[] = [
    helper.accessor('id', {
        id: 'id',
        header: 'ID',
        enableColumnFilter: false,
        enableHiding: false,
    }),
    helper.display({
        id: 'customer',
        header: 'Customer',
        enableColumnFilter: false,
        enableHiding: false,
        cell: (ctx) => {
            const { name, avatar } = ctx.row.original;
            return (
                <div className="flex items-center gap-2">
                    {avatar ? (
                        <img src={avatar} alt={name} className="size-7 rounded-full" />
                    ) : (
                        <div className="flex size-7 items-center justify-center rounded-full bg-muted text-xs font-medium">
                            {name.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <span>{name}</span>
                </div>
            );
        },
    }),
    helper.accessor('email', {
        id: 'email',
        header: 'Email',
        enableColumnFilter: false,
        enableHiding: false,
    }),
    helper.accessor('referral_code', {
        id: 'referral_code',
        header: 'Referral Code',
        enableColumnFilter: false,
        enableHiding: false,
        cell: (ctx) => ctx.getValue() || '-',
    }),
    createDateColumn<Customer>('created_at'),
];

// Customers self-register via Google, no create route needed
const routes = {
    fetch: fetchRoute,
    destroy: destroyRoute,
    destroyBulk,
    show,
    create: show as any,
};

export default function CustomerIndex() {
    return (
        <IndexPage<Customer>
            title="Customer Management"
            description="Manage customers registered via Google"
            columns={columns}
            routes={routes}
            hideAdd
        />
    );
}

CustomerIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
