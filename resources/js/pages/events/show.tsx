import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Calendar, Check, ClipboardList, Clock, Copy, Link2, LoaderCircle, MapPin, Share2, Star, Tag, Ticket, Timer, Users, Wallet } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { redirect } from '@/actions/App/Http/Controllers/Auth/CustomerAuthController';
import { store, validateVoucher, joinWaitlist, leaveWaitlist } from '@/actions/App/Http/Controllers/Customer/OrderController';
import { Button } from '@/components/ui/button';
import type { Addon } from '@/types/addon';
import type { SharedData } from '@/types';
import type { Catalog } from '@/types/catalog';
import type { Event, ResolvedPricing } from '@/types/event';
import type { LandingPageSetting } from '@/types/landing-page-setting';
import type { Testimonial } from '@/types/testimonial';

function formatDateRange(start: string, end: string) {
    const s = new Date(start);
    const e = new Date(end);
    const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };

    if (s.toDateString() === e.toDateString()) {
        return s.toLocaleDateString('id-ID', opts);
    }

    if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
        return `${s.getDate()} - ${e.toLocaleDateString('id-ID', opts)}`;
    }

    return `${s.toLocaleDateString('id-ID', opts)} - ${e.toLocaleDateString('id-ID', opts)}`;
}

function formatPrice(price: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
}

type Props = {
    settings: LandingPageSetting;
    logoUrl?: string | null;
    event: Event;
    orderCounts: Record<number, number>;
    pricingData: Record<number, ResolvedPricing>;
    customerOrderCatalogIds: number[];
    customerWaitlistCatalogIds?: number[];
    waitlistCounts?: Record<number, number>;
    customerBalance: number;
    referralDiscount: number;
    testimonials?: Testimonial[];
    prefillReferralCode?: string;
};

export default function EventShow({ settings, logoUrl, event, orderCounts, pricingData, customerOrderCatalogIds, customerWaitlistCatalogIds = [], waitlistCounts = {}, customerBalance, referralDiscount, testimonials = [], prefillReferralCode = '' }: Props) {
    const name = settings.business_name || 'Acara';
    const catalogs = event.catalogs || [];
    const { auth } = usePage<SharedData>().props;
    const customer = auth.customer;

    return (
        <>
            <Head>
                <title>{`${event.name} - ${settings.meta_title || name}`}</title>
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
                        {/* Back */}
                        <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
                            <ArrowLeft className="size-3.5" />
                            Back to Events
                        </Link>

                        {/* Event Header */}
                        <div className="mb-8">
                            <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="size-4" />
                                <span>{formatDateRange(event.start_date, event.end_date)}</span>
                            </div>

                            <div className="flex items-start justify-between gap-4">
                                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{event.name}</h1>
                                <ShareEventButton
                                    eventName={event.name}
                                    referralCode={customer?.referral_code ?? undefined}
                                    referralDiscount={referralDiscount}
                                />
                            </div>

                            {event.description && (
                                <p className="mt-3 leading-relaxed text-muted-foreground">{event.description}</p>
                            )}

                            {event.venue && (
                                <div className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
                                    <MapPin className="mt-0.5 size-4 shrink-0" />
                                    <div>
                                        <span className="font-medium text-foreground">{event.venue.name}</span>
                                        <span className="mx-1">—</span>
                                        <span>{event.venue.address}, {event.venue.city}</span>
                                        {event.venue.maps_url && (
                                            <>
                                                <span className="mx-1">·</span>
                                                <a
                                                    href={event.venue.maps_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-foreground underline underline-offset-2 hover:no-underline"
                                                >
                                                    View Map
                                                </a>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Schedule */}
                        {event.schedule && event.schedule.length > 0 && (
                            <>
                                <div className="h-px bg-border" />
                                <div className="mt-8 mb-8">
                                    <h2 className="mb-4 text-lg font-semibold text-foreground">Schedule</h2>
                                    <div className="space-y-0">
                                        {event.schedule.map((item, idx) => (
                                            <div key={idx} className="relative flex gap-4 pb-6 last:pb-0">
                                                {idx < event.schedule!.length - 1 && (
                                                    <div className="absolute left-3 top-8 bottom-0 w-px bg-border" />
                                                )}
                                                <div className="flex size-6 shrink-0 items-center justify-center rounded-full border bg-background">
                                                    <Clock className="size-3 text-muted-foreground" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-sm font-medium text-foreground">
                                                            {item.time}
                                                            {item.end_time ? ` - ${item.end_time}` : ''}
                                                        </span>
                                                    </div>
                                                    <p className="font-medium text-foreground">{item.title}</p>
                                                    {item.description && (
                                                        <p className="mt-0.5 text-sm text-muted-foreground">{item.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="h-px bg-border" />

                        {/* Catalogs */}
                        <div className="mt-8">
                            <h2 className="mb-4 text-lg font-semibold text-foreground">
                                {catalogs.length === 1 ? 'Session' : 'Sessions'}
                            </h2>

                            {catalogs.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No sessions available for this event.</p>
                            ) : (
                                <div className="space-y-4">
                                    {catalogs.map((catalog) => {
                                        const currentOrders = orderCounts[catalog.id] || 0;
                                        const maxParticipant = catalog.pivot?.max_participant || null;
                                        const isFull = maxParticipant !== null && currentOrders >= maxParticipant;
                                        const alreadyOrdered = customerOrderCatalogIds.includes(catalog.id);

                                        const onWaitlist = customerWaitlistCatalogIds.includes(catalog.id);
                                        const waitlistCount = waitlistCounts[catalog.id] || 0;

                                        return (
                                            <CatalogCard
                                                key={catalog.id}
                                                catalog={catalog}
                                                eventId={event.id}
                                                isAuthenticated={!!customer}
                                                isFull={isFull}
                                                alreadyOrdered={alreadyOrdered}
                                                onWaitlist={onWaitlist}
                                                waitlistCount={waitlistCount}
                                                currentOrders={currentOrders}
                                                customerBalance={customerBalance}
                                                referralDiscount={referralDiscount}
                                                pricing={pricingData[catalog.id]}
                                                prefillReferralCode={prefillReferralCode}
                                            />
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Testimonials */}
                        {testimonials.length > 0 && (
                            <>
                                <div className="mt-10 h-px bg-border" />
                                <div className="mt-8">
                                    <h2 className="mb-4 text-lg font-semibold text-foreground">What Attendees Say</h2>
                                    <div className="space-y-3">
                                        {testimonials.map((t) => (
                                            <div key={t.id} className="rounded-lg border bg-card p-4">
                                                <div className="flex items-center gap-0.5">
                                                    {Array.from({ length: 5 }, (_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`size-3.5 ${i < t.rating ? 'fill-foreground text-foreground' : 'text-muted-foreground/30'}`}
                                                        />
                                                    ))}
                                                </div>
                                                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">"{t.body}"</p>
                                                <div className="mt-3 flex items-center gap-2">
                                                    {t.customer?.avatar ? (
                                                        <img src={t.customer.avatar} alt={t.customer.name} className="size-6 rounded-full" />
                                                    ) : (
                                                        <div className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                                                            {t.customer?.name?.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <span className="text-sm font-medium text-foreground">{t.customer?.name}</span>
                                                    {t.catalog && (
                                                        <span className="text-xs text-muted-foreground">· {t.catalog.name}</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Sign in CTA for guests */}
                        {!customer && catalogs.length > 0 && (
                            <div className="mt-10 rounded-lg border bg-accent/30 p-6 text-center">
                                <p className="text-sm font-medium text-foreground">Ready to join this event?</p>
                                <p className="mt-1 text-xs text-muted-foreground">Sign in with your Google account to register</p>
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

function CatalogCard({
    catalog,
    eventId,
    isAuthenticated,
    isFull,
    alreadyOrdered,
    onWaitlist,
    waitlistCount,
    currentOrders,
    customerBalance,
    referralDiscount,
    pricing,
    prefillReferralCode = '',
}: {
    catalog: Catalog & { pivot?: { max_participant: number | null } };
    eventId: number;
    isAuthenticated: boolean;
    isFull: boolean;
    alreadyOrdered: boolean;
    onWaitlist: boolean;
    waitlistCount: number;
    currentOrders: number;
    customerBalance: number;
    referralDiscount: number;
    pricing: ResolvedPricing;
    prefillReferralCode?: string;
}) {
    const addons = catalog.addons || [];
    const activePrice = pricing.active_price;
    const hasTiers = pricing.tiers.length > 0;
    const hasDiscount = !hasTiers && catalog.strike_price !== null && catalog.strike_price > catalog.price;
    const [selectedAddons, setSelectedAddons] = useState<number[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [referralCode, setReferralCode] = useState(prefillReferralCode);
    const [useBalance, setUseBalance] = useState(false);

    // Voucher state
    const [voucherCode, setVoucherCode] = useState('');
    const [voucherDiscount, setVoucherDiscount] = useState(0);
    const [voucherValid, setVoucherValid] = useState(false);
    const [voucherStackable, setVoucherStackable] = useState(false);
    const [voucherError, setVoucherError] = useState('');
    const [voucherLoading, setVoucherLoading] = useState(false);

    const addonsTotal = addons
        .filter((a) => selectedAddons.includes(a.id))
        .reduce((sum, a) => sum + a.price, 0);
    const subtotal = activePrice + addonsTotal;

    // Voucher discount applied first
    const appliedVoucherDiscount = voucherValid ? Math.min(voucherDiscount, subtotal) : 0;

    // Referral discount: only if no voucher or voucher is stackable
    const canApplyReferral = !voucherValid || voucherStackable;
    const appliedDiscount = canApplyReferral && referralCode.trim() ? Math.min(referralDiscount, subtotal - appliedVoucherDiscount) : 0;

    const remainingAfterDiscount = subtotal - appliedVoucherDiscount - appliedDiscount;
    const appliedBalance = useBalance ? Math.min(customerBalance, remainingAfterDiscount) : 0;
    const total = subtotal - appliedVoucherDiscount - appliedDiscount - appliedBalance;

    const toggleAddon = (id: number) => {
        setSelectedAddons((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));
    };

    const handleApplyVoucher = () => {
        if (!voucherCode.trim()) return;
        setVoucherLoading(true);
        setVoucherError('');

        fetch(validateVoucher.url(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                code: voucherCode.trim(),
                event_id: eventId,
                catalog_id: catalog.id,
                subtotal,
            }),
        })
            .then((res) => res.json())
            .then((result) => {
                if (result.valid) {
                    setVoucherValid(true);
                    setVoucherDiscount(result.discount);
                    setVoucherStackable(result.stackable_with_referral);
                    setVoucherError('');
                } else {
                    setVoucherValid(false);
                    setVoucherDiscount(0);
                    setVoucherError(result.message);
                }
            })
            .catch(() => {
                setVoucherError('Failed to validate code. Please try again.');
            })
            .finally(() => setVoucherLoading(false));
    };

    const handleClearVoucher = () => {
        setVoucherCode('');
        setVoucherValid(false);
        setVoucherDiscount(0);
        setVoucherStackable(false);
        setVoucherError('');
    };

    const handleRegister = () => {
        setSubmitting(true);
        router.post(
            store.url(),
            {
                event_id: eventId,
                catalog_id: catalog.id,
                addon_ids: selectedAddons,
                referral_code: canApplyReferral && referralCode.trim() ? referralCode.trim() : undefined,
                voucher_code: voucherValid ? voucherCode.trim() : undefined,
                use_balance: useBalance || undefined,
            },
            {
                onFinish: () => setSubmitting(false),
            },
        );
    };

    const maxParticipant = catalog.pivot?.max_participant;
    const spotsLeft = maxParticipant ? maxParticipant - currentOrders : null;

    return (
        <div className="rounded-lg border bg-card p-5">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{catalog.name}</h3>
                    {catalog.description && (
                        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{catalog.description}</p>
                    )}

                    {/* Speakers */}
                    {catalog.speakers && catalog.speakers.length > 0 && (
                        <div className="mt-3 space-y-2">
                            {catalog.speakers.map((speaker) => (
                                <div key={speaker.id} className="flex items-center gap-2">
                                    {speaker.media?.[0]?.original_url ? (
                                        <img
                                            src={speaker.media[0].original_url}
                                            alt={speaker.name}
                                            className="size-8 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                                            {speaker.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-foreground">{speaker.name}</span>
                                        {speaker.title && (
                                            <span className="text-xs text-muted-foreground">{speaker.title}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Capacity */}
                    {maxParticipant && (
                        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Users className="size-3.5" />
                            <span>
                                {isFull ? 'Full' : `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left`}
                            </span>
                        </div>
                    )}
                </div>

                {/* Price */}
                <div className="flex flex-col items-end gap-0.5">
                    {hasDiscount && (
                        <span className="text-sm text-muted-foreground line-through">{formatPrice(catalog.strike_price!)}</span>
                    )}
                    {hasTiers && pricing.active_tier_index !== null && (
                        <span className="text-xs font-medium text-muted-foreground">{pricing.tiers[pricing.active_tier_index].label}</span>
                    )}
                    <span className="text-lg font-bold text-foreground">{formatPrice(activePrice)}</span>
                </div>
            </div>

            {/* Pricing Tiers Transparency */}
            {hasTiers && (
                <div className="mt-3 space-y-1">
                    {pricing.tiers.map((tier, idx) => {
                        const isActive = idx === pricing.active_tier_index;
                        const isPast = idx < (pricing.active_tier_index ?? 0);
                        return (
                            <div
                                key={idx}
                                className={`flex items-center justify-between rounded-md px-3 py-1.5 text-sm ${
                                    isActive
                                        ? 'border border-foreground/20 bg-accent font-medium text-foreground'
                                        : isPast
                                          ? 'text-muted-foreground line-through'
                                          : 'text-muted-foreground'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <div className={`size-2 rounded-full ${isActive ? 'bg-foreground' : 'bg-muted-foreground/30'}`} />
                                    <span>{tier.label}</span>
                                    {tier.end_date && !isPast && (
                                        <span className="text-xs">until {new Date(tier.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                    )}
                                    {tier.max_seats && !isPast && (
                                        <span className="text-xs">{tier.max_seats} seats</span>
                                    )}
                                    {isPast && <span className="text-xs">Ended</span>}
                                </div>
                                <span>{formatPrice(tier.price)}</span>
                            </div>
                        );
                    })}
                    {pricing.savings > 0 && (
                        <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                            Save {formatPrice(pricing.savings)} by registering now
                        </p>
                    )}
                </div>
            )}

            {/* Urgency indicators */}
            {pricing.tier_ends_at && pricing.savings > 0 && (
                <CountdownTimer endsAt={pricing.tier_ends_at} tierLabel={pricing.tiers[pricing.active_tier_index!]?.label} />
            )}
            {pricing.remaining_in_tier !== null && pricing.remaining_in_tier <= 10 && pricing.savings > 0 && (
                <div className="mt-3 flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm dark:border-amber-900 dark:bg-amber-950">
                    <Timer className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <span className="font-medium text-amber-700 dark:text-amber-300">
                        Only {pricing.remaining_in_tier} {pricing.remaining_in_tier === 1 ? 'spot' : 'spots'} left at this price
                    </span>
                </div>
            )}

            {/* Addon selection for authenticated users */}
            {isAuthenticated && !isFull && !alreadyOrdered && addons.length > 0 && (
                <div className="mt-4 border-t pt-4">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Add-ons (optional):</p>
                    <div className="space-y-2">
                        {addons.map((addon) => (
                            <AddonToggle
                                key={addon.id}
                                addon={addon}
                                selected={selectedAddons.includes(addon.id)}
                                onToggle={() => toggleAddon(addon.id)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Promo code, referral & balance — shown for authenticated users who can register */}
            {isAuthenticated && !isFull && !alreadyOrdered && (
                <div className="mt-4 border-t pt-4 space-y-3">
                    {/* Promo code input */}
                    <div>
                        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                            <Tag className="size-3.5" />
                            Promo Code (optional)
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={voucherCode}
                                onChange={(e) => {
                                    setVoucherCode(e.target.value.toUpperCase());
                                    if (voucherValid) handleClearVoucher();
                                }}
                                placeholder="Enter promo code"
                                maxLength={50}
                                disabled={voucherValid}
                                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm font-mono uppercase placeholder:text-muted-foreground/50 placeholder:font-sans placeholder:normal-case focus:border-foreground/30 focus:outline-none disabled:opacity-50"
                            />
                            {voucherValid ? (
                                <button
                                    type="button"
                                    onClick={handleClearVoucher}
                                    className="shrink-0 rounded-md border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent"
                                >
                                    Clear
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleApplyVoucher}
                                    disabled={!voucherCode.trim() || voucherLoading}
                                    className="shrink-0 rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:opacity-50"
                                >
                                    {voucherLoading ? <LoaderCircle className="size-4 animate-spin" /> : 'Apply'}
                                </button>
                            )}
                        </div>
                        {voucherValid && (
                            <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                                Promo applied — {formatPrice(appliedVoucherDiscount)} off
                            </p>
                        )}
                        {voucherError && (
                            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{voucherError}</p>
                        )}
                    </div>

                    {/* Referral code input — hidden if voucher is non-stackable */}
                    {canApplyReferral && (
                        <div>
                            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                <Ticket className="size-3.5" />
                                Referral Code (optional)
                            </label>
                            <input
                                type="text"
                                value={referralCode}
                                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                                placeholder="Enter referral code"
                                maxLength={20}
                                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground/50 focus:border-foreground/30 focus:outline-none"
                            />
                            {referralCode.trim() && referralDiscount > 0 && (
                                <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                                    You'll get {formatPrice(appliedDiscount)} discount
                                </p>
                            )}
                        </div>
                    )}

                    {/* Non-stackable notice */}
                    {voucherValid && !voucherStackable && referralCode.trim() && (
                        <p className="text-xs text-muted-foreground">
                            Referral discount cannot be combined with this promo code.
                        </p>
                    )}

                    {/* Use balance toggle */}
                    {customerBalance > 0 && (
                        <button
                            type="button"
                            onClick={() => setUseBalance(!useBalance)}
                            className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition-colors ${
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
                    {(appliedVoucherDiscount > 0 || appliedDiscount > 0 || appliedBalance > 0 || selectedAddons.length > 0) && (
                        <div className="space-y-1.5 border-t pt-3 text-sm">
                            <div className="flex justify-between text-muted-foreground">
                                <span>Subtotal</span>
                                <span>{formatPrice(subtotal)}</span>
                            </div>
                            {appliedVoucherDiscount > 0 && (
                                <div className="flex justify-between text-green-600 dark:text-green-400">
                                    <span>Promo discount</span>
                                    <span>-{formatPrice(appliedVoucherDiscount)}</span>
                                </div>
                            )}
                            {appliedDiscount > 0 && (
                                <div className="flex justify-between text-green-600 dark:text-green-400">
                                    <span>Referral discount</span>
                                    <span>-{formatPrice(appliedDiscount)}</span>
                                </div>
                            )}
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
                    )}
                </div>
            )}

            {/* Action button */}
            {isAuthenticated && (
                <div className="mt-4">
                    {alreadyOrdered ? (
                        <Button disabled variant="outline" className="w-full gap-2">
                            <Check className="size-4" />
                            Already Registered
                        </Button>
                    ) : isFull ? (
                        onWaitlist ? (
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => {
                                    fetch(leaveWaitlist.url(), {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
                                        },
                                        body: JSON.stringify({ event_id: eventId, catalog_id: catalog.id }),
                                    }).then(() => router.reload());
                                }}
                            >
                                On Waitlist ({waitlistCount}) — Click to Leave
                            </Button>
                        ) : (
                            <Button
                                variant="secondary"
                                className="w-full"
                                onClick={() => {
                                    fetch(joinWaitlist.url(), {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
                                        },
                                        body: JSON.stringify({ event_id: eventId, catalog_id: catalog.id }),
                                    }).then(() => router.reload());
                                }}
                            >
                                Session Full — Join Waitlist{waitlistCount > 0 ? ` (${waitlistCount} waiting)` : ''}
                            </Button>
                        )
                    ) : (
                        <Button onClick={handleRegister} disabled={submitting} className="w-full">
                            {submitting ? 'Registering...' : `Register - ${formatPrice(total)}`}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}

function AddonToggle({ addon, selected, onToggle }: { addon: Addon; selected: boolean; onToggle: () => void }) {
    return (
        <button
            type="button"
            onClick={onToggle}
            className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                selected ? 'border-foreground/30 bg-accent' : 'border-border hover:bg-accent/50'
            }`}
        >
            <div className="flex items-center gap-2">
                <div
                    className={`flex size-4 items-center justify-center rounded border ${
                        selected ? 'border-foreground bg-foreground text-background' : 'border-muted-foreground/40'
                    }`}
                >
                    {selected && <Check className="size-3" />}
                </div>
                <div>
                    <span className="font-medium">{addon.name}</span>
                    {addon.description && (
                        <p className="text-xs text-muted-foreground">{addon.description}</p>
                    )}
                </div>
            </div>
            <span className="ml-4 shrink-0 font-medium">+{formatPrice(addon.price)}</span>
        </button>
    );
}

function CountdownTimer({ endsAt, tierLabel }: { endsAt: string; tierLabel?: string }) {
    const [timeLeft, setTimeLeft] = useState('');
    const [expired, setExpired] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval>>(null);

    useEffect(() => {
        const target = new Date(endsAt + 'T23:59:59').getTime();

        const tick = () => {
            const now = Date.now();
            const diff = target - now;

            if (diff <= 0) {
                setExpired(true);
                setTimeLeft('');
                if (intervalRef.current) clearInterval(intervalRef.current);
                return;
            }

            const days = Math.floor(diff / 86400000);
            const hours = Math.floor((diff % 86400000) / 3600000);
            const minutes = Math.floor((diff % 3600000) / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);

            if (days > 0) {
                setTimeLeft(`${days}d ${hours}h ${minutes}m`);
            } else if (hours > 0) {
                setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
            } else {
                setTimeLeft(`${minutes}m ${seconds}s`);
            }
        };

        tick();
        intervalRef.current = setInterval(tick, 1000);
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [endsAt]);

    if (expired) return null;

    return (
        <div className="mt-3 flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm dark:border-amber-900 dark:bg-amber-950">
            <Timer className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span className="font-medium text-amber-700 dark:text-amber-300">
                {tierLabel ? `${tierLabel} ends in ` : 'Price increases in '}{timeLeft}
            </span>
        </div>
    );
}

function ShareEventButton({ eventName, referralCode, referralDiscount }: { eventName: string; referralCode?: string; referralDiscount: number }) {
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const currentUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';
    const shareUrl = referralCode ? `${currentUrl}?ref=${referralCode}` : currentUrl;
    const shareText = referralCode
        ? `Check out ${eventName}! Use my referral code ${referralCode} for ${formatPrice(referralDiscount)} off.`
        : `Check out ${eventName}!`;

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({ title: eventName, text: shareText, url: shareUrl }).catch(() => {});
        } else {
            setOpen(!open);
        }
    };

    const copyLink = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
    const twitterUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={handleShare}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
                <Share2 className="size-4" />
                <span className="hidden sm:inline">Share</span>
            </button>

            {open && (
                <div className="absolute right-0 top-full z-30 mt-1 w-56 rounded-lg border bg-card p-1.5 shadow-lg">
                    <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
                        onClick={() => setOpen(false)}
                    >
                        <span className="text-base">💬</span>
                        WhatsApp
                    </a>
                    <a
                        href={twitterUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
                        onClick={() => setOpen(false)}
                    >
                        <span className="text-base">𝕏</span>
                        Twitter / X
                    </a>
                    <a
                        href={facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
                        onClick={() => setOpen(false)}
                    >
                        <span className="text-base">📘</span>
                        Facebook
                    </a>
                    <div className="my-1 h-px bg-border" />
                    <button
                        onClick={copyLink}
                        className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
                    >
                        {copied ? <Check className="size-4 text-green-600" /> : <Link2 className="size-4" />}
                        {copied ? 'Copied!' : 'Copy link'}
                    </button>
                </div>
            )}
        </div>
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
