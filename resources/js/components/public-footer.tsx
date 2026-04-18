import { Link, usePage } from '@inertiajs/react';
import { index as blogIndex } from '@/actions/App/Http/Controllers/BlogController';
import { showAddons } from '@/actions/App/Http/Controllers/HomeController';
import type { SharedData } from '@/types';
import type { LandingPageSetting } from '@/types/landing-page-setting';

type PublicFooterProps = {
    settings: LandingPageSetting;
    name: string;
    logoUrl?: string | null;
};

export function PublicFooter({ settings, name, logoUrl }: PublicFooterProps) {
    const { footerPages } = usePage<SharedData>().props;

    const socialLinks = [
        { url: settings.social_instagram, label: 'Instagram' },
        { url: settings.social_facebook, label: 'Facebook' },
        { url: settings.social_tiktok, label: 'TikTok' },
        { url: settings.social_whatsapp, label: 'WhatsApp' },
    ].filter((l) => l.url);

    const hasPages = footerPages.length > 0;

    return (
        <footer className="border-t bg-foreground px-6 py-12 text-background lg:px-12 lg:py-16">
            <div className="mx-auto max-w-6xl">
                <div className={`grid grid-cols-1 gap-8 sm:grid-cols-2 ${hasPages ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
                    {/* Brand */}
                    <div>
                        <Link href="/" className="inline-flex items-center gap-2.5">
                            {logoUrl ? (
                                <img src={logoUrl} alt={name} className="h-7 w-auto object-contain brightness-0 invert" />
                            ) : (
                                <div className="flex size-7 items-center justify-center rounded-md bg-background">
                                    <span className="text-xs font-bold text-foreground">{name.charAt(0)}</span>
                                </div>
                            )}
                            <span className="text-sm font-semibold">{name}</span>
                        </Link>
                        {settings.business_description && (
                            <p className="mt-3 text-sm leading-relaxed text-background/60">
                                {settings.business_description}
                            </p>
                        )}
                        {socialLinks.length > 0 && (
                            <div className="mt-4 flex flex-wrap items-center gap-3">
                                {socialLinks.map((link) => (
                                    <a
                                        key={link.label}
                                        href={link.url!}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={link.label}
                                        className="text-sm text-background/60 transition-colors hover:text-background"
                                    >
                                        {link.label}
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Explore */}
                    <div>
                        <h4 className="text-sm font-semibold">Explore</h4>
                        <nav aria-label="Explore" className="mt-3 flex flex-col gap-2">
                            <Link href="/" className="text-sm text-background/60 transition-colors hover:text-background">Home</Link>
                            <a href="/#events" className="text-sm text-background/60 transition-colors hover:text-background">Events</a>
                            <Link href={showAddons.url()} className="text-sm text-background/60 transition-colors hover:text-background">Add-ons</Link>
                            <Link href={blogIndex.url()} className="text-sm text-background/60 transition-colors hover:text-background">Blog</Link>
                        </nav>
                    </div>

                    {/* Information (CMS pages) */}
                    {hasPages && (
                        <div>
                            <h4 className="text-sm font-semibold">Information</h4>
                            <nav aria-label="Information" className="mt-3 flex flex-col gap-2">
                                {footerPages.map((p) => (
                                    <Link
                                        key={p.slug}
                                        href={`/page/${p.slug}`}
                                        className="text-sm text-background/60 transition-colors hover:text-background"
                                    >
                                        {p.title}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    )}

                    {/* Resources */}
                    <div>
                        <h4 className="text-sm font-semibold">Resources</h4>
                        <nav aria-label="Resources" className="mt-3 flex flex-col gap-2">
                            <a href="/sitemap.xml" className="text-sm text-background/60 transition-colors hover:text-background">Sitemap</a>
                            <a href="/feed" className="text-sm text-background/60 transition-colors hover:text-background">RSS Feed</a>
                            {settings.social_whatsapp && (
                                <a
                                    href={settings.social_whatsapp}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-background/60 transition-colors hover:text-background"
                                >
                                    Contact Us
                                </a>
                            )}
                        </nav>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-10 border-t border-background/10 pt-6">
                    <p className="text-xs text-background/40">
                        {settings.footer_text || `\u00A9 ${new Date().getFullYear()} ${name}. All rights reserved.`}
                    </p>
                </div>
            </div>
        </footer>
    );
}
