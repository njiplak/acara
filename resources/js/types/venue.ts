import type { Model } from './model';

export type Venue = Model & {
    name: string;
    address: string;
    city: string;
    maps_url: string | null;
    capacity: number | null;
    notes: string | null;
};
