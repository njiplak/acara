<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Event;
use Illuminate\Http\Response;

class SeoController extends Controller
{
    public function sitemap(): Response
    {
        $articles = Article::where('is_published', true)
            ->whereNotNull('published_at')
            ->select('slug', 'updated_at')
            ->latest('published_at')
            ->get();

        $events = Event::where('status', 'published')
            ->where('end_date', '>=', now()->toDateString())
            ->select('id', 'updated_at')
            ->get();

        $xml = '<?xml version="1.0" encoding="UTF-8"?>';
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

        // Homepage
        $xml .= '<url>';
        $xml .= '<loc>' . url('/') . '</loc>';
        $xml .= '<changefreq>daily</changefreq>';
        $xml .= '<priority>1.0</priority>';
        $xml .= '</url>';

        // Blog index
        $xml .= '<url>';
        $xml .= '<loc>' . url('/blog') . '</loc>';
        $xml .= '<changefreq>daily</changefreq>';
        $xml .= '<priority>0.8</priority>';
        $xml .= '</url>';

        // Articles
        foreach ($articles as $article) {
            $xml .= '<url>';
            $xml .= '<loc>' . url("/blog/{$article->slug}") . '</loc>';
            $xml .= '<lastmod>' . $article->updated_at->toW3cString() . '</lastmod>';
            $xml .= '<changefreq>weekly</changefreq>';
            $xml .= '<priority>0.7</priority>';
            $xml .= '</url>';
        }

        // Events
        foreach ($events as $event) {
            $xml .= '<url>';
            $xml .= '<loc>' . url("/events/{$event->id}") . '</loc>';
            $xml .= '<lastmod>' . $event->updated_at->toW3cString() . '</lastmod>';
            $xml .= '<changefreq>weekly</changefreq>';
            $xml .= '<priority>0.7</priority>';
            $xml .= '</url>';
        }

        $xml .= '</urlset>';

        return response($xml, 200, [
            'Content-Type' => 'application/xml',
        ]);
    }

    public function robots(): Response
    {
        $sitemap = url('/sitemap.xml');

        $content = <<<TXT
        User-agent: *
        Allow: /
        Disallow: /backoffice
        Disallow: /customer

        Sitemap: {$sitemap}
        TXT;

        return response($content, 200, [
            'Content-Type' => 'text/plain',
        ]);
    }

    public function feed(): Response
    {
        $articles = Article::where('is_published', true)
            ->whereNotNull('published_at')
            ->with('author:id,name')
            ->latest('published_at')
            ->limit(20)
            ->get();

        $settings = \App\Models\LandingPageSetting::instance();
        $name = $settings->business_name ?: config('app.name');
        $siteUrl = url('/');
        $feedUrl = url('/feed');
        $lastBuild = $articles->first()?->published_at?->toRfc2822String() ?? now()->toRfc2822String();

        $xml = '<?xml version="1.0" encoding="UTF-8"?>';
        $xml .= '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">';
        $xml .= '<channel>';
        $xml .= "<title>{$this->escape($name)} Blog</title>";
        $xml .= "<link>{$siteUrl}</link>";
        $xml .= "<description>Latest articles from {$this->escape($name)}</description>";
        $xml .= "<lastBuildDate>{$lastBuild}</lastBuildDate>";
        $xml .= "<atom:link href=\"{$feedUrl}\" rel=\"self\" type=\"application/rss+xml\" />";

        foreach ($articles as $article) {
            $articleUrl = url("/blog/{$article->slug}");
            $xml .= '<item>';
            $xml .= "<title>{$this->escape($article->title)}</title>";
            $xml .= "<link>{$articleUrl}</link>";
            $xml .= "<guid isPermaLink=\"true\">{$articleUrl}</guid>";
            if ($article->excerpt) {
                $xml .= "<description>{$this->escape($article->excerpt)}</description>";
            }
            if ($article->author) {
                $xml .= "<author>{$this->escape($article->author->name)}</author>";
            }
            $xml .= "<pubDate>{$article->published_at->toRfc2822String()}</pubDate>";
            $xml .= '</item>';
        }

        $xml .= '</channel>';
        $xml .= '</rss>';

        return response($xml, 200, [
            'Content-Type' => 'application/rss+xml',
        ]);
    }

    private function escape(string $value): string
    {
        return htmlspecialchars($value, ENT_XML1 | ENT_QUOTES, 'UTF-8');
    }
}
