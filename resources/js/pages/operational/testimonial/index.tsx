import { router } from '@inertiajs/react';
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table';
import { Star } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import IndexPage from '@/components/index-page';
import AppLayout from '@/layouts/app-layout';
import { createDateColumn } from '@/lib/column-helpers';
import {
    fetch as fetchRoute,
    toggleHighlight,
} from '@/routes/backoffice/operational/testimonial';
import type { Testimonial } from '@/types/testimonial';

function handleToggle(id: number) {
    router.post(toggleHighlight.url(id));
}

const helper = createColumnHelper<Testimonial>();

const columns: ColumnDef<Testimonial, any>[] = [
    helper.display({
        id: 'customer',
        header: 'Customer',
        enableColumnFilter: false,
        cell: (ctx) => {
            const customer = ctx.row.original.customer;
            if (!customer) return '-';
            return (
                <div className="flex items-center gap-2">
                    {customer.avatar ? (
                        <img src={customer.avatar} alt={customer.name} className="size-6 rounded-full" />
                    ) : (
                        <div className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                            {customer.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <span className="text-sm">{customer.name}</span>
                </div>
            );
        },
    }),
    helper.display({
        id: 'event',
        header: 'Event',
        enableColumnFilter: false,
        cell: (ctx) => ctx.row.original.event?.name || '-',
    }),
    helper.display({
        id: 'catalog',
        header: 'Session',
        enableColumnFilter: false,
        cell: (ctx) => ctx.row.original.catalog?.name || '-',
    }),
    helper.accessor('rating', {
        id: 'rating',
        header: 'Rating',
        enableColumnFilter: false,
        cell: (ctx) => (
            <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                        key={i}
                        className={`size-3.5 ${i < ctx.getValue() ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
                    />
                ))}
            </div>
        ),
    }),
    helper.accessor('body', {
        id: 'body',
        header: 'Feedback',
        enableColumnFilter: false,
        cell: (ctx) => {
            const body = ctx.getValue();
            if (!body) return <span className="text-muted-foreground">-</span>;
            return <span className="line-clamp-2 max-w-xs text-sm">{body}</span>;
        },
    }),
    helper.accessor('is_highlighted', {
        id: 'is_highlighted',
        header: 'Landing Page',
        enableColumnFilter: false,
        cell: (ctx) => {
            const highlighted = ctx.getValue();
            return (
                <Badge variant={highlighted ? 'default' : 'outline'}>
                    {highlighted ? 'Displayed' : 'Hidden'}
                </Badge>
            );
        },
    }),
    createDateColumn<Testimonial>('created_at'),
    helper.display({
        id: 'action',
        header: 'Action',
        enableColumnFilter: false,
        enableHiding: false,
        cell: (ctx) => {
            const row = ctx.row.original;
            return (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggle(row.id)}
                >
                    {row.is_highlighted ? 'Remove from LP' : 'Show on LP'}
                </Button>
            );
        },
    }),
];

const routes = {
    fetch: fetchRoute,
    show: fetchRoute as any,
    destroy: fetchRoute as any,
    destroyBulk: fetchRoute as any,
    create: fetchRoute as any,
};

export default function TestimonialIndex() {
    return (
        <IndexPage<Testimonial>
            title="Testimonials"
            description="Manage customer feedback and select which to display on the landing page"
            columns={columns}
            routes={routes}
            hideAdd
            disableSelect
            showActionColumn={false}
        />
    );
}

TestimonialIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
