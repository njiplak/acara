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
} from '@/routes/backoffice/master/subscription-feature';
import type { SubscriptionFeature } from '@/types/subscription';

const helper = createColumnHelper<SubscriptionFeature>();

const columns: ColumnDef<SubscriptionFeature, any>[] = [
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
        cell: (ctx) => <span className="text-sm text-muted-foreground">{ctx.getValue() || '-'}</span>,
    }),
    helper.display({
        id: 'type',
        header: 'Type',
        cell: (ctx) => {
            const f = ctx.row.original;
            return f.consumable
                ? <Badge variant="secondary">Consumable</Badge>
                : <Badge variant="outline">Boolean</Badge>;
        },
    }),
    helper.display({
        id: 'reset',
        header: 'Reset Period',
        cell: (ctx) => {
            const f = ctx.row.original;
            if (!f.consumable || !f.periodicity) return <span className="text-muted-foreground">-</span>;
            return <span>{f.periodicity} {f.periodicity_type}{f.periodicity > 1 ? 's' : ''}</span>;
        },
    }),
    helper.display({
        id: 'plans_count',
        header: 'Plans',
        cell: (ctx) => <span>{ctx.row.original.plans?.length ?? 0}</span>,
    }),
    createDateColumn<SubscriptionFeature>('created_at'),
];

const routes = { fetch: fetchRoute, destroy: destroyRoute, destroyBulk, show, create };

export default function SubscriptionFeatureIndex() {
    return (
        <IndexPage<SubscriptionFeature>
            title="Subscription Features"
            description="Manage features that can be attached to plans"
            addLabel="Add Feature"
            columns={columns}
            routes={routes}
        />
    );
}

SubscriptionFeatureIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
