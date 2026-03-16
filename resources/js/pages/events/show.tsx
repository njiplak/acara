import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Calendar, Check, ClipboardList, Clock, MapPin, Tag, Ticket, Users, Wallet } from 'lucide-react';
import { useState } from 'react';
import { redirect } from '@/actions/App/Http/Controllers/Auth/CustomerAuthController';
import { store } from '@/actions/App/Http/Controllers/Customer/OrderController';
import { Button } from '@/components/ui/button';
import type { Addon } from '@/types/addon';
import type { SharedData } from '@/types';
import type { Catalog } from '@/types/catalog';
import type { Event } from '@/types/event';
import type { LandingPageSetting } from '@/types/landing-page-setting';

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
    customerOrderCatalogIds: number[];
    customerBalance: number;
    referralDiscount: number;
};

export default function EventShow({ settings, logoUrl, event, orderCounts, customerOrderCatalogIds, customerBalance, referralDiscount }: Props) {
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

                            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{event.name}</h1>

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

                                        return (
                                            <CatalogCard
                                                key={catalog.id}
                                                catalog={catalog}
                                                eventId={event.id}
                                                isAuthenticated={!!customer}
                                                isFull={isFull}
                                                alreadyOrdered={alreadyOrdered}
                                                currentOrders={currentOrders}
                                                customerBalance={customerBalance}
                                                referralDiscount={referralDiscount}
                                            />
                                        );
                                    })}
                                </div>
                            )}
                        </div>

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
    currentOrders,
    customerBalance,
    referralDiscount,
}: {
    catalog: Catalog & { pivot?: { max_participant: number | null } };
    eventId: number;
    isAuthenticated: boolean;
    isFull: boolean;
    alreadyOrdered: boolean;
    currentOrders: number;
    customerBalance: number;
    referralDiscount: number;
}) {
    const addons = catalog.addons || [];
    const hasDiscount = catalog.strike_price !== null && catalog.strike_price > catalog.price;
    const [selectedAddons, setSelectedAddons] = useState<number[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [referralCode, setReferralCode] = useState('');
    const [useBalance, setUseBalance] = useState(false);

    const addonsTotal = addons
        .filter((a) => selectedAddons.includes(a.id))
        .reduce((sum, a) => sum + a.price, 0);
    const subtotal = catalog.price + addonsTotal;
    const appliedDiscount = referralCode.trim() ? Math.min(referralDiscount, subtotal) : 0;
    const remainingAfterDiscount = subtotal - appliedDiscount;
    const appliedBalance = useBalance ? Math.min(customerBalance, remainingAfterDiscount) : 0;
    const total = subtotal - appliedDiscount - appliedBalance;

    const toggleAddon = (id: number) => {
        setSelectedAddons((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));
    };

    const handleRegister = () => {
        setSubmitting(true);
        router.post(
            store.url(),
            {
                event_id: eventId,
                catalog_id: catalog.id,
                addon_ids: selectedAddons,
                referral_code: referralCode.trim() || undefined,
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
                    <span className="text-lg font-bold text-foreground">{formatPrice(catalog.price)}</span>
                </div>
            </div>

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

            {/* Referral code & balance — shown for authenticated users who can register */}
            {isAuthenticated && !isFull && !alreadyOrdered && (
                <div className="mt-4 border-t pt-4 space-y-3">
                    {/* Referral code input */}
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
                    {(appliedDiscount > 0 || appliedBalance > 0 || selectedAddons.length > 0) && (
                        <div className="space-y-1.5 border-t pt-3 text-sm">
                            <div className="flex justify-between text-muted-foreground">
                                <span>Subtotal</span>
                                <span>{formatPrice(subtotal)}</span>
                            </div>
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
                        <Button disabled variant="outline" className="w-full">
                            Session Full
                        </Button>
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
