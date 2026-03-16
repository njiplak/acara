<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Order;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CalendarController extends Controller
{
    public function index()
    {
        return Inertia::render('calendar');
    }

    public function fetch(Request $request)
    {
        $request->validate([
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2000|max:2100',
        ]);

        $date = CarbonImmutable::create($request->year, $request->month, 1);
        $startOfMonth = $date->startOfMonth()->toDateString();
        $endOfMonth = $date->endOfMonth()->toDateString();

        $events = Event::where('start_date', '<=', $endOfMonth)
            ->where('end_date', '>=', $startOfMonth)
            ->with('catalogs')
            ->withCount(['orders as active_orders_count' => function ($q) {
                $q->whereNotIn('status', ['cancelled', 'rejected', 'refunded']);
            }])
            ->select('id', 'name', 'start_date', 'end_date', 'status')
            ->orderBy('start_date')
            ->get()
            ->map(function ($event) {
                $totalCapacity = $event->catalogs->sum(fn($c) => $c->pivot?->max_participant ?? 0);
                $fillRate = $totalCapacity > 0
                    ? round(($event->active_orders_count / $totalCapacity) * 100, 1)
                    : null;

                return [
                    'id' => $event->id,
                    'name' => $event->name,
                    'start_date' => $event->start_date,
                    'end_date' => $event->end_date,
                    'status' => $event->status,
                    'fill_rate' => $fillRate,
                    'total_capacity' => $totalCapacity,
                    'total_registrations' => $event->active_orders_count,
                    'is_sold_out' => $totalCapacity > 0 && $event->active_orders_count >= $totalCapacity,
                ];
            });

        return response()->json($events);
    }
}
