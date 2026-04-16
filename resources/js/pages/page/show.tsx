import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, ClipboardList } from 'lucide-react';
import { redirect } from '@/actions/App/Http/Controllers/Auth/CustomerAuthController';
import { Button } from '@/components/ui/button';
import type { SharedData } from '@/types';
import type { LandingPageSetting } from '@/types/landing-page-setting';
import type { Page } from '@/types/page';

export default function PageShow({
    page,
    settings,
    logoUrl,
}: {
    page: Page;
    settings: LandingPageSetting;
    logoUrl?: string | null;
}) {
    const name = settings.business_name || 'Acara';
    const { auth, appUrl, footerPages } = usePage<SharedData>().props;
    const customer = auth.customer;
    const canonicalUrl = `${appUrl}/page/${page.slug}`;

    return (
        <>
            <Head>
                <title>{`${page.title} - ${name}`}</title>
                {page.meta_description && <meta name="description" content={page.meta_description} />}
                <link rel="canonical" href={canonicalUrl} />

                <meta property="og:type" content="website" />
                <meta property="og:title" content={`${page.title} - ${name}`} />
                {page.meta_description && <meta property="og:description" content={page.meta_description} />}
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:site_name" content={name} />
                {settings.og_image && <meta property="og:image" content={settings.og_image} />}

                <meta name="twitter:card" content="summary" />
                <meta name="twitter:title" content={`${page.title} - ${name}`} />
                {page.meta_description && <meta name="twitter:description" content={page.meta_description} />}
                {settings.og_image && <meta name="twitter:image" content={settings.og_image} />}
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

                {/* Page Content */}
                <article className="mx-auto w-full max-w-3xl px-6 py-12 lg:px-12 lg:py-16">
                    <div className="mb-6">
                        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="size-3" />
                            Back to Home
                        </Link>
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                        {page.title}
                    </h1>

                    {page.content && (
                        <div
                            className="prose prose-neutral mt-8 max-w-none dark:prose-invert"
                            dangerouslySetInnerHTML={{ __html: page.content }}
                        />
                    )}
                </article>

                {/* Footer */}
                <footer className="mt-auto border-t px-6 py-6 lg:px-12">
                    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                        <p className="text-xs text-muted-foreground">
                            {settings.footer_text || `\u00A9 ${new Date().getFullYear()} ${name}. All rights reserved.`}
                        </p>
                        {footerPages.length > 0 && (
                            <div className="flex items-center gap-4">
                                {footerPages.map((p) => (
                                    <Link key={p.slug} href={`/page/${p.slug}`} className="text-xs text-muted-foreground transition-colors hover:text-foreground">
                                        {p.title}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </footer>
            </div>
        </>
    );
}
