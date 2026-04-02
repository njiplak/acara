<?php

namespace App\Http\Controllers;

use App\Models\Addon;
use App\Models\Article;
use App\Models\Event;
use App\Models\Faq;
use App\Models\LandingPageSetting;
use App\Models\Order;
use App\Models\Testimonial;
use App\Models\Waitlist;
use App\Utils\PriceResolver;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        $events = Event::query()
            ->where('status', 'published')
            ->where('end_date', '>=', now()->toDateString())
            ->with('catalogs')
            ->orderBy('start_date')
            ->get();

        // Batch load order counts for all events
        $allOrderCounts = Order::whereIn('event_id', $events->pluck('id'))
            ->whereNotIn('status', ['cancelled', 'rejected'])
            ->selectRaw('event_id, catalog_id, count(*) as count')
            ->groupBy('event_id', 'catalog_id')
            ->get()
            ->groupBy('event_id');

        // Compute lowest active price per event
        $events->each(function ($event) use ($allOrderCounts) {
            $eventOrderCounts = $allOrderCounts->get($event->id, collect());
            $lowestPrice = null;

            foreach ($event->catalogs as $catalog) {
                $currentOrders = $eventOrderCounts->firstWhere('catalog_id', $catalog->id)?->count ?? 0;
                $resolved = PriceResolver::resolve(
                    pricingType: $catalog->pivot->pricing_type ?? 'fixed',
                    pricingTiers: $catalog->pivot->pricing_tiers,
                    catalogPrice: $catalog->price,
                    currentOrders: $currentOrders,
                );

                if ($lowestPrice === null || $resolved['active_price'] < $lowestPrice) {
                    $lowestPrice = $resolved['active_price'];
                }
            }

            $event->lowest_active_price = $lowestPrice;
        });

        $settings = LandingPageSetting::instance();

        $testimonials = Testimonial::where('is_highlighted', true)
            ->whereNotNull('body')
            ->with('customer:id,name,avatar', 'event:id,name')
            ->latest()
            ->limit(6)
            ->get();

        $faqs = Faq::where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        $articles = Article::where('is_published', true)
            ->whereNotNull('published_at')
            ->with('author:id,name', 'media')
            ->latest('published_at')
            ->limit(3)
            ->get();

        return Inertia::render('home', [
            'settings' => $settings,
            'logoUrl' => $settings->getFirstMediaUrl('logo') ?: null,
            'events' => $events,
            'testimonials' => $testimonials,
            'faqs' => $faqs,
            'articles' => $articles,
        ]);
    }

    public function showEvent(Event $event)
    {
        abort_if($event->status !== 'published', 404);

        $event->load(['catalogs.addons', 'catalogs.speakers.media', 'venue']);

        // Count active orders per catalog for capacity display
        $orderCounts = Order::where('event_id', $event->id)
            ->whereNotIn('status', ['cancelled', 'rejected'])
            ->selectRaw('catalog_id, count(*) as count')
            ->groupBy('catalog_id')
            ->pluck('count', 'catalog_id');

        // Resolve pricing per catalog
        $pricingData = [];
        foreach ($event->catalogs as $catalog) {
            $currentOrders = $orderCounts[$catalog->id] ?? 0;
            $pricingData[$catalog->id] = PriceResolver::resolve(
                pricingType: $catalog->pivot->pricing_type ?? 'fixed',
                pricingTiers: $catalog->pivot->pricing_tiers,
                catalogPrice: $catalog->price,
                currentOrders: $currentOrders,
            );
        }

        // Check customer's existing orders and waitlist for this event
        $customerOrderCatalogIds = [];
        $customerWaitlistCatalogIds = [];
        $customerBalance = 0;
        if (Auth::guard('customer')->check()) {
            $customer = Auth::guard('customer')->user();
            $customerOrderCatalogIds = Order::where('event_id', $event->id)
                ->where('customer_id', $customer->id)
                ->whereNotIn('status', ['cancelled', 'rejected'])
                ->pluck('catalog_id')
                ->toArray();
            $customerWaitlistCatalogIds = Waitlist::where('event_id', $event->id)
                ->where('customer_id', $customer->id)
                ->pluck('catalog_id')
                ->toArray();
            $customerBalance = $customer->referral_balance;
        }

        // Waitlist counts per catalog
        $waitlistCounts = Waitlist::where('event_id', $event->id)
            ->selectRaw('catalog_id, count(*) as count')
            ->groupBy('catalog_id')
            ->pluck('count', 'catalog_id');

        $settings = LandingPageSetting::instance();

        $testimonials = Testimonial::where('is_highlighted', true)
            ->where('event_id', $event->id)
            ->whereNotNull('body')
            ->with('customer:id,name,avatar', 'catalog:id,name')
            ->latest()
            ->limit(6)
            ->get();

        $prefillReferralCode = request()->query('ref', '');

        return Inertia::render('events/show', [
            'settings' => $settings,
            'logoUrl' => $settings->getFirstMediaUrl('logo') ?: null,
            'event' => $event,
            'orderCounts' => $orderCounts,
            'pricingData' => $pricingData,
            'customerOrderCatalogIds' => $customerOrderCatalogIds,
            'customerWaitlistCatalogIds' => $customerWaitlistCatalogIds,
            'waitlistCounts' => $waitlistCounts,
            'customerBalance' => $customerBalance,
            'referralDiscount' => config('service-contract.referral.referee_discount', 0),
            'testimonials' => $testimonials,
            'prefillReferralCode' => $prefillReferralCode,
        ]);
    }

    public function showAddons()
    {
        $addons = Addon::publishedStandalone()
            ->orderBy('name')
            ->get();

        $settings = LandingPageSetting::instance();

        $customerBalance = 0;
        if (Auth::guard('customer')->check()) {
            $customerBalance = Auth::guard('customer')->user()->referral_balance;
        }

        return Inertia::render('addons/index', [
            'settings' => $settings,
            'logoUrl' => $settings->getFirstMediaUrl('logo') ?: null,
            'addons' => $addons,
            'customerBalance' => $customerBalance,
        ]);
    }
}
