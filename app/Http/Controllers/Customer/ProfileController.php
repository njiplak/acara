<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\LandingPageSetting;
use App\Models\Order;
use App\Utils\WebResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function completeForm()
    {
        $customer = Auth::guard('customer')->user();

        if ($customer->isProfileComplete()) {
            return redirect()->route('customer.orders.index');
        }

        $settings = LandingPageSetting::instance();

        return Inertia::render('customer/complete-profile', [
            'logoUrl' => $settings->getFirstMediaUrl('logo') ?: null,
        ]);
    }

    public function completeStore(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:20'],
            'date_of_birth' => ['required', 'date', 'before:today'],
        ]);

        $customer = Auth::guard('customer')->user();
        $customer->update($validated);

        return Inertia::location(route('customer.orders.index'));
    }

    public function show()
    {
        $customer = Auth::guard('customer')->user();
        $settings = LandingPageSetting::instance();

        $stats = Order::where('customer_id', $customer->id)
            ->where('status', 'confirmed')
            ->select([
                DB::raw('COUNT(*) as total_orders'),
                DB::raw('COALESCE(SUM(total_amount), 0) as total_spend'),
                DB::raw('SUM(CASE WHEN checked_in_at IS NOT NULL THEN 1 ELSE 0 END) as events_attended'),
            ])
            ->first();

        $referralsCount = Order::where('referred_by', $customer->id)
            ->where('status', 'confirmed')
            ->count();

        return Inertia::render('customer/profile', [
            'stats' => [
                'total_orders' => $stats->total_orders,
                'total_spend' => $stats->total_spend,
                'events_attended' => $stats->events_attended,
                'referrals_count' => $referralsCount,
            ],
            'logoUrl' => $settings->getFirstMediaUrl('logo') ?: null,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:20'],
            'date_of_birth' => ['required', 'date', 'before:today'],
        ]);

        $customer = Auth::guard('customer')->user();
        $customer->update($validated);

        return WebResponse::response($customer);
    }
}
