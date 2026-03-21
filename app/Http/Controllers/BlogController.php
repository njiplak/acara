<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\LandingPageSetting;
use Inertia\Inertia;

class BlogController extends Controller
{
    public function index()
    {
        $articles = Article::where('is_published', true)
            ->whereNotNull('published_at')
            ->with('author:id,name', 'media')
            ->latest('published_at')
            ->paginate(9);

        $settings = LandingPageSetting::instance();

        return Inertia::render('blog/index', [
            'articles' => $articles,
            'settings' => $settings,
            'logoUrl' => $settings->getFirstMediaUrl('logo') ?: null,
        ]);
    }

    public function show(Article $article)
    {
        abort_if(!$article->is_published, 404);

        $article->load('author:id,name', 'media');

        $related = Article::where('is_published', true)
            ->where('id', '!=', $article->id)
            ->whereNotNull('published_at')
            ->with('media')
            ->latest('published_at')
            ->limit(3)
            ->get();

        $settings = LandingPageSetting::instance();

        return Inertia::render('blog/show', [
            'article' => $article,
            'related' => $related,
            'settings' => $settings,
            'logoUrl' => $settings->getFirstMediaUrl('logo') ?: null,
        ]);
    }
}
