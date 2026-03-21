import { createColumnHelper, type ColumnDef } from '@tanstack/react-table';
import { Download } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import IndexPage from '@/components/index-page';
import AppLayout from '@/layouts/app-layout';
import { createDateColumn } from '@/lib/column-helpers';
import {
    fetch as fetchRoute,
    show,
} from '@/routes/backoffice/operational/order';
import type { Order, OrderStatus } from '@/types/order';

const statusConfig: Record<OrderStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    pending_payment: { label: 'Pending Payment', variant: 'outline' },
    waiting_confirmation: { label: 'Waiting', variant: 'secondary' },
    confirmed: { label: 'Confirmed', variant: 'default' },
    rejected: { label: 'Rejected', variant: 'destructive' },
    cancelled: { label: 'Cancelled', variant: 'outline' },
    refunded: { label: 'Refunded', variant: 'secondary' },
};

function formatPrice(price: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
}

const helper = createColumnHelper<Order>();

const columns: ColumnDef<Order, any>[] = [
    helper.accessor('order_code', {
        id: 'order_code',
        header: 'Order Code',
        enableColumnFilter: false,
        enableHiding: false,
        cell: (ctx) => <span className="font-mono text-xs">{ctx.getValue()}</span>,
    }),
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
    helper.accessor('total_amount', {
        id: 'total_amount',
        header: 'Total',
        enableColumnFilter: false,
        cell: (ctx) => <span className="font-medium">{formatPrice(ctx.getValue())}</span>,
    }),
    helper.accessor('payment_gateway', {
        id: 'payment_gateway',
        header: 'Gateway',
        enableColumnFilter: false,
        cell: (ctx) => (
            <Badge variant="outline" className="capitalize">
                {ctx.getValue() ?? 'manual'}
            </Badge>
        ),
    }),
    helper.accessor('status', {
        id: 'status',
        header: 'Status',
        enableColumnFilter: false,
        cell: (ctx) => {
            const config = statusConfig[ctx.getValue() as OrderStatus];
            return <Badge variant={config.variant}>{config.label}</Badge>;
        },
    }),
    createDateColumn<Order>('created_at'),
];

const routes = {
    fetch: fetchRoute,
    show,
    // No create/delete/destroyBulk for orders
    destroy: show as any,
    destroyBulk: show as any,
    create: show as any,
};

export default function OrderIndex() {
    return (
        <IndexPage<Order>
            title="Order Management"
            description="View and manage customer orders"
            columns={columns}
            routes={routes}
            hideAdd
            disableSelect
            headerActions={
                <Button variant="outline" size="sm" asChild>
                    <a href="/operational/order/export">
                        <Download className="mr-2 size-4" />
                        Export Excel
                    </a>
                </Button>
            }
        />
    );
}

OrderIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
