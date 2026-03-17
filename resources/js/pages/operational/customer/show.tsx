import { router } from '@inertiajs/react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { index } from '@/routes/backoffice/operational/customer';
import type { Customer, CustomerTag } from '@/types/customer';

const tagConfig: Record<CustomerTag, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    new: { label: 'New', variant: 'secondary' },
    returning: { label: 'Returning', variant: 'default' },
    loyal: { label: 'Loyal', variant: 'default' },
    active: { label: 'Active', variant: 'default' },
    lapsed: { label: 'Lapsed', variant: 'outline' },
    inactive: { label: 'Inactive', variant: 'destructive' },
    'no-show': { label: 'No-show', variant: 'destructive' },
    'big-spender': { label: 'Big Spender', variant: 'default' },
    referrer: { label: 'Referrer', variant: 'secondary' },
};

type Props = {
    customer: Customer;
};

export default function CustomerShow({ customer }: Props) {
    return (
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
            <h1 className="text-xl font-semibold">Customer Detail</h1>

            <div className="flex items-center gap-4">
                {customer.avatar ? (
                    <img
                        src={customer.avatar}
                        alt={customer.name}
                        className="size-16 rounded-full"
                    />
                ) : (
                    <div className="flex size-16 items-center justify-center rounded-full bg-muted text-xl font-medium">
                        {customer.name.charAt(0).toUpperCase()}
                    </div>
                )}
                <div>
                    <h2 className="text-lg font-medium">{customer.name}</h2>
                    <p className="text-sm text-muted-foreground">{customer.email}</p>
                    {customer.tags && customer.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                            {customer.tags.map((tag) => (
                                <Badge key={tag} variant={tagConfig[tag].variant}>
                                    {tagConfig[tag].label}
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-muted-foreground">Google ID</span>
                    <span className="text-sm">{customer.google_id || '-'}</span>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-muted-foreground">Referral Code</span>
                    <span className="font-mono text-sm">{customer.referral_code || '-'}</span>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-muted-foreground">Referral Balance</span>
                    <span className="text-sm">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(customer.referral_balance || 0)}
                    </span>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-muted-foreground">Email Verified</span>
                    <span className="text-sm">
                        {customer.email_verified_at
                            ? new Date(customer.email_verified_at).toLocaleDateString('en-GB', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                              })
                            : 'Not verified'}
                    </span>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-muted-foreground">Registered At</span>
                    <span className="text-sm">
                        {new Date(customer.created_at).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                        })}
                    </span>
                </div>
            </div>

            <div>
                <Button variant="outline" onClick={() => router.visit(index().url)}>
                    Back
                </Button>
            </div>
        </div>
    );
}

CustomerShow.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
