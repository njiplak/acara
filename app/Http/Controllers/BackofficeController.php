<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Event;
use App\Models\Order;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class BackofficeController extends Controller
{
    public function index()
    {
        $now = CarbonImmutable::now();

        // KPI stats
        $totalRevenue = Order::where('status', 'confirmed')->sum('total_amount');
        $totalOrders = Order::count();
        $pendingReviewCount = Order::where('status', 'waiting_confirmation')->count();
        $totalCustomers = Customer::count();
        $activeEvents = Event::where('status', 'published')
            ->where('end_date', '>=', $now->toDateString())
            ->count();

        // Revenue chart — last 30 days
        $revenueChart = Order::where('status', 'confirmed')
            ->where('confirmed_at', '>=', $now->subDays(29)->startOfDay())
            ->select(
                DB::raw("DATE(confirmed_at) as date"),
                DB::raw("SUM(total_amount) as revenue"),
                DB::raw("COUNT(*) as orders")
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        // Fill in missing days
        $revenueData = [];
        for ($i = 29; $i >= 0; $i--) {
            $date = $now->subDays($i)->format('Y-m-d');
            $row = $revenueChart->get($date);
            $revenueData[] = [
                'date' => $date,
                'revenue' => $row ? (int) $row->revenue : 0,
                'orders' => $row ? (int) $row->orders : 0,
            ];
        }

        // Order status breakdown
        $statusBreakdown = Order::select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        // Recent orders
        $recentOrders = Order::with(['customer', 'event', 'catalog'])
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        // Upcoming events with registrant counts
        $upcomingEvents = Event::where('status', 'published')
            ->where('end_date', '>=', $now->toDateString())
            ->with('catalogs')
            ->withCount(['orders as confirmed_count' => function ($q) {
                $q->where('status', 'confirmed');
            }])
            ->withCount(['orders as total_orders_count' => function ($q) {
                $q->whereNotIn('status', ['cancelled', 'rejected', 'refunded']);
            }])
            ->orderBy('start_date')
            ->limit(5)
            ->get();

        return Inertia::render('backoffice', [
            'stats' => [
                'totalRevenue' => (int) $totalRevenue,
                'totalOrders' => $totalOrders,
                'pendingReviewCount' => $pendingReviewCount,
                'totalCustomers' => $totalCustomers,
                'activeEvents' => $activeEvents,
            ],
            'revenueChart' => $revenueData,
            'statusBreakdown' => $statusBreakdown,
            'recentOrders' => $recentOrders,
            'upcomingEvents' => $upcomingEvents,
        ]);
    }
}
