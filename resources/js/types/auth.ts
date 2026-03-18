export type User = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type AuthCustomer = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    date_of_birth: string | null;
    avatar: string | null;
    referral_code: string | null;
    referral_balance: number;
    created_at: string;
};

export type Auth = {
    user: User;
    customer: AuthCustomer | null;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
