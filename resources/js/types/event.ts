import type { Catalog } from './catalog';
import type { Model } from './model';
import type { Venue } from './venue';

export type ScheduleItem = {
    time: string;
    end_time: string | null;
    title: string;
    description: string | null;
};

export type Event = Model & {
    name: string;
    description: string | null;
    start_date: string;
    end_date: string;
    status: 'draft' | 'published';
    payment_method: 'manual' | 'qris';
    schedule?: ScheduleItem[] | null;
    material_require_checkin?: boolean;
    venue_id?: number | null;
    venue?: Venue;
    catalogs?: (Catalog & { pivot?: { max_participant: number | null } })[];
};
