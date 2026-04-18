import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Calendar, ClipboardList, FileText, User } from 'lucide-react';
import { redirect } from '@/actions/App/Http/Controllers/Auth/CustomerAuthController';
import { index as blogIndex, show } from '@/actions/App/Http/Controllers/BlogController';
import { PublicEmptyState } from '@/components/public-empty-state';
import { PublicFooter } from '@/components/public-footer';
import { Button } from '@/components/ui/button';
import type { SharedData } from '@/types';
import type { Article } from '@/types/article';
import type { LandingPageSetting } from '@/types/landing-page-setting';

export default function BlogShow({
    article,
    related,
    settings,
    logoUrl,
}: {
    article: Article;
    related: Article[];
    settings: LandingPageSetting;
    logoUrl?: string | null;
}) {
    const name = settings.business_name || 'Acara';
    const { auth, appUrl } = usePage<SharedData>().props;
    const customer = auth.customer;
    const featuredImage = article.media?.[0]?.original_url;
    const publishedDate = article.published_at
        ? new Date(article.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
        : null;
    const canonicalUrl = `${appUrl}/blog/${article.slug}`;

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        ...(article.excerpt && { description: article.excerpt }),
        ...(featuredImage && { image: featuredImage }),
        url: canonicalUrl,
        datePublished: article.published_at,
        ...(article.updated_at && { dateModified: article.updated_at }),
        ...(article.author && {
            author: {
                '@type': 'Person',
                name: article.author.name,
            },
        }),
        publisher: {
            '@type': 'Organization',
            name,
            ...(logoUrl && { logo: { '@type': 'ImageObject', url: logoUrl } }),
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': canonicalUrl,
        },
    };

    return (
        <>
            <Head>
                <title>{`${article.title} - ${name}`}</title>
                {article.excerpt && <meta name="description" content={article.excerpt} />}
                <link rel="canonical" href={canonicalUrl} />

                <meta property="og:type" content="article" />
                <meta property="og:title" content={article.title} />
                <meta property="og:url" content={canonicalUrl} />
                {article.excerpt && <meta property="og:description" content={article.excerpt} />}
                {featuredImage && <meta property="og:image" content={featuredImage} />}
                <meta property="og:site_name" content={name} />
                {article.published_at && <meta property="article:published_time" content={article.published_at} />}
                {article.updated_at && <meta property="article:modified_time" content={article.updated_at} />}
                {article.author && <meta property="article:author" content={article.author.name} />}

                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={article.title} />
                {article.excerpt && <meta name="twitter:description" content={article.excerpt} />}
                {featuredImage && <meta name="twitter:image" content={featuredImage} />}

                <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
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

                {/* Article */}
                <article className="mx-auto w-full max-w-3xl px-6 py-12 lg:px-12 lg:py-16">
                    <div className="mb-6">
                        <Link href={blogIndex.url()} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="size-3" />
                            Back to Blog
                        </Link>
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                        {article.title}
                    </h1>

                    <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                        {article.author && (
                            <span className="flex items-center gap-1.5">
                                <User className="size-3.5" />
                                {article.author.name}
                            </span>
                        )}
                        {publishedDate && (
                            <span className="flex items-center gap-1.5">
                                <Calendar className="size-3.5" />
                                {publishedDate}
                            </span>
                        )}
                    </div>

                    {featuredImage && (
                        <img
                            src={featuredImage}
                            alt={article.title}
                            className="mt-8 w-full rounded-lg object-cover"
                        />
                    )}

                    <div
                        className="prose prose-neutral mt-8 max-w-none dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: article.content }}
                    />
                </article>

                {/* Related Articles */}
                <div className="mx-6 h-px bg-border lg:mx-12" />
                <section className="px-6 py-12 lg:px-12 lg:py-16">
                    <h2 className="mb-6 text-lg font-semibold tracking-tight text-foreground">More Articles</h2>
                    {related.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {related.map((r) => {
                                const img = r.media?.[0]?.original_url;
                                const date = r.published_at
                                    ? new Date(r.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                                    : null;

                                return (
                                    <Link
                                        key={r.id}
                                        href={show.url({ article: r.slug })}
                                        className="group flex flex-col overflow-hidden rounded-lg border bg-card transition-colors hover:border-foreground/20 hover:bg-accent/50"
                                    >
                                        {img && (
                                            <div className="aspect-video overflow-hidden">
                                                <img src={img} alt={r.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                                            </div>
                                        )}
                                        <div className="p-4">
                                            {date && (
                                                <p className="mb-1 text-xs text-muted-foreground">{date}</p>
                                            )}
                                            <h3 className="text-sm font-semibold text-foreground">{r.title}</h3>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <PublicEmptyState
                            icon={FileText}
                            title="No related articles"
                            description="Check back soon for more content"
                        />
                    )}
                </section>

                <PublicFooter settings={settings} name={name} logoUrl={logoUrl} />
            </div>
        </>
    );
}
