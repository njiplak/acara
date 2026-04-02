import type { Model } from './model';

export type Addon = Model & {
    name: string;
    description: string | null;
    strike_price: number | null;
    price: number;
    status: 'draft' | 'published';
    is_standalone: boolean;
    payment_gateway: 'manual' | 'xendit' | 'stripe' | 'midtrans';
    currency: string;
};
