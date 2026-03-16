<?php

namespace App\Service\Operational;

use App\Contract\Operational\OrderContract;
use App\Models\Addon;
use App\Models\Catalog;
use App\Models\Customer;
use App\Models\Event;
use App\Models\Order;
use App\Service\BaseService;
use App\Utils\PriceResolver;
use Exception;
use Illuminate\Support\Facades\DB;

class OrderService extends BaseService implements OrderContract
{
    protected array $relation = ['customer', 'event', 'catalog', 'addons', 'confirmedByUser', 'referrer'];

    public function __construct(Order $model)
    {
        parent::__construct($model);
    }

    public function placeOrder(array $payloads): mixed
    {
        try {
            DB::beginTransaction();

            $event = Event::with('catalogs')->findOrFail($payloads['event_id']);

            abort_if($event->status !== 'published', 422, 'Event is not available.');
            abort_if($event->end_date < now()->toDateString(), 422, 'Event has ended.');

            $catalog = $event->catalogs->firstWhere('id', $payloads['catalog_id']);
            abort_if(!$catalog, 422, 'Session is not available for this event.');

            // Check duplicate
            $exists = Order::where('customer_id', $payloads['customer_id'])
                ->where('event_id', $payloads['event_id'])
                ->where('catalog_id', $payloads['catalog_id'])
                ->whereNotIn('status', ['cancelled', 'rejected', 'refunded'])
                ->exists();
            abort_if($exists, 422, 'You have already registered for this session.');

            // Count active orders (needed for capacity check AND price resolution)
            $currentCount = Order::where('event_id', $event->id)
                ->where('catalog_id', $catalog->id)
                ->whereNotIn('status', ['cancelled', 'rejected', 'refunded'])
                ->count();

            // Check capacity
            $maxParticipant = $catalog->pivot->max_participant;
            if ($maxParticipant) {
                abort_if($currentCount >= $maxParticipant, 422, 'This session is full.');
            }

            // Resolve price from pricing tiers
            $resolved = PriceResolver::resolve(
                pricingType: $catalog->pivot->pricing_type ?? 'fixed',
                pricingTiers: $catalog->pivot->pricing_tiers,
                catalogPrice: $catalog->price,
                currentOrders: $currentCount,
            );
            $catalogPrice = $resolved['active_price'];
            $addonIds = $payloads['addon_ids'] ?? [];
            $addonsTotal = 0;
            $addonPivotData = [];

            if (!empty($addonIds)) {
                $addons = Addon::whereIn('id', $addonIds)->get();
                foreach ($addons as $addon) {
                    $addonsTotal += $addon->price;
                    $addonPivotData[$addon->id] = [
                        'addon_name' => $addon->name,
                        'addon_price' => $addon->price,
                    ];
                }
            }

            $subtotal = $catalogPrice + $addonsTotal;
            $referralDiscount = 0;
            $referredBy = null;
            $balanceUsed = 0;

            // Handle referral code
            $referralCode = $payloads['referral_code'] ?? null;
            if ($referralCode) {
                $referrer = Customer::where('referral_code', $referralCode)->first();
                abort_if(!$referrer, 422, 'Invalid referral code.');
                abort_if($referrer->id === $payloads['customer_id'], 422, 'You cannot use your own referral code.');

                $referredBy = $referrer->id;
                $referralDiscount = min(config('service-contract.referral.referee_discount', 0), $subtotal);
            }

            // Handle referral balance usage
            if (!empty($payloads['use_balance'])) {
                $customer = Customer::findOrFail($payloads['customer_id']);
                if ($customer->referral_balance > 0) {
                    $remaining = $subtotal - $referralDiscount;
                    $balanceUsed = min($customer->referral_balance, $remaining);
                    $customer->decrement('referral_balance', $balanceUsed);
                }
            }

            $totalAmount = $subtotal - $referralDiscount - $balanceUsed;

            $order = Order::create([
                'order_code' => Order::generateOrderCode(),
                'customer_id' => $payloads['customer_id'],
                'event_id' => $event->id,
                'catalog_id' => $catalog->id,
                'catalog_price' => $catalogPrice,
                'addons_total' => $addonsTotal,
                'referral_discount' => $referralDiscount,
                'balance_used' => $balanceUsed,
                'total_amount' => $totalAmount,
                'referred_by' => $referredBy,
                'status' => 'pending_payment',
                'notes' => $payloads['notes'] ?? null,
            ]);

            if (!empty($addonPivotData)) {
                $order->addons()->sync($addonPivotData);
            }

            DB::commit();

            return $order->fresh($this->relation);
        } catch (Exception $e) {
            DB::rollBack();
            return $e;
        }
    }

    public function uploadPaymentProof(int $orderId, string $proofPath): mixed
    {
        try {
            DB::beginTransaction();

            $order = Order::findOrFail($orderId);

            abort_if(
                !in_array($order->status, ['pending_payment', 'rejected']),
                422,
                'Payment proof cannot be uploaded for this order.'
            );

            $order->update([
                'payment_proof' => $proofPath,
                'paid_at' => now(),
                'status' => 'waiting_confirmation',
                'rejection_reason' => null,
            ]);

            DB::commit();

            return $order->fresh($this->relation);
        } catch (Exception $e) {
            DB::rollBack();
            return $e;
        }
    }

    public function confirmOrder(int $orderId, int $userId): mixed
    {
        try {
            DB::beginTransaction();

            $order = Order::findOrFail($orderId);

            abort_if($order->status !== 'waiting_confirmation', 422, 'Order cannot be confirmed.');

            $order->update([
                'status' => 'confirmed',
                'confirmed_at' => now(),
                'confirmed_by' => $userId,
            ]);

            // Credit referrer's balance
            if ($order->referred_by) {
                $referrerCredit = config('service-contract.referral.referrer_credit', 0);
                if ($referrerCredit > 0) {
                    Customer::where('id', $order->referred_by)->increment('referral_balance', $referrerCredit);
                }
            }

            DB::commit();

            return $order->fresh($this->relation);
        } catch (Exception $e) {
            DB::rollBack();
            return $e;
        }
    }

    public function rejectOrder(int $orderId, int $userId, string $reason): mixed
    {
        try {
            DB::beginTransaction();

            $order = Order::findOrFail($orderId);

            abort_if($order->status !== 'waiting_confirmation', 422, 'Order cannot be rejected.');

            $order->update([
                'status' => 'rejected',
                'rejection_reason' => $reason,
                'confirmed_by' => $userId,
            ]);

            DB::commit();

            return $order->fresh($this->relation);
        } catch (Exception $e) {
            DB::rollBack();
            return $e;
        }
    }

    public function cancelOrder(int $orderId): mixed
    {
        try {
            DB::beginTransaction();

            $order = Order::findOrFail($orderId);

            abort_if(
                in_array($order->status, ['confirmed', 'cancelled']),
                422,
                'Order cannot be cancelled.'
            );

            $order->update([
                'status' => 'cancelled',
            ]);

            // Restore customer's balance that was used
            if ($order->balance_used > 0) {
                Customer::where('id', $order->customer_id)->increment('referral_balance', $order->balance_used);
            }

            DB::commit();

            return $order->fresh($this->relation);
        } catch (Exception $e) {
            DB::rollBack();
            return $e;
        }
    }

    public function refundOrder(int $orderId, int $userId, string $reason): mixed
    {
        try {
            DB::beginTransaction();

            $order = Order::findOrFail($orderId);

            abort_if($order->status !== 'confirmed', 422, 'Only confirmed orders can be refunded.');

            $order->update([
                'status' => 'refunded',
                'refunded_at' => now(),
                'refund_reason' => $reason,
                'confirmed_by' => $userId,
            ]);

            // Reverse referrer credit
            if ($order->referred_by) {
                $referrerCredit = config('service-contract.referral.referrer_credit', 0);
                if ($referrerCredit > 0) {
                    $referrer = Customer::find($order->referred_by);
                    if ($referrer) {
                        $deduct = min($referrerCredit, $referrer->referral_balance);
                        if ($deduct > 0) {
                            $referrer->decrement('referral_balance', $deduct);
                        }
                    }
                }
            }

            // Restore customer's balance that was used
            if ($order->balance_used > 0) {
                Customer::where('id', $order->customer_id)->increment('referral_balance', $order->balance_used);
            }

            DB::commit();

            return $order->fresh($this->relation);
        } catch (Exception $e) {
            DB::rollBack();
            return $e;
        }
    }

    public function checkIn(int $orderId): mixed
    {
        try {
            DB::beginTransaction();

            $order = Order::findOrFail($orderId);

            abort_if($order->status !== 'confirmed', 422, 'Only confirmed orders can be checked in.');
            abort_if($order->checked_in_at !== null, 422, 'Order is already checked in.');

            $order->update(['checked_in_at' => now()]);

            DB::commit();

            return $order->fresh($this->relation);
        } catch (Exception $e) {
            DB::rollBack();
            return $e;
        }
    }

    public function undoCheckIn(int $orderId): mixed
    {
        try {
            DB::beginTransaction();

            $order = Order::findOrFail($orderId);

            abort_if($order->checked_in_at === null, 422, 'Order is not checked in.');

            $order->update(['checked_in_at' => null]);

            DB::commit();

            return $order->fresh($this->relation);
        } catch (Exception $e) {
            DB::rollBack();
            return $e;
        }
    }
}
