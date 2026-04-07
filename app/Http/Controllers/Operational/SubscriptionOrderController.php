<?php

namespace App\Http\Controllers\Operational;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Customer\SubscriptionController;
use App\Models\SubscriptionOrder;
use App\Utils\WebResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Spatie\QueryBuilder\QueryBuilder;

class SubscriptionOrderController extends Controller
{
    public function index()
    {
        return Inertia::render('operational/subscription-order/index');
    }

    public function fetch()
    {
        $result = QueryBuilder::for(SubscriptionOrder::class)
            ->allowedFilters([])
            ->allowedSorts([])
            ->with(['customer', 'plan'])
            ->orderByDesc('id')
            ->paginate(request()->get('per_page', 10))
            ->appends(request()->query());

        $startOrderNo = ($result->currentPage() - 1) * $result->perPage() + 1;

        $items = collect($result->items())->map(function ($item, $index) use ($startOrderNo) {
            $item->order_no = $startOrderNo + $index;
            return $item;
        })->all();

        return response()->json([
            'items' => $items,
            'prev_page' => $result->currentPage() > 1 ? $result->currentPage() - 1 : null,
            'current_page' => $result->currentPage(),
            'next_page' => $result->hasMorePages() ? $result->currentPage() + 1 : null,
            'total_page' => $result->lastPage(),
            'per_page' => $result->perPage(),
        ]);
    }

    public function show($id)
    {
        $data = SubscriptionOrder::with(['customer', 'plan.features', 'confirmedByUser'])->findOrFail($id);

        return Inertia::render('operational/subscription-order/show', [
            'order' => $data,
        ]);
    }

    public function confirm($id)
    {
        $order = SubscriptionOrder::findOrFail($id);

        if ($order->status !== 'waiting_confirmation') {
            return back()->withErrors(['errors' => 'This order cannot be confirmed.']);
        }

        try {
            $order->update([
                'confirmed_at' => now(),
                'confirmed_by' => Auth::id(),
            ]);

            // Activate the subscription
            app(SubscriptionController::class)->activateSubscription($order);

            return back()->with('success', 'Subscription confirmed and activated.');
        } catch (\Exception $e) {
            return back()->withErrors(['errors' => $e->getMessage()]);
        }
    }

    public function reject(Request $request, $id)
    {
        $request->validate([
            'rejection_reason' => ['required', 'string', 'max:500'],
        ]);

        $order = SubscriptionOrder::findOrFail($id);

        if ($order->status !== 'waiting_confirmation') {
            return back()->withErrors(['errors' => 'This order cannot be rejected.']);
        }

        $order->update([
            'status' => 'rejected',
            'rejection_reason' => $request->rejection_reason,
            'confirmed_by' => Auth::id(),
        ]);

        return back()->with('success', 'Subscription order rejected.');
    }
}
