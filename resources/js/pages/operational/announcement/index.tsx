import { Link } from '@inertiajs/react';
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table';

import { Badge } from '@/components/ui/badge';
import IndexPage from '@/components/index-page';
import AppLayout from '@/layouts/app-layout';
import { createDateColumn } from '@/lib/column-helpers';
import {
    create,
    fetch as fetchRoute,
} from '@/routes/backoffice/operational/announcement';

type Announcement = {
    id: number;
    event_id: number;
    subject: string;
    message: string;
    sent_count: number;
    sent_at: string | null;
    created_at: string;
    updated_at: string;
    event?: { id: number; name: string };
};

const helper = createColumnHelper<Announcement>();

const columns: ColumnDef<Announcement, any>[] = [
    helper.display({
        id: 'event',
        header: 'Event',
        enableColumnFilter: false,
        cell: (ctx) => ctx.row.original.event?.name || '-',
    }),
    helper.accessor('subject', {
        id: 'subject',
        header: 'Subject',
        enableColumnFilter: false,
    }),
    helper.display({
        id: 'message',
        header: 'Message',
        enableColumnFilter: false,
        cell: (ctx) => {
            const msg = ctx.row.original.message;
            return <span className="line-clamp-2 max-w-xs text-sm text-muted-foreground">{msg}</span>;
        },
    }),
    helper.accessor('sent_count', {
        id: 'sent_count',
        header: 'Sent To',
        enableColumnFilter: false,
        cell: (ctx) => (
            <Badge variant="outline">{ctx.getValue()} attendees</Badge>
        ),
    }),
    createDateColumn<Announcement>('created_at', 'Sent At'),
];

// Announcements are send-only, no edit/delete
const routes = {
    fetch: fetchRoute,
    create,
    show: fetchRoute as any,
    destroy: fetchRoute as any,
    destroyBulk: fetchRoute as any,
};

export default function AnnouncementIndex() {
    return (
        <IndexPage<Announcement>
            title="Announcements"
            description="Send email announcements to checked-in attendees"
            addLabel="New Announcement"
            columns={columns}
            routes={routes}
            hideAdd={false}
            disableSelect
            showActionColumn={false}
        />
    );
}

AnnouncementIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
