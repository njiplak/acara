import { Link } from '@inertiajs/react';
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table';
import { BarChart3 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import IndexPage from '@/components/index-page';
import AppLayout from '@/layouts/app-layout';
import { createDateColumn } from '@/lib/column-helpers';
import {
    create,
    destroy as destroyRoute,
    destroyBulk,
    fetch as fetchRoute,
    show,
    results as resultsRoute,
} from '@/routes/backoffice/operational/survey';
import type { Survey } from '@/types/survey';

const helper = createColumnHelper<Survey>();

const columns: ColumnDef<Survey, any>[] = [
    helper.display({
        id: 'event',
        header: 'Event',
        enableColumnFilter: false,
        cell: (ctx) => ctx.row.original.event?.name || '-',
    }),
    helper.accessor('title', {
        id: 'title',
        header: 'Title',
        enableColumnFilter: false,
    }),
    helper.accessor('slug', {
        id: 'slug',
        header: 'Slug',
        enableColumnFilter: false,
        cell: (ctx) => (
            <span className="font-mono text-xs text-muted-foreground">{ctx.getValue()}</span>
        ),
    }),
    helper.display({
        id: 'questions_count',
        header: 'Questions',
        enableColumnFilter: false,
        cell: (ctx) => ctx.row.original.questions?.length || 0,
    }),
    helper.display({
        id: 'responses_count',
        header: 'Responses',
        enableColumnFilter: false,
        cell: (ctx) => ctx.row.original.responses?.length || 0,
    }),
    helper.accessor('is_active', {
        id: 'is_active',
        header: 'Status',
        enableColumnFilter: false,
        cell: (ctx) => (
            <Badge variant={ctx.getValue() ? 'default' : 'outline'}>
                {ctx.getValue() ? 'Active' : 'Inactive'}
            </Badge>
        ),
    }),
    createDateColumn<Survey>('created_at'),
    helper.display({
        id: 'results',
        header: '',
        enableColumnFilter: false,
        enableHiding: false,
        cell: (ctx) => (
            <Button variant="outline" size="sm" asChild>
                <Link href={resultsRoute(ctx.row.original.id).url}>
                    <BarChart3 className="size-4" />
                    Results
                </Link>
            </Button>
        ),
    }),
];

const routes = { fetch: fetchRoute, destroy: destroyRoute, destroyBulk, show, create };

export default function SurveyIndex() {
    return (
        <IndexPage<Survey>
            title="Survey Management"
            description="Create and manage post-event surveys"
            addLabel="Create Survey"
            columns={columns}
            routes={routes}
        />
    );
}

SurveyIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
