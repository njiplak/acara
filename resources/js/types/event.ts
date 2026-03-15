import type { Catalog } from './catalog';
import type { Model } from './model';

export type Event = Model & {
    name: string;
    description: string | null;
    start_date: string;
    end_date: string;
    status: 'draft' | 'published';
    payment_method: 'manual' | 'qris';
    catalogs?: (Catalog & { pivot?: { max_participant: number | null } })[];
};
