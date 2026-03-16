import type { Catalog } from './catalog';
import type { Event } from './event';
import type { Model } from './model';

export type Voucher = Model & {
    code: string;
    name: string;
    type: 'fixed' | 'percentage';
    value: number;
    max_discount: number | null;
    event_id: number | null;
    catalog_id: number | null;
    max_uses: number | null;
    max_uses_per_customer: number;
    min_order_amount: number | null;
    valid_from: string | null;
    valid_until: string | null;
    is_active: boolean;
    stackable_with_referral: boolean;
    event?: Event;
    catalog?: Catalog;
    used_count?: number;
};
