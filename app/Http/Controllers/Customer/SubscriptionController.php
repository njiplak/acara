<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionOrder;
use App\Models\SubscriptionPlan as Plan;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SubscriptionController extends Controller
{
    public function index()
    {
        $customer = Auth::guard('customer')->user();
        $plans = Plan::where('is_active', true)
            ->with('features')
            ->orderBy('sort_order')
            ->orderBy('price')
            ->get();

        $subscription = $customer->subscription?->load('plan.features');

        $pendingOrder = SubscriptionOrder::where('customer_id', $customer->id)
            ->whereIn('status', ['pending_payment', 'waiting_confirmation'])
            ->with('plan')
            ->latest()
            ->first();

        $recentOrders = SubscriptionOrder::where('customer_id', $customer->id)
            ->with('plan')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        return Inertia::render('customer/subscription/index', [
            'plans' => $plans,
            'subscription' => $subscription,
            'pendingOrder' => $pendingOrder,
            'recentOrders' => $recentOrders,
        ]);
    }

    public function subscribe(Request $request)
    {
        $request->validate([
            'plan_id' => ['required', 'integer', 'exists:plans,id'],
        ]);

        $customer = Auth::guard('customer')->user();
        $plan = Plan::findOrFail($request->plan_id);

        if (!$plan->is_active) {
            return back()->withErrors(['errors' => 'This plan is no longer available.']);
        }

        // Check for existing pending orders
        $existingPending = SubscriptionOrder::where('customer_id', $customer->id)
            ->whereIn('status', ['pending_payment', 'waiting_confirmation'])
            ->exists();

        if ($existingPending) {
            return back()->withErrors(['errors' => 'You already have a pending subscription order. Please complete or cancel it first.']);
        }

        // Check if already subscribed to this plan
        if ($customer->subscription && $customer->subscription->plan_id === $plan->id) {
            return back()->withErrors(['errors' => 'You are already subscribed to this plan.']);
        }

        try {
            $type = 'new';
            $proRateCredit = 0;

            // If upgrading, calculate pro-rate
            if ($customer->subscription) {
                $type = 'upgrade';
                $proRateCredit = $this->calculateProRateCredit($customer);
            }

            $amount = max(0, $plan->price - $proRateCredit);

            $order = SubscriptionOrder::create([
                'order_code' => SubscriptionOrder::generateOrderCode(),
                'customer_id' => $customer->id,
                'plan_id' => $plan->id,
                'type' => $type,
                'amount' => $amount,
                'pro_rate_credit' => $proRateCredit,
                'payment_gateway' => 'manual',
                'status' => $amount <= 0 ? 'confirmed' : 'pending_payment',
            ]);

            // Auto-confirm free subscriptions (e.g., full pro-rate covers new plan)
            if ($amount <= 0) {
                $this->activateSubscription($order);
                return back()->with('success', 'Subscription activated!');
            }

            return back()->with('success', 'Subscription order created. Please upload payment proof.');
        } catch (\Exception $e) {
            return back()->withErrors(['errors' => $e->getMessage()]);
        }
    }

    public function uploadProof(Request $request, SubscriptionOrder $subscriptionOrder)
    {
        $customer = Auth::guard('customer')->user();

        if ($subscriptionOrder->customer_id !== $customer->id) {
            abort(403);
        }

        if (!in_array($subscriptionOrder->status, ['pending_payment', 'rejected'])) {
            return back()->withErrors(['errors' => 'This order cannot accept payment proof.']);
        }

        $request->validate([
            'payment_proof' => ['required', 'file', 'image', 'max:5120'],
        ]);

        $path = $request->file('payment_proof')->store('subscription-proofs', 'public');

        $subscriptionOrder->update([
            'payment_proof' => $path,
            'paid_at' => now(),
            'status' => 'waiting_confirmation',
            'rejection_reason' => null,
        ]);

        return back()->with('success', 'Payment proof uploaded. Waiting for admin confirmation.');
    }

    public function cancel(SubscriptionOrder $subscriptionOrder)
    {
        $customer = Auth::guard('customer')->user();

        if ($subscriptionOrder->customer_id !== $customer->id) {
            abort(403);
        }

        if (!in_array($subscriptionOrder->status, ['pending_payment', 'rejected'])) {
            return back()->withErrors(['errors' => 'This order cannot be cancelled.']);
        }

        $subscriptionOrder->update(['status' => 'cancelled']);

        return back()->with('success', 'Subscription order cancelled.');
    }

    public function cancelSubscription()
    {
        $customer = Auth::guard('customer')->user();
        $subscription = $customer->subscription;

        if (!$subscription) {
            return back()->withErrors(['errors' => 'You do not have an active subscription.']);
        }

        try {
            $subscription->cancel();
            return back()->with('success', 'Your subscription has been cancelled.');
        } catch (\Exception $e) {
            return back()->withErrors(['errors' => $e->getMessage()]);
        }
    }

    protected function calculateProRateCredit($customer): int
    {
        $subscription = $customer->subscription;
        if (!$subscription) return 0;

        $currentPlan = $subscription->plan;
        $now = Carbon::now();
        $expiredAt = Carbon::parse($subscription->expired_at);
        $startedAt = Carbon::parse($subscription->started_at);

        $totalDays = $startedAt->diffInDays($expiredAt);
        $remainingDays = max(0, $now->diffInDays($expiredAt, false));

        if ($totalDays <= 0 || $remainingDays <= 0) return 0;

        $dailyRate = $currentPlan->price / $totalDays;
        return (int) round($dailyRate * $remainingDays);
    }

    public function activateSubscription(SubscriptionOrder $order): void
    {
        $customer = $order->customer;
        $plan = $order->plan;

        DB::transaction(function () use ($customer, $plan, $order) {
            // If upgrading, switch plan
            if ($order->type === 'upgrade' && $customer->subscription) {
                $customer->switchTo($plan);
            } else {
                $customer->subscribeTo($plan);
            }

            $order->update([
                'status' => 'confirmed',
                'confirmed_at' => now(),
            ]);
        });
    }
}
