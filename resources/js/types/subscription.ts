import type { Model } from './model';

export type SubscriptionFeature = Model & {
    name: string;
    description: string | null;
    consumable: boolean;
    quota: boolean;
    postpaid: boolean;
    periodicity: number | null;
    periodicity_type: string | null;
    plans?: SubscriptionPlan[];
    pivot?: {
        charges: number | null;
    };
};

export type SubscriptionPlanResource = {
    feature: string;
    slug: string;
};

export type SubscriptionPlan = Model & {
    name: string;
    description: string | null;
    price: number;
    periodicity: number | null;
    periodicity_type: string | null;
    grace_days: number;
    is_active: boolean;
    resources: SubscriptionPlanResource[] | null;
    sort_order: number;
    features?: SubscriptionFeature[];
    subscribers_count?: number;
};

export type SubscriptionOrderStatus = 'pending_payment' | 'waiting_confirmation' | 'confirmed' | 'rejected' | 'cancelled';

export type SubscriptionOrder = Model & {
    order_code: string;
    customer_id: number;
    plan_id: number;
    type: 'new' | 'upgrade' | 'renewal';
    amount: number;
    pro_rate_credit: number;
    payment_gateway: string;
    status: SubscriptionOrderStatus;
    payment_proof: string | null;
    paid_at: string | null;
    confirmed_at: string | null;
    confirmed_by: number | null;
    rejection_reason: string | null;
    notes: string | null;
    plan?: SubscriptionPlan;
    customer?: {
        id: number;
        name: string;
        email: string;
        avatar: string | null;
    };
};

export type Subscription = Model & {
    plan_id: number;
    subscriber_id: number;
    subscriber_type: string;
    started_at: string;
    expired_at: string | null;
    canceled_at: string | null;
    suppressed_at: string | null;
    was_switched: boolean;
    plan?: SubscriptionPlan;
};
