import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Check, ClipboardList, LoaderCircle, Package, Wallet } from 'lucide-react';
import { useState } from 'react';
import { redirect } from '@/actions/App/Http/Controllers/Auth/CustomerAuthController';
import { storeAddon } from '@/actions/App/Http/Controllers/Customer/OrderController';
import { Button } from '@/components/ui/button';
import type { Addon } from '@/types/addon';
import type { SharedData } from '@/types';
import type { LandingPageSetting } from '@/types/landing-page-setting';

function formatPrice(price: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
}

type Props = {
    settings: LandingPageSetting;
    logoUrl?: string | null;
    addons: Addon[];
    customerBalance: number;
};

export default function AddonsIndex({ settings, logoUrl, addons, customerBalance }: Props) {
    const name = settings.business_name || 'Acara';
    const { auth } = usePage<SharedData>().props;
    const customer = auth.customer;

    const [selectedAddons, setSelectedAddons] = useState<number[]>([]);
    const [useBalance, setUseBalance] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const selectedItems = addons.filter((a) => selectedAddons.includes(a.id));
    const subtotal = selectedItems.reduce((sum, a) => sum + a.price, 0);
    const appliedBalance = useBalance ? Math.min(customerBalance, subtotal) : 0;
    const total = subtotal - appliedBalance;

    const toggleAddon = (id: number) => {
        setSelectedAddons((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));
    };

    const handlePurchase = () => {
        if (selectedAddons.length === 0) return;
        setSubmitting(true);
        router.post(
            storeAddon.url(),
            {
                addon_ids: selectedAddons,
                use_balance: useBalance || undefined,
            },
            {
                onFinish: () => setSubmitting(false),
            },
        );
    };

    return (
        <>
            <Head>
                <title>{`Add-ons - ${settings.meta_title || name}`}</title>
                {settings.meta_description && <meta name="description" content={settings.meta_description} />}
            </Head>

            <div className="relative flex min-h-svh flex-col bg-background">
                <div className="h-px w-full bg-border" />

                {/* Header */}
                <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:px-12">
                    <Link href="/" className="flex items-center gap-2.5">
                        {logoUrl ? (
                            <img src={logoUrl} alt={name} className="h-8 w-auto object-contain" />
                        ) : (
                            <div className="flex size-8 items-center justify-center rounded-md bg-foreground">
                                <span className="text-sm font-bold tracking-tight text-background">{name.charAt(0)}</span>
                            </div>
                        )}
                        <span className="text-lg font-semibold tracking-tight text-foreground">{name}</span>
                    </Link>
                    {customer ? (
                        <div className="flex items-center gap-3">
                            <Button asChild variant="outline" size="sm">
                                <Link href="/customer/orders">
                                    <ClipboardList className="size-4" />
                                    My Orders
                                </Link>
                            </Button>
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
                        </div>
                    ) : (
                        <Button asChild variant="outline" size="sm">
                            <a href={redirect.url()}>Sign in with Google</a>
                        </Button>
                    )}
                </header>

                {/* Content */}
                <main className="flex-1 px-6 py-8 lg:px-12 lg:py-12">
                    <div className="mx-auto max-w-3xl">
                        <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
                            <ArrowLeft className="size-3.5" />
                            Back to Home
                        </Link>

                        <div className="mb-8">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Add-ons</h1>
                            <p className="mt-2 text-muted-foreground">Purchase add-on items independently</p>
                        </div>

                        {addons.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
                                <Package className="mb-3 size-8 text-muted-foreground/50" />
                                <p className="text-sm font-medium text-muted-foreground">No add-ons available</p>
                                <p className="mt-1 text-xs text-muted-foreground/70">Check back soon for new items</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {addons.map((addon) => {
                                    const selected = selectedAddons.includes(addon.id);
                                    const hasDiscount = addon.strike_price !== null && addon.strike_price > addon.price;

                                    return (
                                        <button
                                            key={addon.id}
                                            type="button"
                                            onClick={() => customer ? toggleAddon(addon.id) : undefined}
                                            disabled={!customer}
                                            className={`flex w-full items-center justify-between rounded-lg border p-5 text-left transition-colors ${
                                                selected
                                                    ? 'border-foreground/30 bg-accent'
                                                    : 'border-border bg-card hover:border-foreground/20 hover:bg-accent/50'
                                            } ${!customer ? 'cursor-default' : ''}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                {customer && (
                                                    <div
                                                        className={`flex size-5 items-center justify-center rounded border ${
                                                            selected ? 'border-foreground bg-foreground text-background' : 'border-muted-foreground/40'
                                                        }`}
                                                    >
                                                        {selected && <Check className="size-3.5" />}
                                                    </div>
                                                )}
                                                <div>
                                                    <h3 className="font-semibold text-foreground">{addon.name}</h3>
                                                    {addon.description && (
                                                        <p className="mt-1 text-sm text-muted-foreground">{addon.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="ml-4 flex shrink-0 flex-col items-end gap-0.5">
                                                {hasDiscount && (
                                                    <span className="text-sm text-muted-foreground line-through">{formatPrice(addon.strike_price!)}</span>
                                                )}
                                                <span className="text-lg font-bold text-foreground">{formatPrice(addon.price)}</span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Checkout section for authenticated users */}
                        {customer && selectedAddons.length > 0 && (
                            <div className="mt-6 rounded-lg border bg-card p-5">
                                {/* Use balance toggle */}
                                {customerBalance > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setUseBalance(!useBalance)}
                                        className={`mb-4 flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                                            useBalance ? 'border-foreground/30 bg-accent' : 'border-border hover:bg-accent/50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`flex size-4 items-center justify-center rounded border ${
                                                    useBalance ? 'border-foreground bg-foreground text-background' : 'border-muted-foreground/40'
                                                }`}
                                            >
                                                {useBalance && <Check className="size-3" />}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Wallet className="size-3.5" />
                                                <span className="font-medium">Use referral balance</span>
                                            </div>
                                        </div>
                                        <span className="ml-4 shrink-0 text-xs font-medium text-muted-foreground">
                                            {formatPrice(customerBalance)} available
                                        </span>
                                    </button>
                                )}

                                {/* Price breakdown */}
                                <div className="space-y-1.5 text-sm">
                                    {selectedItems.map((addon) => (
                                        <div key={addon.id} className="flex justify-between text-muted-foreground">
                                            <span>{addon.name}</span>
                                            <span>{formatPrice(addon.price)}</span>
                                        </div>
                                    ))}
                                    {appliedBalance > 0 && (
                                        <div className="flex justify-between text-green-600 dark:text-green-400">
                                            <span>Balance used</span>
                                            <span>-{formatPrice(appliedBalance)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between border-t pt-1.5">
                                        <span className="font-semibold text-foreground">Total</span>
                                        <span className="font-semibold text-foreground">{formatPrice(total)}</span>
                                    </div>
                                </div>

                                <Button
                                    onClick={handlePurchase}
                                    disabled={submitting}
                                    className="mt-4 w-full"
                                >
                                    {submitting ? (
                                        <>
                                            <LoaderCircle className="size-4 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        `Purchase - ${formatPrice(total)}`
                                    )}
                                </Button>
                            </div>
                        )}

                        {/* Sign in CTA for guests */}
                        {!customer && addons.length > 0 && (
                            <div className="mt-10 rounded-lg border bg-accent/30 p-6 text-center">
                                <p className="text-sm font-medium text-foreground">Ready to purchase?</p>
                                <p className="mt-1 text-xs text-muted-foreground">Sign in with your Google account to continue</p>
                                <Button asChild size="lg" className="mt-4 px-8">
                                    <a href={redirect.url()}>Sign in with Google</a>
                                </Button>
                            </div>
                        )}
                    </div>
                </main>

                {/* Footer */}
                <footer className="border-t px-6 py-6 lg:px-12">
                    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                        <p className="text-xs text-muted-foreground">
                            {settings.footer_text || `\u00A9 ${new Date().getFullYear()} ${name}. All rights reserved.`}
                        </p>
                        <SocialLinks settings={settings} />
                    </div>
                </footer>
            </div>
        </>
    );
}

function SocialLinks({ settings }: { settings: LandingPageSetting }) {
    const links = [
        { url: settings.social_instagram, label: 'Instagram' },
        { url: settings.social_facebook, label: 'Facebook' },
        { url: settings.social_tiktok, label: 'TikTok' },
        { url: settings.social_whatsapp, label: 'WhatsApp' },
    ].filter((l) => l.url);

    if (links.length === 0) return null;

    return (
        <div className="flex items-center gap-4">
            {links.map((link) => (
                <a
                    key={link.label}
                    href={link.url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                    {link.label}
                </a>
            ))}
        </div>
    );
}
