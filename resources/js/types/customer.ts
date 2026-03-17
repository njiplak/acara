import type { Model } from './model';

export type CustomerTag =
    | 'new'
    | 'returning'
    | 'loyal'
    | 'active'
    | 'lapsed'
    | 'inactive'
    | 'no-show'
    | 'big-spender'
    | 'referrer';

export type Customer = Model & {
    name: string;
    email: string;
    email_verified_at?: string | null;
    google_id?: string | null;
    avatar?: string | null;
    referral_code?: string | null;
    referral_balance?: number;
    tags?: CustomerTag[];
};
