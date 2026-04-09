<?php

namespace App\Http\Controllers;

use App\Models\LandingPageSetting;
use App\Models\Page;
use Inertia\Inertia;

class PageController extends Controller
{
    public function show(Page $page)
    {
        abort_if($page->status !== 'published', 404);

        $settings = LandingPageSetting::instance();

        return Inertia::render('page/show', [
            'page' => $page,
            'settings' => $settings,
            'logoUrl' => $settings->getFirstMediaUrl('logo') ?: null,
        ]);
    }
}
