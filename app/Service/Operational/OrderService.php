<?php

namespace App\Service\Operational;

use App\Contract\Operational\OrderContract;
use App\Models\Addon;
use App\Models\Catalog;
use App\Models\Event;
use App\Models\Order;
use App\Service\BaseService;
use Exception;
use Illuminate\Support\Facades\DB;

class OrderService extends BaseService implements OrderContract
{
    protected array $relation = ['customer', 'event', 'catalog', 'addons', 'confirmedByUser'];

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

            // Check capacity
            $maxParticipant = $catalog->pivot->max_participant;
            if ($maxParticipant) {
                $currentCount = Order::where('event_id', $event->id)
                    ->where('catalog_id', $catalog->id)
                    ->whereNotIn('status', ['cancelled', 'rejected', 'refunded'])
                    ->count();
                abort_if($currentCount >= $maxParticipant, 422, 'This session is full.');
            }

            $catalogPrice = $catalog->price;
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

            $order = Order::create([
                'order_code' => Order::generateOrderCode(),
                'customer_id' => $payloads['customer_id'],
                'event_id' => $event->id,
                'catalog_id' => $catalog->id,
                'catalog_price' => $catalogPrice,
                'addons_total' => $addonsTotal,
                'total_amount' => $catalogPrice + $addonsTotal,
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

            DB::commit();

            return $order->fresh($this->relation);
        } catch (Exception $e) {
            DB::rollBack();
            return $e;
        }
    }
}
