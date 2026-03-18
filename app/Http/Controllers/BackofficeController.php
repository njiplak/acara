<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Event;
use App\Models\Order;
use App\Models\Voucher;
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

        // Trend indicators — current 30 days vs previous 30 days
        $currentStart = $now->subDays(29)->startOfDay();
        $previousStart = $now->subDays(59)->startOfDay();
        $previousEnd = $now->subDays(30)->endOfDay();

        $currentRevenue = (int) Order::where('status', 'confirmed')
            ->where('confirmed_at', '>=', $currentStart)
            ->sum('total_amount');
        $previousRevenue = (int) Order::where('status', 'confirmed')
            ->whereBetween('confirmed_at', [$previousStart, $previousEnd])
            ->sum('total_amount');

        $currentOrderCount = Order::where('created_at', '>=', $currentStart)->count();
        $previousOrderCount = Order::whereBetween('created_at', [$previousStart, $previousEnd])->count();

        $currentCustomerCount = Customer::where('created_at', '>=', $currentStart)->count();
        $previousCustomerCount = Customer::whereBetween('created_at', [$previousStart, $previousEnd])->count();

        $calcTrend = fn($current, $previous) => $previous > 0
            ? round((($current - $previous) / $previous) * 100, 1)
            : ($current > 0 ? 100 : 0);

        $trends = [
            'revenue' => $calcTrend($currentRevenue, $previousRevenue),
            'orders' => $calcTrend($currentOrderCount, $previousOrderCount),
            'customers' => $calcTrend($currentCustomerCount, $previousCustomerCount),
        ];

        // Alerts — needs attention
        $draftEventsCount = Event::where('status', 'draft')->count();

        $lowFillEvents = Event::where('status', 'published')
            ->where('end_date', '>=', $now->toDateString())
            ->with('catalogs')
            ->withCount(['orders as active_orders_count' => function ($q) {
                $q->whereNotIn('status', ['cancelled', 'rejected', 'refunded']);
            }])
            ->get()
            ->map(function ($event) {
                $capacity = $event->catalogs->sum(fn($c) => $c->pivot?->max_participant ?? 0);
                if ($capacity <= 0) return null;
                $fillRate = round(($event->active_orders_count / $capacity) * 100, 1);
                if ($fillRate >= 30) return null;
                return [
                    'id' => $event->id,
                    'name' => $event->name,
                    'fillRate' => $fillRate,
                ];
            })
            ->filter()
            ->values();

        $alerts = [
            'waitingConfirmation' => $pendingReviewCount,
            'lowFillEvents' => $lowFillEvents,
            'draftEventsCount' => $draftEventsCount,
        ];

        // Top referrers
        $topReferrerData = Order::whereNotNull('referred_by')
            ->where('status', 'confirmed')
            ->select('referred_by', DB::raw('COUNT(*) as referral_count'), DB::raw('SUM(referral_discount) as total_given'))
            ->groupBy('referred_by')
            ->orderByDesc('referral_count')
            ->limit(5)
            ->get();

        $referrerIds = $topReferrerData->pluck('referred_by');
        $referrerMap = Customer::whereIn('id', $referrerIds)
            ->select('id', 'name', 'referral_code')
            ->get()
            ->keyBy('id');

        $topReferrers = $topReferrerData->map(fn($row) => [
            'referral_count' => (int) $row->referral_count,
            'total_given' => (int) $row->total_given,
            'referrer' => $referrerMap->get($row->referred_by),
        ])->filter(fn($r) => $r['referrer'] !== null)->values();

        // Voucher performance
        $voucherData = Order::whereNotNull('voucher_id')
            ->whereNotIn('status', ['cancelled', 'rejected', 'refunded'])
            ->select('voucher_id', DB::raw('COUNT(*) as uses'), DB::raw('SUM(voucher_discount) as total_discount'))
            ->groupBy('voucher_id')
            ->orderByDesc('uses')
            ->limit(5)
            ->get();

        $voucherIds = $voucherData->pluck('voucher_id');
        $voucherMap = Voucher::whereIn('id', $voucherIds)
            ->select('id', 'code', 'name')
            ->get()
            ->keyBy('id');

        $voucherPerformance = $voucherData->map(fn($row) => [
            'uses' => (int) $row->uses,
            'total_discount' => (int) $row->total_discount,
            'voucher' => $voucherMap->get($row->voucher_id),
        ])->filter(fn($v) => $v['voucher'] !== null)->values();

        // Today's birthdays
        $todayMd = $now->format('m-d');
        $birthdayCustomers = Customer::whereNotNull('date_of_birth')
            ->whereRaw("strftime('%m-%d', date_of_birth) = ?", [$todayMd])
            ->select('id', 'name', 'email', 'avatar', 'date_of_birth')
            ->get()
            ->map(function ($customer) use ($now) {
                $customer->has_birthday_voucher = Voucher::where('customer_id', $customer->id)
                    ->where('code', 'LIKE', "BDAY{$now->year}%")
                    ->exists();
                return $customer;
            });

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
            'trends' => $trends,
            'alerts' => $alerts,
            'topReferrers' => $topReferrers,
            'voucherPerformance' => $voucherPerformance,
            'revenueChart' => $revenueData,
            'statusBreakdown' => $statusBreakdown,
            'recentOrders' => $recentOrders,
            'upcomingEvents' => $upcomingEvents,
            'birthdayCustomers' => $birthdayCustomers,
        ]);
    }
}
