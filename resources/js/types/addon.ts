import type { Model } from './model';

export type Addon = Model & {
    name: string;
    description: string | null;
    strike_price: number | null;
    price: number;
};
