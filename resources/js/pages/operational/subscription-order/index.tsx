import { createColumnHelper, type ColumnDef } from '@tanstack/react-table';

import { Badge } from '@/components/ui/badge';
import IndexPage from '@/components/index-page';
import AppLayout from '@/layouts/app-layout';
import { createDateColumn } from '@/lib/column-helpers';
import {
    fetch as fetchRoute,
    show,
} from '@/routes/backoffice/operational/subscription-order';
import type { SubscriptionOrder, SubscriptionOrderStatus } from '@/types/subscription';

function formatPrice(price: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
}

const statusVariant: Record<SubscriptionOrderStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    pending_payment: 'outline',
    waiting_confirmation: 'secondary',
    confirmed: 'default',
    rejected: 'destructive',
    cancelled: 'outline',
};

const helper = createColumnHelper<SubscriptionOrder>();

const columns: ColumnDef<SubscriptionOrder, any>[] = [
    helper.accessor('order_code', {
        id: 'order_code',
        header: 'Code',
        enableColumnFilter: false,
        enableHiding: false,
        cell: (ctx) => <span className="font-mono text-xs">{ctx.getValue()}</span>,
    }),
    helper.display({
        id: 'customer',
        header: 'Customer',
        cell: (ctx) => {
            const c = ctx.row.original.customer;
            return c ? (
                <div>
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.email}</p>
                </div>
            ) : '-';
        },
    }),
    helper.display({
        id: 'plan',
        header: 'Plan',
        cell: (ctx) => <span>{ctx.row.original.plan?.name ?? '-'}</span>,
    }),
    helper.accessor('type', {
        id: 'type',
        header: 'Type',
        cell: (ctx) => <Badge variant="outline" className="capitalize">{ctx.getValue()}</Badge>,
    }),
    helper.accessor('amount', {
        id: 'amount',
        header: 'Amount',
        cell: (ctx) => formatPrice(ctx.getValue()),
    }),
    helper.accessor('status', {
        id: 'status',
        header: 'Status',
        cell: (ctx) => {
            const status = ctx.getValue() as SubscriptionOrderStatus;
            return <Badge variant={statusVariant[status]}>{status.replace(/_/g, ' ')}</Badge>;
        },
    }),
    createDateColumn<SubscriptionOrder>('created_at'),
];

const routes = {
    fetch: fetchRoute,
    show,
    destroy: undefined as any,
    destroyBulk: undefined as any,
    create: undefined as any,
};

export default function SubscriptionOrderIndex() {
    return (
        <IndexPage<SubscriptionOrder>
            title="Subscription Orders"
            description="Review and manage subscription payment orders"
            columns={columns}
            routes={routes}
            hideAdd
            disableSelect
        />
    );
}

SubscriptionOrderIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
