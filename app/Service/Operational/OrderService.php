<?php

namespace App\Service\Operational;

use App\Contract\Operational\OrderContract;
use App\Models\Addon;
use App\Models\Catalog;
use App\Models\Customer;
use App\Models\Event;
use App\Models\Order;
use App\Models\SessionAttendance;
use App\Models\Voucher;
use App\Models\PaymentTransaction;
use App\Mail\OrderPlacedMail;
use App\Mail\OrderRejectedMail;
use App\Mail\PaymentConfirmedMail;
use App\Service\BaseService;
use App\Service\Payment\PaymentService;
use Illuminate\Support\Facades\Mail;
use App\Service\WaitlistService;
use App\Utils\PriceResolver;
use Exception;
use Illuminate\Support\Facades\DB;

class OrderService extends BaseService implements OrderContract
{
    protected array $relation = ['customer', 'event', 'catalog', 'addons', 'confirmedByUser', 'referrer', 'voucher'];

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

            // Handle voucher code
            $voucherId = null;
            $voucherDiscount = 0;
            $voucherCode = $payloads['voucher_code'] ?? null;
            if ($voucherCode) {
                $voucher = Voucher::where('code', strtoupper($voucherCode))->first();
                abort_if(!$voucher, 422, 'Invalid promo code.');
                abort_if(!$voucher->is_active, 422, 'This promo code is no longer active.');

                if ($voucher->valid_from && now()->lt($voucher->valid_from)) {
                    abort(422, 'This promo code is not yet valid.');
                }
                if ($voucher->valid_until && now()->gt($voucher->valid_until)) {
                    abort(422, 'This promo code has expired.');
                }

                if ($voucher->customer_id && $voucher->customer_id !== $payloads['customer_id']) {
                    abort(422, 'This promo code is not valid for your account.');
                }

                if ($voucher->event_id && $voucher->event_id !== $event->id) {
                    abort(422, 'This promo code is not valid for this event.');
                }
                if ($voucher->catalog_id && $voucher->catalog_id !== $catalog->id) {
                    abort(422, 'This promo code is not valid for this session.');
                }

                if ($voucher->max_uses) {
                    $totalUsed = Order::where('voucher_id', $voucher->id)
                        ->whereNotIn('status', ['cancelled', 'rejected', 'refunded'])
                        ->count();
                    abort_if($totalUsed >= $voucher->max_uses, 422, 'This promo code has reached its usage limit.');
                }

                if ($voucher->max_uses_per_customer) {
                    $customerUsed = Order::where('voucher_id', $voucher->id)
                        ->where('customer_id', $payloads['customer_id'])
                        ->whereNotIn('status', ['cancelled', 'rejected', 'refunded'])
                        ->count();
                    abort_if($customerUsed >= $voucher->max_uses_per_customer, 422, 'You have already used this promo code.');
                }

                if ($voucher->min_order_amount && $subtotal < $voucher->min_order_amount) {
                    abort(422, 'Minimum order amount for this promo code is Rp ' . number_format($voucher->min_order_amount, 0, ',', '.') . '.');
                }

                if ($voucher->type === 'fixed') {
                    $voucherDiscount = min($voucher->value, $subtotal);
                } else {
                    $calculated = (int) floor($subtotal * $voucher->value / 100);
                    $voucherDiscount = $voucher->max_discount ? min($calculated, $voucher->max_discount) : $calculated;
                    $voucherDiscount = min($voucherDiscount, $subtotal);
                }

                $voucherId = $voucher->id;

                // If not stackable, remove referral discount
                if (!$voucher->stackable_with_referral) {
                    $referralDiscount = 0;
                }
            }

            // Handle referral balance usage
            if (!empty($payloads['use_balance'])) {
                $customer = Customer::findOrFail($payloads['customer_id']);
                if ($customer->referral_balance > 0) {
                    $remaining = $subtotal - $voucherDiscount - $referralDiscount;
                    $balanceUsed = min($customer->referral_balance, $remaining);
                    $customer->decrement('referral_balance', $balanceUsed);
                }
            }

            $totalAmount = $subtotal - $voucherDiscount - $referralDiscount - $balanceUsed;

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
                'voucher_id' => $voucherId,
                'voucher_discount' => $voucherDiscount,
                'status' => 'pending_payment',
                'payment_gateway' => $event->payment_gateway,
                'notes' => $payloads['notes'] ?? null,
            ]);

            if (!empty($addonPivotData)) {
                $order->addons()->sync($addonPivotData);
            }

            DB::commit();

            Mail::to($order->customer->email)->queue(new OrderPlacedMail($order));

            $order = $order->fresh($this->relation);

            // Auto-confirm free orders (discounts made total = 0)
            if ($totalAmount <= 0) {
                return $this->confirmOrder($order->id);
            }

            // Initiate payment for non-manual gateways
            if ($event->payment_gateway !== 'manual') {
                $paymentService = app(PaymentService::class);
                $transaction = $paymentService->initiatePayment($order);

                if (!$transaction instanceof Exception) {
                    $order->setRelation('latestTransaction', $transaction);
                }
            }

            return $order;
        } catch (Exception $e) {
            DB::rollBack();
            return $e;
        }
    }

    public function placeAddonOrder(array $payloads): mixed
    {
        try {
            DB::beginTransaction();

            $addonIds = $payloads['addon_ids'];
            $addons = Addon::whereIn('id', $addonIds)
                ->where('status', 'published')
                ->where('is_standalone', true)
                ->get();

            abort_if($addons->isEmpty(), 422, 'No valid add-ons selected.');

            // Use the first addon's payment gateway
            $paymentGateway = $addons->first()->payment_gateway;

            $addonsTotal = 0;
            $addonPivotData = [];
            foreach ($addons as $addon) {
                $addonsTotal += $addon->price;
                $addonPivotData[$addon->id] = [
                    'addon_name' => $addon->name,
                    'addon_price' => $addon->price,
                ];
            }

            $subtotal = $addonsTotal;

            // Handle referral balance usage
            $balanceUsed = 0;
            if (!empty($payloads['use_balance'])) {
                $customer = Customer::findOrFail($payloads['customer_id']);
                if ($customer->referral_balance > 0) {
                    $balanceUsed = min($customer->referral_balance, $subtotal);
                    $customer->decrement('referral_balance', $balanceUsed);
                }
            }

            $totalAmount = $subtotal - $balanceUsed;

            $order = Order::create([
                'order_code' => Order::generateOrderCode(),
                'customer_id' => $payloads['customer_id'],
                'event_id' => null,
                'catalog_id' => null,
                'catalog_price' => 0,
                'addons_total' => $addonsTotal,
                'referral_discount' => 0,
                'balance_used' => $balanceUsed,
                'total_amount' => $totalAmount,
                'referred_by' => null,
                'voucher_id' => null,
                'voucher_discount' => 0,
                'status' => 'pending_payment',
                'payment_gateway' => $paymentGateway,
                'notes' => $payloads['notes'] ?? null,
            ]);

            $order->addons()->sync($addonPivotData);

            DB::commit();

            Mail::to($order->customer->email)->queue(new OrderPlacedMail($order));

            $order = $order->fresh($this->relation);

            // Auto-confirm free orders
            if ($totalAmount <= 0) {
                return $this->confirmOrder($order->id);
            }

            // Initiate payment for non-manual gateways
            if ($paymentGateway !== 'manual') {
                $paymentService = app(PaymentService::class);
                $transaction = $paymentService->initiatePayment($order);

                if (!$transaction instanceof Exception) {
                    $order->setRelation('latestTransaction', $transaction);
                }
            }

            return $order;
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

    public function confirmOrder(int $orderId, ?int $userId = null): mixed
    {
        try {
            DB::beginTransaction();

            $order = Order::findOrFail($orderId);

            abort_if(
                !in_array($order->status, ['waiting_confirmation', 'pending_payment']),
                422,
                'Order cannot be confirmed.'
            );

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

            Mail::to($order->customer->email)->queue(new PaymentConfirmedMail($order));

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

            Mail::to($order->customer->email)->queue(new OrderRejectedMail($order, $reason));

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

            // Cancel any pending payment transactions
            PaymentTransaction::where('order_id', $order->id)
                ->where('status', 'pending')
                ->update(['status' => 'cancelled']);

            // Restore customer's balance that was used
            if ($order->balance_used > 0) {
                Customer::where('id', $order->customer_id)->increment('referral_balance', $order->balance_used);
            }

            DB::commit();

            // Notify waitlisted customers (after commit so spot is actually free)
            if ($order->event_id && $order->catalog_id) {
                WaitlistService::notifyIfSpotAvailable($order->event_id, $order->catalog_id);
            }

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

            // Initiate gateway refund for non-manual orders
            if ($order->payment_gateway !== 'manual') {
                $paidTransaction = PaymentTransaction::where('order_id', $order->id)
                    ->where('status', 'paid')
                    ->first();

                if ($paidTransaction) {
                    app(PaymentService::class)->initiateRefund($paidTransaction, $order->total_amount, $reason);
                }
            }

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

            // Notify waitlisted customers (after commit so spot is actually free)
            if ($order->event_id && $order->catalog_id) {
                WaitlistService::notifyIfSpotAvailable($order->event_id, $order->catalog_id);
            }

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

            // Attendance reward: credit customer balance
            $attendanceCredit = config('service-contract.loyalty.attendance_credit', 0);
            if ($attendanceCredit > 0) {
                $customer = Customer::findOrFail($order->customer_id);
                $customer->increment('referral_balance', $attendanceCredit);
            }

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

            // Reverse attendance reward
            $attendanceCredit = config('service-contract.loyalty.attendance_credit', 0);
            if ($attendanceCredit > 0) {
                $customer = Customer::findOrFail($order->customer_id);
                $customer->decrement('referral_balance', min($attendanceCredit, $customer->referral_balance));
            }

            $order->update(['checked_in_at' => null]);

            DB::commit();

            return $order->fresh($this->relation);
        } catch (Exception $e) {
            DB::rollBack();
            return $e;
        }
    }

    public function sessionCheckIn(int $orderId, int $sessionIndex): mixed
    {
        try {
            DB::beginTransaction();

            $order = Order::findOrFail($orderId);

            abort_if($order->status !== 'confirmed', 422, 'Only confirmed orders can be checked in.');

            $exists = SessionAttendance::where('order_id', $order->id)
                ->where('session_index', $sessionIndex)
                ->exists();
            abort_if($exists, 422, 'Already checked in for this session.');

            SessionAttendance::create([
                'order_id' => $order->id,
                'session_index' => $sessionIndex,
                'checked_in_at' => now(),
            ]);

            // Auto-set order checked_in_at on first session check-in
            if ($order->checked_in_at === null) {
                $order->update(['checked_in_at' => now()]);

                $attendanceCredit = config('service-contract.loyalty.attendance_credit', 0);
                if ($attendanceCredit > 0) {
                    $customer = Customer::findOrFail($order->customer_id);
                    $customer->increment('referral_balance', $attendanceCredit);
                }
            }

            DB::commit();

            return $order->fresh([...$this->relation, 'sessionAttendances']);
        } catch (Exception $e) {
            DB::rollBack();
            return $e;
        }
    }

    public function undoSessionCheckIn(int $orderId, int $sessionIndex): mixed
    {
        try {
            DB::beginTransaction();

            $order = Order::findOrFail($orderId);

            $attendance = SessionAttendance::where('order_id', $order->id)
                ->where('session_index', $sessionIndex)
                ->first();
            abort_if(!$attendance, 422, 'Not checked in for this session.');

            $attendance->delete();

            // If no sessions left, clear order checked_in_at
            $remaining = SessionAttendance::where('order_id', $order->id)->count();
            if ($remaining === 0 && $order->checked_in_at !== null) {
                $attendanceCredit = config('service-contract.loyalty.attendance_credit', 0);
                if ($attendanceCredit > 0) {
                    $customer = Customer::findOrFail($order->customer_id);
                    $customer->decrement('referral_balance', min($attendanceCredit, $customer->referral_balance));
                }

                $order->update(['checked_in_at' => null]);
            }

            DB::commit();

            return $order->fresh([...$this->relation, 'sessionAttendances']);
        } catch (Exception $e) {
            DB::rollBack();
            return $e;
        }
    }
}
