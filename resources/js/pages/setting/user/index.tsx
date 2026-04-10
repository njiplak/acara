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
} from '@/routes/backoffice/setting/user';
import type { User } from '@/types/auth';

type UserWithRole = User & {
    roles: { id: number; name: string }[];
};

const helper = createColumnHelper<UserWithRole>();

const columns: ColumnDef<UserWithRole, any>[] = [
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
    helper.accessor('email', {
        id: 'email',
        header: 'Email',
        enableColumnFilter: false,
        enableHiding: false,
    }),
    helper.display({
        id: 'role',
        header: 'Role',
        enableColumnFilter: false,
        enableHiding: false,
        cell: (ctx) => {
            const role = ctx.row.original.roles?.[0];
            return role ? (
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                    {role.name}
                </span>
            ) : (
                <span className="text-muted-foreground text-xs">No role</span>
            );
        },
    }),
    createDateColumn<UserWithRole>('created_at'),
];

const routes = { fetch: fetchRoute, destroy: destroyRoute, destroyBulk, show, create };

export default function UserIndex() {
    return (
        <IndexPage<UserWithRole>
            title="User Management"
            description="Manage backoffice users and their roles"
            addLabel="Add User"
            columns={columns}
            routes={routes}
        />
    );
}

UserIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
