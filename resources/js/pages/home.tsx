import { Head, Link, usePage } from '@inertiajs/react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Calendar, Check, ChevronDown, ClipboardList, CalendarX, Star, Users } from 'lucide-react';
import * as React from 'react';
import { redirect } from '@/actions/App/Http/Controllers/Auth/CustomerAuthController';
import { index as blogIndex, show as blogShow } from '@/actions/App/Http/Controllers/BlogController';
import { showAddons, showEvent, showSpeaker } from '@/actions/App/Http/Controllers/HomeController';
import { PublicEmptyState } from '@/components/public-empty-state';
import { Button } from '@/components/ui/button';
import type { SharedData } from '@/types';
import type { Article } from '@/types/article';
import type { Event } from '@/types/event';
import type { Faq } from '@/types/faq';
import type { LandingPageSetting } from '@/types/landing-page-setting';
import type { Speaker } from '@/types/speaker';
import type { SubscriptionPlan } from '@/types/subscription';
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

export default function Home({
    settings,
    events,
    logoUrl,
    heroImageUrl,
    speakers = [],
    plans = [],
    testimonials = [],
    faqs = [],
    articles = [],
}: {
    settings: LandingPageSetting;
    events: Event[];
    logoUrl?: string | null;
    heroImageUrl?: string | null;
    speakers?: Speaker[];
    plans?: SubscriptionPlan[];
    testimonials?: Testimonial[];
    faqs?: Faq[];
    articles?: Article[];
}) {
    const name = settings.business_name || 'Acara';
    const { auth, appUrl, footerPages } = usePage<SharedData>().props;
    const customer = auth.customer;
    const title = settings.meta_title || name;
    const description = settings.meta_description || '';

    return (
        <>
            <Head>
                <title>{title}</title>
                {description && <meta name="description" content={description} />}
                {settings.meta_keywords && <meta name="keywords" content={settings.meta_keywords} />}
                {settings.google_site_verification && <meta name="google-site-verification" content={settings.google_site_verification} />}
                <link rel="canonical" href={appUrl} />

                <meta property="og:type" content="website" />
                <meta property="og:title" content={title} />
                {description && <meta property="og:description" content={description} />}
                <meta property="og:url" content={appUrl} />
                <meta property="og:site_name" content={name} />
                {settings.og_image && <meta property="og:image" content={settings.og_image} />}

                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={title} />
                {description && <meta name="twitter:description" content={description} />}
                {settings.og_image && <meta name="twitter:image" content={settings.og_image} />}
            </Head>

            <div className="relative flex min-h-svh flex-col bg-background">
                {/* Hero Section */}
                <HeroSection
                    name={name}
                    logoUrl={logoUrl}
                    heroImageUrl={heroImageUrl}
                    settings={settings}
                    customer={customer}
                    events={events}
                />

                {/* About Section - Animated Text */}
                <AboutSection settings={settings} />

                {/* Events Section */}
                {events.length > 0 ? (
                    <EventsSection events={events} settings={settings} />
                ) : (
                    <section className="bg-secondary/30 px-6 py-16 lg:px-12 lg:py-24">
                        <div className="mx-auto max-w-6xl">
                            <div className="mb-10 text-center">
                                <h2 className="text-3xl font-bold tracking-tight text-foreground lg:text-4xl">Upcoming Events</h2>
                                <p className="mt-3 text-base text-muted-foreground">Stay tuned for our upcoming events</p>
                            </div>
                            <PublicEmptyState
                                icon={CalendarX}
                                title="No upcoming events"
                                description="Check back soon for new events"
                            />
                        </div>
                    </section>
                )}

                {/* Instructors Section */}
                {speakers.length > 0 && (
                    <InstructorsSection speakers={speakers} />
                )}

                {/* Membership Plans - hidden for initial testing without subscription */}
                {/* {plans.length > 0 && (
                    <MembershipSection plans={plans} />
                )} */}

                {/* Testimonials */}
                {testimonials.length > 0 && (
                    <section className="bg-background px-6 py-16 lg:px-12 lg:py-24">
                        <div className="mx-auto max-w-6xl">
                            <div className="mb-10 text-center">
                                <h2 className="text-3xl font-bold tracking-tight text-foreground lg:text-4xl">What Our Attendees Say</h2>
                                <p className="mt-3 text-base text-muted-foreground">Hear from people who joined our events</p>
                            </div>
                            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                {testimonials.map((t) => (
                                    <TestimonialCard key={t.id} testimonial={t} />
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Latest Articles */}
                {articles.length > 0 && (
                    <section className="bg-secondary/30 px-6 py-16 lg:px-12 lg:py-24">
                        <div className="mx-auto max-w-6xl">
                            <div className="mb-10 flex items-end justify-between">
                                <div>
                                    <h2 className="text-3xl font-bold tracking-tight text-foreground lg:text-4xl">Latest Articles</h2>
                                    <p className="mt-3 text-base text-muted-foreground">Insights and updates from our team</p>
                                </div>
                                <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
                                    <Link href={blogIndex.url()}>
                                        View All
                                        <ArrowRight className="ml-1.5 size-3.5" />
                                    </Link>
                                </Button>
                            </div>
                            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                {articles.map((article) => (
                                    <Link
                                        key={article.id}
                                        href={blogShow.url({ article: article.slug })}
                                        className="group flex flex-col overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-lg"
                                    >
                                        <div className="aspect-video overflow-hidden">
                                            <img
                                                src={`https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&fit=crop&sig=${article.id}`}
                                                alt={article.title}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        </div>
                                        <div className="flex flex-1 flex-col p-5">
                                            {article.published_at && (
                                                <p className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <Calendar className="size-3.5" />
                                                    {new Date(article.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </p>
                                            )}
                                            <h3 className="text-base font-semibold text-foreground">{article.title}</h3>
                                            {article.excerpt && (
                                                <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{article.excerpt}</p>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                            <div className="mt-8 text-center sm:hidden">
                                <Button asChild variant="outline" size="sm">
                                    <Link href={blogIndex.url()}>
                                        View All
                                        <ArrowRight className="ml-1.5 size-3.5" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </section>
                )}

                {/* FAQ */}
                {faqs.length > 0 && (
                    <section className="bg-background px-6 py-16 lg:px-12 lg:py-24">
                        <div className="mx-auto max-w-2xl">
                            <div className="mb-10 text-center">
                                <h2 className="text-3xl font-bold tracking-tight text-foreground lg:text-4xl">Frequently Asked Questions</h2>
                                <p className="mt-3 text-base text-muted-foreground">Find answers to common questions</p>
                            </div>
                            <div className="divide-y">
                                {faqs.map((faq) => (
                                    <FaqItem key={faq.id} faq={faq} />
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Footer */}
                <footer className="border-t bg-foreground px-6 py-10 text-background lg:px-12">
                    <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
                        <div className="flex items-center gap-2.5">
                            <img src="https://placehold.co/84x28/ffffff/000000?text=LOGO" alt={name} className="h-7 w-auto object-contain brightness-0 invert" />
                            <span className="text-sm font-semibold">{name}</span>
                        </div>
                        {footerPages.length > 0 && (
                            <div className="flex items-center gap-4">
                                {footerPages.map((p) => (
                                    <Link key={p.slug} href={`/page/${p.slug}`} className="text-xs text-background/60 transition-colors hover:text-background">
                                        {p.title}
                                    </Link>
                                ))}
                            </div>
                        )}
                        <p className="text-xs text-background/60">
                            {settings.footer_text || `\u00A9 ${new Date().getFullYear()} ${name}. All rights reserved.`}
                        </p>
                        <SocialLinks settings={settings} />
                    </div>
                </footer>
            </div>
        </>
    );
}

/* ─── Hero Section ─── */
function HeroSection({
    name,
    logoUrl,
    heroImageUrl,
    settings,
    customer,
    events,
}: {
    name: string;
    logoUrl?: string | null;
    heroImageUrl?: string | null;
    settings: LandingPageSetting;
    customer: SharedData['auth']['customer'];
    events: Event[];
}) {
    return (
        <section className="relative min-h-svh overflow-hidden bg-foreground">
            {/* Background Image */}
            <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Naam_Yoga_LA_Class.jpg/1920px-Naam_Yoga_LA_Class.jpg?_=20140511030540"
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />

            {/* Nav Bar */}
            <nav className="relative z-10 flex items-center justify-between px-6 py-5 lg:px-12">
                <div className="flex items-center gap-8">
                    <div className="hidden items-center gap-6 sm:flex">
                        {events.length > 0 && (
                            <a href="#events" className="text-sm text-background/80 transition-colors hover:text-background">
                                Events
                            </a>
                        )}
                        <Link href={showAddons.url()} className="text-sm text-background/80 transition-colors hover:text-background">
                            Add-ons
                        </Link>
                        <Link href={blogIndex.url()} className="text-sm text-background/80 transition-colors hover:text-background">
                            Blog
                        </Link>
                    </div>
                </div>

                {/* Center Logo */}
                <Link href="/" className="absolute left-1/2 top-5 flex -translate-x-1/2 items-center gap-2">
                    <img src="https://placehold.co/120x40/000000/ffffff?text=LOGO" alt={name} className="h-10 w-auto object-contain" />
                </Link>

                {/* Right CTA */}
                <div className="flex items-center gap-3">
                    {customer ? (
                        <>
                            <Button asChild variant="outline" size="sm" className="border-background/30 bg-transparent text-background hover:bg-background/10 hover:text-background">
                                <Link href="/customer/orders">
                                    <ClipboardList className="size-4" />
                                    My Orders
                                </Link>
                            </Button>
                            <div className="flex items-center gap-2">
                                <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop" alt={customer.name} className="size-8 rounded-full ring-2 ring-background/30" />
                            </div>
                        </>
                    ) : (
                        <a
                            href={redirect.url()}
                            className="inline-flex items-center gap-2 rounded-full bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-background/90"
                        >
                            Join Now
                            <ArrowUpRight className="size-4" />
                        </a>
                    )}
                </div>
            </nav>

            {/* Hero Content */}
            <div className="relative z-10 flex min-h-svh flex-col justify-between px-6 pb-12 pt-20 lg:px-12 lg:pb-16 lg:pt-32">
                <div className="max-w-2xl">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="text-4xl font-bold leading-tight tracking-tight text-background sm:text-5xl lg:text-6xl"
                    >
                        {settings.hero_title || name}
                    </motion.h1>

                    {settings.hero_subtitle && (
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                            className="mt-6 max-w-lg text-base leading-relaxed text-background/70 lg:text-lg"
                        >
                            {settings.hero_subtitle}
                        </motion.p>
                    )}

                    {events.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
                            className="mt-8"
                        >
                            <a
                                href="#events"
                                className="inline-flex items-center gap-2.5 rounded-full bg-background px-7 py-3 text-sm font-medium text-foreground transition-colors hover:bg-background/90"
                            >
                                {settings.cta_text || 'See Our Events'}
                                <ArrowUpRight className="size-4" />
                            </a>
                        </motion.div>
                    )}
                </div>

                {/* Stats Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
                    className="mt-auto flex flex-wrap gap-12 pt-16 lg:gap-20"
                >
                    <StatItem value={`${events.length}+`} label="Upcoming Events" />
                    <StatItem value="100+" label="Happy Attendees" />
                    <StatItem value="96%" label="Satisfaction Rate" />
                </motion.div>
            </div>
        </section>
    );
}

function StatItem({ value, label }: { value: string; label: string }) {
    return (
        <div>
            <p className="text-3xl font-bold text-background lg:text-4xl">{value}</p>
            <p className="mt-1 text-sm text-background/60">{label}</p>
        </div>
    );
}

/* ─── About Section (Animated Text) ─── */
function AboutSection({ settings }: { settings: LandingPageSetting }) {
    const ref = React.useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });
    const aboutText = settings.business_description || `A community focused on creating meaningful experiences, supporting each individual through expert guidance and a welcoming, purposeful environment where every event becomes memorable.`;

    const words = aboutText.split(' ');
    const midPoint = Math.floor(words.length * 0.4);

    return (
        <section ref={ref} className="bg-background px-6 py-20 lg:px-12 lg:py-32">
            <div className="mx-auto max-w-5xl text-center">
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.6 }}
                    className="mb-8 flex items-center justify-center gap-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground"
                >
                    <span className="h-px w-8 bg-border" />
                    About {settings.business_name || 'Us'}
                    <span className="h-px w-8 bg-border" />
                </motion.p>

                <p className="text-2xl font-medium leading-relaxed tracking-tight sm:text-3xl lg:text-4xl lg:leading-relaxed">
                    {words.map((word, i) => (
                        <motion.span
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{
                                duration: 0.4,
                                delay: i * 0.04,
                                ease: 'easeOut',
                            }}
                            className={i >= midPoint ? 'text-muted-foreground' : 'text-foreground'}
                        >
                            {word}{' '}
                        </motion.span>
                    ))}
                </p>
            </div>
        </section>
    );
}

/* ─── Events Section ─── */
function EventsSection({ events, settings }: { events: Event[]; settings: LandingPageSetting }) {
    const ref = React.useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-80px' });
    const displayEvents = events.slice(0, 3);

    return (
        <section id="events" ref={ref} className="bg-secondary/30 px-6 py-16 lg:px-12 lg:py-24">
            <div className="mx-auto max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="mb-10 text-center"
                >
                    <h2 className="text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
                        Discover Our Upcoming Events
                    </h2>
                    <p className="mt-3 max-w-xl mx-auto text-base text-muted-foreground">
                        {settings.hero_subtitle || 'Find and join our curated events designed to inspire and connect.'}
                    </p>
                </motion.div>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {displayEvents.map((event, i) => (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                        >
                            <EventCard event={event} />
                        </motion.div>
                    ))}
                </div>

                {events.length > 3 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="mt-10 text-center"
                    >
                        <a
                            href="#events"
                            className="inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
                        >
                            See All Events
                            <ArrowUpRight className="size-4" />
                        </a>
                    </motion.div>
                )}
            </div>
        </section>
    );
}

function EventCard({ event }: { event: Event }) {
    const lowestPrice = getLowestPrice(event);
    const catalogCount = event.catalogs?.length || 0;

    return (
        <Link
            href={showEvent.url({ event: event.id })}
            className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-lg"
        >
            {/* Gradient top band */}
            <div className="h-32 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/30" />

            {/* Card body overlapping the gradient */}
            <div className="relative -mt-6 flex flex-1 flex-col rounded-t-2xl bg-card p-5">
                <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="size-3.5" />
                    <span>{formatDateRange(event.start_date, event.end_date)}</span>
                </div>

                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{event.name}</h3>

                {event.description && (
                    <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{event.description}</p>
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
        </Link>
    );
}

/* ─── Instructors Section ─── */
function InstructorsSection({ speakers }: { speakers: Speaker[] }) {
    const ref = React.useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-80px' });
    const displaySpeakers = speakers.slice(0, 8);

    return (
        <section ref={ref} className="bg-secondary/30 px-6 py-16 lg:px-12 lg:py-24">
            <div className="mx-auto max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="mb-10 flex items-end justify-between"
                >
                    <div>
                        <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                            <span>&#10022;</span> Outstanding Instructors
                        </p>
                        <h2 className="text-3xl font-bold uppercase tracking-tight text-foreground lg:text-4xl">
                            Meet Your Instructors
                        </h2>
                    </div>
                </motion.div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {displaySpeakers.map((speaker, i) => (
                        <Link key={speaker.id} href={showSpeaker.url({ speaker: speaker.slug })}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                                transition={{ duration: 0.4, delay: i * 0.05 }}
                                className="group relative aspect-square overflow-hidden rounded-2xl bg-muted"
                            >
                                {speaker.media?.[0]?.original_url ? (
                                    <img
                                        src={speaker.media[0].original_url}
                                        alt={speaker.name}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-muted text-4xl font-bold text-muted-foreground">
                                        {speaker.name.charAt(0)}
                                    </div>
                                )}

                                {/* Hover overlay */}
                                <div className="absolute inset-0 flex flex-col justify-between bg-primary p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                    <div>
                                        <p className="text-xl font-bold uppercase text-primary-foreground lg:text-2xl">{speaker.name}</p>
                                        {speaker.title && (
                                            <p className="mt-2 text-sm text-primary-foreground/80">{speaker.title}</p>
                                        )}
                                    </div>
                                    <span className="inline-flex items-center gap-2 text-sm font-medium text-primary-foreground/90 transition-colors hover:text-primary-foreground">
                                        View Profile <ArrowRight className="size-4" />
                                    </span>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ─── Membership Section ─── */
function MembershipSection({ plans }: { plans: SubscriptionPlan[] }) {
    const ref = React.useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-80px' });

    function formatPeriod(plan: SubscriptionPlan) {
        if (!plan.periodicity || !plan.periodicity_type) return '';
        const type = plan.periodicity_type.replace(/s$/, '');
        return plan.periodicity === 1 ? `/ ${type}` : `/ ${plan.periodicity} ${plan.periodicity_type}`;
    }

    return (
        <section ref={ref} className="bg-background px-6 py-16 lg:px-12 lg:py-24">
            <div className="mx-auto max-w-5xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="mb-12 text-center"
                >
                    <p className="mb-3 flex items-center justify-center gap-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        <span className="h-px w-8 bg-border" />
                        Membership
                        <span className="h-px w-8 bg-border" />
                    </p>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
                        Choose Your Plan
                    </h2>
                    <p className="mt-3 text-base text-muted-foreground">
                        Join our community and unlock exclusive benefits
                    </p>
                </motion.div>

                <div className={`grid gap-6 ${plans.length === 1 ? 'max-w-md mx-auto' : plans.length === 2 ? 'max-w-3xl mx-auto sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
                    {plans.map((plan, i) => {
                        const isPopular = i === 1 && plans.length > 1;

                        return (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className={`relative flex flex-col rounded-2xl border p-7 ${isPopular ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'bg-card'}`}
                            >
                                {isPopular && (
                                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                                        Popular
                                    </span>
                                )}

                                <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                                {plan.description && (
                                    <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                                )}

                                <div className="mt-5 flex items-baseline gap-1">
                                    <span className="text-3xl font-bold text-foreground">{formatPrice(plan.price)}</span>
                                    <span className="text-sm text-muted-foreground">{formatPeriod(plan)}</span>
                                </div>

                                {plan.features && plan.features.length > 0 && (
                                    <ul className="mt-6 space-y-3">
                                        {plan.features.map((feature) => (
                                            <li key={feature.id} className="flex items-start gap-2.5 text-sm text-foreground">
                                                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                                                <span>
                                                    {feature.pivot?.charges != null && feature.pivot.charges > 0
                                                        ? `${feature.pivot.charges}x ${feature.name}`
                                                        : feature.name}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                <div className="mt-auto pt-6">
                                    <Link
                                        href="/customer/subscription"
                                        className={`flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-medium transition-colors ${
                                            isPopular
                                                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                                : 'bg-foreground text-background hover:bg-foreground/90'
                                        }`}
                                    >
                                        Get Started
                                        <ArrowRight className="size-4" />
                                    </Link>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

/* ─── Testimonial Card ─── */
function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
    return (
        <div className="flex flex-col rounded-2xl border bg-card p-6">
            <div className="mb-3 flex items-center gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                    <Star
                        key={i}
                        className={`size-4 ${i < testimonial.rating ? 'fill-primary text-primary' : 'text-muted-foreground/30'}`}
                    />
                ))}
            </div>
            <p className="flex-1 text-sm leading-relaxed text-muted-foreground">"{testimonial.body}"</p>
            <div className="mt-5 flex items-center gap-3">
                <img src={`https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&sig=${testimonial.id}`} alt={testimonial.customer?.name} className="size-9 rounded-full" />
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

/* ─── FAQ ─── */
function FaqItem({ faq }: { faq: Faq }) {
    const [open, setOpen] = React.useState(false);

    return (
        <div className="py-5">
            <button
                type="button"
                className="flex w-full items-center justify-between text-left"
                onClick={() => setOpen(!open)}
            >
                <span className="text-base font-medium text-foreground">{faq.question}</span>
                <ChevronDown
                    className={`ml-4 size-5 shrink-0 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                />
            </button>
            {open && (
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground whitespace-pre-line">{faq.answer}</p>
            )}
        </div>
    );
}

/* ─── Social Links ─── */
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
                    className="text-xs text-background/60 transition-colors hover:text-background"
                >
                    {link.label}
                </a>
            ))}
        </div>
    );
}
