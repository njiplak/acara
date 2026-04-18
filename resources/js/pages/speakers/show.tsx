import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, ArrowUpRight, Calendar, CalendarX, ClipboardList, Users } from 'lucide-react';
import { useEffect } from 'react';
import { redirect } from '@/actions/App/Http/Controllers/Auth/CustomerAuthController';
import { showEvent, showSpeaker } from '@/actions/App/Http/Controllers/HomeController';
import { PublicEmptyState } from '@/components/public-empty-state';
import { PublicFooter } from '@/components/public-footer';
import { Button } from '@/components/ui/button';
import type { SharedData } from '@/types';
import type { Event } from '@/types/event';
import type { LandingPageSetting } from '@/types/landing-page-setting';
import type { Speaker } from '@/types/speaker';

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

export default function SpeakerShow({
    settings,
    logoUrl,
    speaker,
    events,
}: {
    settings: LandingPageSetting;
    logoUrl?: string | null;
    speaker: Speaker;
    events: Event[];
}) {
    const name = settings.business_name || 'Acara';
    const { auth, appUrl } = usePage<SharedData>().props;
    const customer = auth.customer;
    const photo = speaker.media?.[0]?.original_url;
    const canonicalUrl = `${appUrl}${showSpeaker.url({ speaker: speaker.slug })}`;

    const bioPlain = speaker.bio ? speaker.bio.replace(/<[^>]+>/g, '').slice(0, 160) : null;

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: speaker.name,
        ...(speaker.title && { jobTitle: speaker.title }),
        ...(bioPlain && { description: bioPlain }),
        ...(photo && { image: photo }),
        url: canonicalUrl,
    };

    useEffect(() => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(jsonLd);
        document.head.appendChild(script);
        return () => { document.head.removeChild(script); };
    }, []);

    return (
        <>
            <Head>
                <title>{`${speaker.name} - ${name}`}</title>
                {bioPlain ? <meta name="description" content={bioPlain} /> : null}
                <link rel="canonical" href={canonicalUrl} />

                <meta property="og:type" content="profile" />
                <meta property="og:title" content={`${speaker.name} - ${name}`} />
                <meta property="og:url" content={canonicalUrl} />
                {bioPlain ? <meta property="og:description" content={bioPlain} /> : null}
                {photo ? <meta property="og:image" content={photo} /> : null}
                <meta property="og:site_name" content={name} />

                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={`${speaker.name} - ${name}`} />
                {bioPlain ? <meta name="twitter:description" content={bioPlain} /> : null}
                {photo ? <meta name="twitter:image" content={photo} /> : null}
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
                        </div>
                    ) : (
                        <Button asChild variant="outline" size="sm">
                            <a href={redirect.url()}>Sign in</a>
                        </Button>
                    )}
                </header>

                {/* Speaker Profile */}
                <section className="mx-auto w-full max-w-4xl px-6 py-12 lg:px-12 lg:py-16">
                    <div className="mb-8">
                        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="size-3" />
                            Back to Home
                        </Link>
                    </div>

                    <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
                        {photo ? (
                            <img
                                src={photo}
                                alt={speaker.name}
                                className="size-40 shrink-0 rounded-2xl object-cover sm:size-48"
                            />
                        ) : (
                            <div className="flex size-40 shrink-0 items-center justify-center rounded-2xl bg-muted text-5xl font-bold text-muted-foreground sm:size-48">
                                {speaker.name.charAt(0)}
                            </div>
                        )}

                        <div className="flex-1">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                                {speaker.name}
                            </h1>
                            {speaker.title && (
                                <p className="mt-2 text-base text-muted-foreground">{speaker.title}</p>
                            )}
                            {speaker.bio && (
                                <div
                                    className="prose prose-neutral mt-6 max-w-none dark:prose-invert"
                                    dangerouslySetInnerHTML={{ __html: speaker.bio }}
                                />
                            )}
                        </div>
                    </div>
                </section>

                {/* Events Section */}
                <section className="border-t bg-secondary/30 px-6 py-12 lg:px-12 lg:py-16">
                    <div className="mx-auto max-w-4xl">
                        <h2 className="mb-6 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                            Upcoming Events with {speaker.name}
                        </h2>
                        {events.length > 0 ? (
                            <div className="grid gap-4 sm:grid-cols-2">
                                {events.map((event) => {
                                    const lowestPrice = getLowestPrice(event);
                                    const catalogCount = event.catalogs?.length || 0;

                                    return (
                                        <Link
                                            key={event.id}
                                            href={showEvent.url({ event: event.id })}
                                            className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-lg"
                                        >
                                            <div className="h-28 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/30" />

                                            <div className="relative -mt-6 flex flex-1 flex-col rounded-t-2xl bg-card p-5">
                                                <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Calendar className="size-3.5" />
                                                    <span>{formatDateRange(event.start_date, event.end_date)}</span>
                                                </div>

                                                <h3 className="text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                                                    {event.name}
                                                </h3>

                                                {event.description && (
                                                    <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                                                        {event.description}
                                                    </p>
                                                )}

                                                <div className="mt-auto flex items-center justify-between pt-5">
                                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                        {catalogCount > 0 && (
                                                            <span className="flex items-center gap-1">
                                                                <Users className="size-3.5" />
                                                                {catalogCount} {catalogCount === 1 ? 'session' : 'sessions'}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {lowestPrice !== null && (
                                                        <span className="text-sm font-bold text-foreground">
                                                            {catalogCount > 1 ? `From ${formatPrice(lowestPrice)}` : formatPrice(lowestPrice)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="absolute right-4 top-4 rounded-full bg-background/80 p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                                                <ArrowUpRight className="size-3.5 text-foreground" />
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        ) : (
                            <PublicEmptyState
                                icon={CalendarX}
                                title="No upcoming events"
                                description={`Check back soon for events featuring ${speaker.name}`}
                            />
                        )}
                    </div>
                </section>

                <PublicFooter settings={settings} name={name} logoUrl={logoUrl} />
            </div>
        </>
    );
}
