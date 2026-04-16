import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Calendar, ClipboardList, FileText } from 'lucide-react';
import { redirect } from '@/actions/App/Http/Controllers/Auth/CustomerAuthController';
import { show } from '@/actions/App/Http/Controllers/BlogController';
import { PublicEmptyState } from '@/components/public-empty-state';
import { Button } from '@/components/ui/button';
import type { SharedData } from '@/types';
import type { Article } from '@/types/article';
import type { LandingPageSetting } from '@/types/landing-page-setting';

type PaginatedArticles = {
    data: Article[];
    current_page: number;
    last_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
};

export default function BlogIndex({
    articles,
    settings,
    logoUrl,
}: {
    articles: PaginatedArticles;
    settings: LandingPageSetting;
    logoUrl?: string | null;
}) {
    const name = settings.business_name || 'Acara';
    const { auth, appUrl, footerPages } = usePage<SharedData>().props;
    const customer = auth.customer;
    const description = `Latest articles and updates from ${name}`;
    const canonicalUrl = articles.current_page > 1
        ? `${appUrl}/blog?page=${articles.current_page}`
        : `${appUrl}/blog`;

    return (
        <>
            <Head>
                <title>{`Blog - ${name}`}</title>
                <meta name="description" content={description} />
                <link rel="canonical" href={canonicalUrl} />

                <meta property="og:type" content="website" />
                <meta property="og:title" content={`Blog - ${name}`} />
                <meta property="og:description" content={description} />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:site_name" content={name} />
                {settings.og_image && <meta property="og:image" content={settings.og_image} />}

                <meta name="twitter:card" content="summary" />
                <meta name="twitter:title" content={`Blog - ${name}`} />
                <meta name="twitter:description" content={description} />
                {settings.og_image && <meta name="twitter:image" content={settings.og_image} />}

                {articles.prev_page_url && <link rel="prev" href={articles.prev_page_url} />}
                {articles.next_page_url && <link rel="next" href={articles.next_page_url} />}
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

                {/* Blog Header */}
                <section className="px-6 py-12 lg:px-12 lg:py-16">
                    <div className="mb-2">
                        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="size-3" />
                            Back to Home
                        </Link>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Blog</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Latest articles and updates</p>
                </section>

                <div className="mx-6 h-px bg-border lg:mx-12" />

                {/* Articles Grid */}
                <section className="flex-1 px-6 py-12 lg:px-12 lg:py-16">
                    {articles.data.length === 0 ? (
                        <PublicEmptyState
                            icon={FileText}
                            title="No articles yet"
                            description="Check back soon for new content"
                        />
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {articles.data.map((article) => (
                                <ArticleCard key={article.id} article={article} />
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {articles.last_page > 1 && (
                        <div className="mt-8 flex items-center justify-center gap-3">
                            {articles.prev_page_url && (
                                <Button asChild variant="outline" size="sm">
                                    <Link href={articles.prev_page_url}>Previous</Link>
                                </Button>
                            )}
                            <span className="text-sm text-muted-foreground">
                                Page {articles.current_page} of {articles.last_page}
                            </span>
                            {articles.next_page_url && (
                                <Button asChild variant="outline" size="sm">
                                    <Link href={articles.next_page_url}>Next</Link>
                                </Button>
                            )}
                        </div>
                    )}
                </section>

                {/* Footer */}
                <footer className="border-t px-6 py-6 lg:px-12">
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

function ArticleCard({ article }: { article: Article }) {
    const featuredImage = article.media?.[0]?.original_url;
    const publishedDate = article.published_at
        ? new Date(article.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
        : null;

    return (
        <Link
            href={show.url({ article: article.slug })}
            className="group flex flex-col overflow-hidden rounded-lg border bg-card transition-colors hover:border-foreground/20 hover:bg-accent/50"
        >
            {featuredImage && (
                <div className="aspect-video overflow-hidden">
                    <img
                        src={featuredImage}
                        alt={article.title}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                </div>
            )}
            <div className="flex flex-1 flex-col p-5">
                {publishedDate && (
                    <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="size-3.5" />
                        <span>{publishedDate}</span>
                    </div>
                )}
                <h3 className="text-base font-semibold text-foreground group-hover:text-foreground/90">{article.title}</h3>
                {article.excerpt && (
                    <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{article.excerpt}</p>
                )}
                {article.author && (
                    <p className="mt-auto pt-3 text-xs text-muted-foreground">By {article.author.name}</p>
                )}
            </div>
        </Link>
    );
}
