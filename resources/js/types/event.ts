import type { Catalog } from './catalog';
import type { Model } from './model';
import type { Venue } from './venue';

export type ScheduleItem = {
    time: string;
    end_time: string | null;
    title: string;
    description: string | null;
};

export type PricingType = 'fixed' | 'date' | 'quantity';

export type PricingTier = {
    label: string;
    price: number;
    end_date?: string | null;
    max_seats?: number | null;
};

export type ResolvedPricing = {
    active_price: number;
    active_tier_index: number | null;
    tiers: PricingTier[];
    savings: number;
};

export type CatalogEventPivot = {
    max_participant: number | null;
    pricing_type: PricingType;
    pricing_tiers: PricingTier[] | null;
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
    catalogs?: (Catalog & { pivot?: CatalogEventPivot })[];
    lowest_active_price?: number | null;
};
