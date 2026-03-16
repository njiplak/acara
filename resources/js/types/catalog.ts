import type { Addon } from './addon';
import type { Model } from './model';
import type { Speaker } from './speaker';

export type Catalog = Model & {
    name: string;
    description: string | null;
    strike_price: number | null;
    price: number;
    addons?: Addon[];
    speakers?: Speaker[];
};
