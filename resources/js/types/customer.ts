import type { Model } from './model';

export type Customer = Model & {
    name: string;
    email: string;
    email_verified_at?: string | null;
    google_id?: string | null;
    avatar?: string | null;
    referral_code?: string | null;
    referral_balance?: number;
};
