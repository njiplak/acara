import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Calendar, ClipboardList, User } from 'lucide-react';
import { redirect } from '@/actions/App/Http/Controllers/Auth/CustomerAuthController';
import { index as blogIndex, show } from '@/actions/App/Http/Controllers/BlogController';
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
    const { auth } = usePage<SharedData>().props;
    const customer = auth.customer;
    const featuredImage = article.media?.[0]?.original_url;
    const publishedDate = article.published_at
        ? new Date(article.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
        : null;

    return (
        <>
            <Head>
                <title>{article.title} - {name}</title>
                {article.excerpt && <meta name="description" content={article.excerpt} />}
                {featuredImage && <meta property="og:image" content={featuredImage} />}
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
                {related.length > 0 && (
                    <>
                        <div className="mx-6 h-px bg-border lg:mx-12" />
                        <section className="px-6 py-12 lg:px-12 lg:py-16">
                            <h2 className="mb-6 text-lg font-semibold tracking-tight text-foreground">More Articles</h2>
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
                        </section>
                    </>
                )}

                {/* Footer */}
                <footer className="border-t px-6 py-6 lg:px-12">
                    <p className="text-center text-xs text-muted-foreground">
                        {settings.footer_text || `\u00A9 ${new Date().getFullYear()} ${name}. All rights reserved.`}
                    </p>
                </footer>
            </div>
        </>
    );
}
