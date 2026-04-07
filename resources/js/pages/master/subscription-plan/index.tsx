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
} from '@/routes/backoffice/master/subscription-plan';
import type { SubscriptionPlan } from '@/types/subscription';

function formatPrice(price: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
}

const helper = createColumnHelper<SubscriptionPlan>();

const columns: ColumnDef<SubscriptionPlan, any>[] = [
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
        cell: (ctx) => formatPrice(ctx.getValue()),
    }),
    helper.display({
        id: 'billing',
        header: 'Billing Cycle',
        cell: (ctx) => {
            const p = ctx.row.original;
            if (!p.periodicity || !p.periodicity_type) return <span className="text-muted-foreground">Lifetime</span>;
            return <span>{p.periodicity} {p.periodicity_type}{p.periodicity > 1 ? 's' : ''}</span>;
        },
    }),
    helper.display({
        id: 'features_count',
        header: 'Features',
        cell: (ctx) => <span>{ctx.row.original.features?.length ?? 0}</span>,
    }),
    helper.display({
        id: 'subscribers',
        header: 'Subscribers',
        cell: (ctx) => <span>{ctx.row.original.subscribers_count ?? 0}</span>,
    }),
    helper.display({
        id: 'status',
        header: 'Status',
        cell: (ctx) => {
            const p = ctx.row.original;
            return p.is_active
                ? <Badge variant="default">Active</Badge>
                : <Badge variant="outline">Inactive</Badge>;
        },
    }),
    createDateColumn<SubscriptionPlan>('created_at'),
];

const routes = { fetch: fetchRoute, destroy: destroyRoute, destroyBulk, show, create };

export default function SubscriptionPlanIndex() {
    return (
        <IndexPage<SubscriptionPlan>
            title="Subscription Plans"
            description="Manage membership plans and pricing"
            addLabel="Add Plan"
            columns={columns}
            routes={routes}
        />
    );
}

SubscriptionPlanIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
