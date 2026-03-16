import type { Addon } from './addon';
import type { Catalog } from './catalog';
import type { Customer } from './customer';
import type { Event } from './event';
import type { Model } from './model';
import type { Voucher } from './voucher';

export type OrderStatus = 'pending_payment' | 'waiting_confirmation' | 'confirmed' | 'rejected' | 'cancelled' | 'refunded';

export type OrderAddonPivot = {
    addon_name: string;
    addon_price: number;
};

export type Order = Model & {
    order_code: string;
    customer_id: number;
    event_id: number;
    catalog_id: number;
    catalog_price: number;
    addons_total: number;
    referral_discount: number;
    voucher_discount: number;
    balance_used: number;
    total_amount: number;
    status: OrderStatus;
    payment_proof: string | null;
    paid_at: string | null;
    confirmed_at: string | null;
    checked_in_at: string | null;
    confirmed_by: number | null;
    rejection_reason: string | null;
    refunded_at: string | null;
    refund_reason: string | null;
    notes: string | null;
    referred_by: number | null;
    voucher_id: number | null;
    customer?: Customer;
    event?: Event;
    catalog?: Catalog;
    addons?: (Addon & { pivot?: OrderAddonPivot })[];
    confirmed_by_user?: { id: number; name: string };
    referrer?: Customer;
    voucher?: Voucher;
};
