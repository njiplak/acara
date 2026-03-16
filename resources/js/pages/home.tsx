import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, Calendar, ClipboardList, Star, Users } from 'lucide-react';
import { redirect } from '@/actions/App/Http/Controllers/Auth/CustomerAuthController';
import { showEvent } from '@/actions/App/Http/Controllers/HomeController';
import { Button } from '@/components/ui/button';
import type { SharedData } from '@/types';
import type { Event } from '@/types/event';
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

function getLowestPrice(event: Event): number | null {
    if (event.lowest_active_price != null) return event.lowest_active_price;
    if (!event.catalogs || event.catalogs.length === 0) return null;
    return Math.min(...event.catalogs.map((c) => c.price));
}

export default function Home({ settings, events, logoUrl, testimonials = [] }: { settings: LandingPageSetting; events: Event[]; logoUrl?: string | null; testimonials?: Testimonial[] }) {
    const name = settings.business_name || 'Acara';
    const { auth } = usePage<SharedData>().props;
    const customer = auth.customer;

    return (
        <>
            <Head>
                <title>{settings.meta_title || name}</title>
                {settings.meta_description && <meta name="description" content={settings.meta_description} />}
                {settings.meta_keywords && <meta name="keywords" content={settings.meta_keywords} />}
                {settings.og_image && <meta property="og:image" content={settings.og_image} />}
                {settings.google_site_verification && <meta name="google-site-verification" content={settings.google_site_verification} />}
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
                            <a href={redirect.url()}>Sign in</a>
                        </Button>
                    )}
                </header>

                {/* Hero */}
                <section className="flex flex-col items-center px-6 py-16 text-center lg:px-12 lg:py-24">
                    {settings.hero_badge_text && (
                        <p className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                            {settings.hero_badge_text}
                        </p>
                    )}

                    <h1 className="max-w-2xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                        {settings.hero_title || name}
                    </h1>

                    {settings.hero_subtitle && (
                        <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">{settings.hero_subtitle}</p>
                    )}

                    {events.length > 0 && (
                        <Button asChild size="lg" className="mt-8 gap-2.5 px-8">
                            <a href="#events">
                                {settings.cta_text || 'Browse Events'}
                                <ArrowRight className="size-4" />
                            </a>
                        </Button>
                    )}
                </section>

                <div className="mx-6 h-px bg-border lg:mx-12" />

                {/* Events */}
                <section id="events" className="flex-1 px-6 py-12 lg:px-12 lg:py-16">
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold tracking-tight text-foreground">Upcoming Events</h2>
                        <p className="mt-1 text-sm text-muted-foreground">Find and join our latest events</p>
                    </div>

                    {events.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
                            <Calendar className="mb-3 size-8 text-muted-foreground/50" />
                            <p className="text-sm font-medium text-muted-foreground">No upcoming events</p>
                            <p className="mt-1 text-xs text-muted-foreground/70">Check back soon for new events</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {events.map((event) => (
                                <EventCard key={event.id} event={event} />
                            ))}
                        </div>
                    )}
                </section>

                {/* Testimonials */}
                {testimonials.length > 0 && (
                    <>
                        <div className="mx-6 h-px bg-border lg:mx-12" />
                        <section className="px-6 py-12 lg:px-12 lg:py-16">
                            <div className="mb-8 text-center">
                                <h2 className="text-xl font-semibold tracking-tight text-foreground">What Our Attendees Say</h2>
                                <p className="mt-1 text-sm text-muted-foreground">Hear from people who joined our events</p>
                            </div>
                            <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {testimonials.map((t) => (
                                    <TestimonialCard key={t.id} testimonial={t} />
                                ))}
                            </div>
                        </section>
                    </>
                )}

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

function EventCard({ event }: { event: Event }) {
    const lowestPrice = getLowestPrice(event);
    const catalogCount = event.catalogs?.length || 0;

    return (
        <Link
            href={showEvent.url({ event: event.id })}
            className="group flex flex-col rounded-lg border bg-card p-5 transition-colors hover:border-foreground/20 hover:bg-accent/50"
        >
            <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="size-3.5" />
                <span>{formatDateRange(event.start_date, event.end_date)}</span>
            </div>

            <h3 className="text-base font-semibold text-foreground group-hover:text-foreground/90">{event.name}</h3>

            {event.description && (
                <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{event.description}</p>
            )}

            <div className="mt-auto flex items-center justify-between pt-4">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {catalogCount > 0 && (
                        <span className="flex items-center gap-1">
                            <Users className="size-3.5" />
                            {catalogCount} {catalogCount === 1 ? 'session' : 'sessions'}
                        </span>
                    )}
                </div>

                {lowestPrice !== null && (
                    <span className="text-sm font-semibold text-foreground">
                        {catalogCount > 1 ? `From ${formatPrice(lowestPrice)}` : formatPrice(lowestPrice)}
                    </span>
                )}
            </div>
        </Link>
    );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
    return (
        <div className="flex flex-col rounded-lg border bg-card p-5">
            <div className="mb-3 flex items-center gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                    <Star
                        key={i}
                        className={`size-3.5 ${i < testimonial.rating ? 'fill-foreground text-foreground' : 'text-muted-foreground/30'}`}
                    />
                ))}
            </div>
            <p className="flex-1 text-sm leading-relaxed text-muted-foreground">"{testimonial.body}"</p>
            <div className="mt-4 flex items-center gap-2.5">
                {testimonial.customer?.avatar ? (
                    <img src={testimonial.customer.avatar} alt={testimonial.customer.name} className="size-7 rounded-full" />
                ) : (
                    <div className="flex size-7 items-center justify-center rounded-full bg-muted text-xs font-medium">
                        {testimonial.customer?.name?.charAt(0).toUpperCase()}
                    </div>
                )}
                <div>
                    <p className="text-sm font-medium text-foreground">{testimonial.customer?.name}</p>
                    {testimonial.event && (
                        <p className="text-xs text-muted-foreground">{testimonial.event.name}</p>
                    )}
                </div>
            </div>
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
