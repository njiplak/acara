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
} from '@/routes/backoffice/master/voucher';
import type { Voucher } from '@/types/voucher';

function formatPrice(price: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
}

const helper = createColumnHelper<Voucher>();

const columns: ColumnDef<Voucher, any>[] = [
    helper.accessor('code', {
        id: 'code',
        header: 'Code',
        enableColumnFilter: false,
        enableHiding: false,
        cell: (ctx) => <span className="font-mono text-xs">{ctx.getValue()}</span>,
    }),
    helper.accessor('name', {
        id: 'name',
        header: 'Name',
        enableColumnFilter: false,
        enableHiding: false,
    }),
    helper.display({
        id: 'discount',
        header: 'Discount',
        cell: (ctx) => {
            const v = ctx.row.original;
            if (v.type === 'percentage') {
                return (
                    <span>
                        {v.value}%
                        {v.max_discount ? <span className="text-muted-foreground"> (max {formatPrice(v.max_discount)})</span> : null}
                    </span>
                );
            }
            return formatPrice(v.value);
        },
    }),
    helper.display({
        id: 'scope',
        header: 'Scope',
        cell: (ctx) => {
            const v = ctx.row.original;
            if (v.catalog) return <span className="text-xs">{v.catalog.name}</span>;
            if (v.event) return <span className="text-xs">{v.event.name}</span>;
            return <span className="text-xs text-muted-foreground">All events</span>;
        },
    }),
    helper.display({
        id: 'usage',
        header: 'Usage',
        cell: (ctx) => {
            const v = ctx.row.original;
            const used = v.used_count ?? 0;
            const max = v.max_uses;
            return (
                <span className="text-sm">
                    {used}{max ? `/${max}` : ''}
                </span>
            );
        },
    }),
    helper.display({
        id: 'status',
        header: 'Status',
        cell: (ctx) => {
            const v = ctx.row.original;
            if (!v.is_active) return <Badge variant="outline">Inactive</Badge>;
            if (v.valid_until && new Date(v.valid_until) < new Date()) return <Badge variant="secondary">Expired</Badge>;
            if (v.max_uses && (v.used_count ?? 0) >= v.max_uses) return <Badge variant="secondary">Exhausted</Badge>;
            return <Badge variant="default">Active</Badge>;
        },
    }),
    createDateColumn<Voucher>('created_at'),
];

const routes = { fetch: fetchRoute, destroy: destroyRoute, destroyBulk, show, create };

export default function VoucherIndex() {
    return (
        <IndexPage<Voucher>
            title="Voucher Management"
            description="Manage promo codes and vouchers"
            addLabel="Add Voucher"
            columns={columns}
            routes={routes}
        />
    );
}

VoucherIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
