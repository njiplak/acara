import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, CalendarCheck, Check, ClipboardList, Copy, Pencil, Share2, ShoppingBag, Users, Wallet } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { logout } from '@/actions/App/Http/Controllers/Auth/CustomerAuthController';
import { index as ordersIndex } from '@/actions/App/Http/Controllers/Customer/OrderController';
import { update as updateProfile } from '@/actions/App/Http/Controllers/Customer/ProfileController';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { SharedData } from '@/types';

type Props = {
    stats: {
        total_orders: number;
        total_spend: number;
        events_attended: number;
        referrals_count: number;
    };
    logoUrl?: string | null;
};

function formatPrice(price: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
}

function formatDate(date: string) {
    return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function CustomerProfile({ stats, logoUrl }: Props) {
    const { auth, name } = usePage<SharedData>().props;
    const customer = auth.customer!;
    const appName = (name as string) || 'Acara';

    const [editing, setEditing] = useState(false);
    const [copied, setCopied] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        name: customer.name,
        phone: customer.phone || '',
        date_of_birth: customer.date_of_birth ? customer.date_of_birth.split('T')[0] : '',
    });

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        put(updateProfile.url(), {
            onSuccess: () => {
                setEditing(false);
                toast.success('Profile updated');
            },
        });
    };

    const copyCode = () => {
        navigator.clipboard.writeText(customer.referral_code || '');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <>
            <Head>
                <title>{`My Profile - ${appName}`}</title>
            </Head>

            <div className="relative flex min-h-svh flex-col bg-background">
                <div className="h-px w-full bg-border" />

                {/* Header */}
                <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:px-12">
                    <Link href="/" className="flex items-center gap-2.5">
                        {logoUrl ? (
                            <img src={logoUrl} alt={appName} className="h-8 w-auto object-contain" />
                        ) : (
                            <div className="flex size-8 items-center justify-center rounded-md bg-foreground">
                                <span className="text-sm font-bold tracking-tight text-background">{appName.charAt(0)}</span>
                            </div>
                        )}
                        <span className="text-lg font-semibold tracking-tight text-foreground">{appName}</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            {customer.avatar ? (
                                <img src={customer.avatar} alt={customer.name} className="size-7 rounded-full" />
                            ) : (
                                <div className="flex size-7 items-center justify-center rounded-full bg-muted text-xs font-medium">
                                    {customer.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <span className="hidden text-sm font-medium sm:inline">{customer.name}</span>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.post(logout.url())}
                        >
                            Logout
                        </Button>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 px-6 py-8 lg:px-12 lg:py-12">
                    <div className="mx-auto max-w-3xl">
                        <Link href={ordersIndex.url()} className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
                            <ArrowLeft className="size-3.5" />
                            Back to My Orders
                        </Link>

                        <h1 className="mb-6 text-2xl font-bold tracking-tight text-foreground">My Profile</h1>

                        {/* Profile card */}
                        <div className="rounded-lg border bg-card p-5">
                            <div className="flex items-start gap-4">
                                {customer.avatar ? (
                                    <img src={customer.avatar} alt={customer.name} className="size-16 rounded-full" />
                                ) : (
                                    <div className="flex size-16 items-center justify-center rounded-full bg-muted text-xl font-semibold">
                                        {customer.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className="flex-1">
                                    {editing ? (
                                        <form onSubmit={handleSave} className="space-y-3">
                                            <div className="flex flex-col gap-1.5">
                                                <Label>Name</Label>
                                                <Input
                                                    value={data.name}
                                                    onChange={(e) => setData('name', e.target.value)}
                                                />
                                                {errors.name && (
                                                    <p className="text-xs text-destructive">{errors.name}</p>
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <Label>Phone</Label>
                                                <Input
                                                    type="tel"
                                                    value={data.phone}
                                                    onChange={(e) => setData('phone', e.target.value)}
                                                />
                                                {errors.phone && (
                                                    <p className="text-xs text-destructive">{errors.phone}</p>
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <Label>Date of Birth</Label>
                                                <Input
                                                    type="date"
                                                    value={data.date_of_birth}
                                                    onChange={(e) => setData('date_of_birth', e.target.value)}
                                                />
                                                {errors.date_of_birth && (
                                                    <p className="text-xs text-destructive">{errors.date_of_birth}</p>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <Button type="submit" size="sm" disabled={processing}>
                                                    <Check className="size-3.5" />
                                                    {processing ? 'Saving...' : 'Save'}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setEditing(false);
                                                        setData('name', customer.name);
                                                        setData('phone', customer.phone || '');
                                                        setData('date_of_birth', customer.date_of_birth ? customer.date_of_birth.split('T')[0] : '');
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h2 className="text-lg font-semibold text-foreground">{customer.name}</h2>
                                                <button
                                                    onClick={() => setEditing(true)}
                                                    className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                                                >
                                                    <Pencil className="size-3.5" />
                                                </button>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{customer.email}</p>
                                            {customer.phone && (
                                                <p className="text-sm text-muted-foreground">{customer.phone}</p>
                                            )}
                                            {customer.date_of_birth && (
                                                <p className="text-xs text-muted-foreground">
                                                    Born {formatDate(customer.date_of_birth)}
                                                </p>
                                            )}
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Member since {formatDate(customer.created_at)}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <div className="rounded-lg border bg-card p-4 text-center">
                                <ShoppingBag className="mx-auto size-5 text-muted-foreground" />
                                <div className="mt-2 text-2xl font-bold">{stats.total_orders}</div>
                                <p className="text-xs text-muted-foreground">Orders</p>
                            </div>
                            <div className="rounded-lg border bg-card p-4 text-center">
                                <CalendarCheck className="mx-auto size-5 text-muted-foreground" />
                                <div className="mt-2 text-2xl font-bold">{stats.events_attended}</div>
                                <p className="text-xs text-muted-foreground">Attended</p>
                            </div>
                            <div className="rounded-lg border bg-card p-4 text-center">
                                <Users className="mx-auto size-5 text-muted-foreground" />
                                <div className="mt-2 text-2xl font-bold">{stats.referrals_count}</div>
                                <p className="text-xs text-muted-foreground">Referrals</p>
                            </div>
                            <div className="rounded-lg border bg-card p-4 text-center">
                                <Wallet className="mx-auto size-5 text-muted-foreground" />
                                <div className="mt-2 text-lg font-bold">{formatPrice(customer.referral_balance ?? 0)}</div>
                                <p className="text-xs text-muted-foreground">Balance</p>
                            </div>
                        </div>

                        {/* Referral section */}
                        <div className="mt-4 rounded-lg border bg-card p-5">
                            <h3 className="text-sm font-semibold text-foreground">Referral Program</h3>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Share your referral code with friends. When they register and their payment is confirmed, you earn referral credits.
                            </p>
                            <div className="mt-3 flex items-center gap-2">
                                <span className="rounded-md border bg-accent/50 px-3 py-1.5 font-mono text-sm font-bold tracking-wider">
                                    {customer.referral_code}
                                </span>
                                <button
                                    onClick={copyCode}
                                    className="inline-flex items-center gap-1 rounded-md border px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                                >
                                    <Copy className="size-3" />
                                    {copied ? 'Copied!' : 'Copy'}
                                </button>
                                <button
                                    onClick={() => {
                                        const url = window.location.origin;
                                        const text = `Use my referral code ${customer.referral_code} for a discount! ${url}`;
                                        if (navigator.share) {
                                            navigator.share({ text }).catch(() => {});
                                        } else {
                                            navigator.clipboard.writeText(text);
                                            toast.success('Referral link copied!');
                                        }
                                    }}
                                    className="inline-flex items-center gap-1 rounded-md border px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                                >
                                    <Share2 className="size-3" />
                                    Share
                                </button>
                            </div>
                            <div className="mt-3 flex items-center gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Total spend: </span>
                                    <span className="font-medium">{formatPrice(stats.total_spend)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick links */}
                        <div className="mt-4 rounded-lg border bg-card p-5">
                            <h3 className="mb-3 text-sm font-semibold text-foreground">Quick Links</h3>
                            <div className="space-y-2">
                                <Link
                                    href={ordersIndex.url()}
                                    className="flex items-center gap-3 rounded-md border p-3 text-sm transition-colors hover:bg-accent/50"
                                >
                                    <ClipboardList className="size-4 text-muted-foreground" />
                                    <span>View My Orders</span>
                                </Link>
                                <Link
                                    href="/"
                                    className="flex items-center gap-3 rounded-md border p-3 text-sm transition-colors hover:bg-accent/50"
                                >
                                    <CalendarCheck className="size-4 text-muted-foreground" />
                                    <span>Browse Events</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
