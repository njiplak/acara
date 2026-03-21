import { createColumnHelper, type ColumnDef } from '@tanstack/react-table';

import IndexPage from '@/components/index-page';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { createDateColumn } from '@/lib/column-helpers';
import {
    create,
    destroy as destroyRoute,
    destroyBulk,
    fetch as fetchRoute,
    show,
} from '@/routes/backoffice/master/article';
import type { Article } from '@/types/article';

const helper = createColumnHelper<Article>();

const columns: ColumnDef<Article, any>[] = [
    helper.accessor('id', {
        id: 'id',
        header: 'ID',
        enableColumnFilter: false,
        enableHiding: false,
    }),
    helper.accessor('title', {
        id: 'title',
        header: 'Title',
        enableColumnFilter: false,
        enableHiding: false,
    }),
    helper.accessor('author', {
        id: 'author',
        header: 'Author',
        enableColumnFilter: false,
        enableHiding: false,
        cell: (ctx) => ctx.getValue()?.name || '-',
    }),
    helper.accessor('is_published', {
        id: 'is_published',
        header: 'Status',
        enableColumnFilter: false,
        enableHiding: false,
        cell: (ctx) =>
            ctx.getValue() ? (
                <Badge variant="default">Published</Badge>
            ) : (
                <Badge variant="secondary">Draft</Badge>
            ),
    }),
    createDateColumn<Article>('created_at'),
];

const routes = { fetch: fetchRoute, destroy: destroyRoute, destroyBulk, show, create };

export default function ArticleIndex() {
    return (
        <IndexPage<Article>
            title="Article Management"
            description="Manage blog articles and posts"
            addLabel="Add Article"
            columns={columns}
            routes={routes}
        />
    );
}

ArticleIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
