import type { Catalog } from './catalog';
import type { Customer } from './customer';
import type { Event } from './event';
import type { Model } from './model';

export type Testimonial = Model & {
    order_id: number;
    customer_id: number;
    event_id: number;
    catalog_id: number;
    rating: number;
    body: string | null;
    is_highlighted: boolean;
    customer?: Customer;
    event?: Event;
    catalog?: Catalog;
};
