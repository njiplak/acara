<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\LandingPageSetting;
use App\Models\Order;
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
            'customerOrderCatalogIds' => $customerOrderCatalogIds,
            'customerBalance' => $customerBalance,
            'referralDiscount' => config('service-contract.referral.referee_discount', 0),
        ]);
    }
}
