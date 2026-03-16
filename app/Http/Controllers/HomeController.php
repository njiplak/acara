<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\LandingPageSetting;
use App\Models\Order;
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

        return Inertia::render('home', [
            'settings' => $settings,
            'logoUrl' => $settings->getFirstMediaUrl('logo') ?: null,
            'events' => $events,
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

        // Check customer's existing orders for this event
        $customerOrderCatalogIds = [];
        $customerBalance = 0;
        if (Auth::guard('customer')->check()) {
            $customer = Auth::guard('customer')->user();
            $customerOrderCatalogIds = Order::where('event_id', $event->id)
                ->where('customer_id', $customer->id)
                ->whereNotIn('status', ['cancelled', 'rejected'])
                ->pluck('catalog_id')
                ->toArray();
            $customerBalance = $customer->referral_balance;
        }

        $settings = LandingPageSetting::instance();

        return Inertia::render('events/show', [
            'settings' => $settings,
            'logoUrl' => $settings->getFirstMediaUrl('logo') ?: null,
            'event' => $event,
            'orderCounts' => $orderCounts,
            'pricingData' => $pricingData,
            'customerOrderCatalogIds' => $customerOrderCatalogIds,
            'customerBalance' => $customerBalance,
            'referralDiscount' => config('service-contract.referral.referee_discount', 0),
        ]);
    }
}
