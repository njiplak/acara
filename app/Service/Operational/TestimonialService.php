<?php

namespace App\Service\Operational;

use App\Contract\Operational\TestimonialContract;
use App\Models\Order;
use App\Models\Testimonial;
use App\Service\BaseService;
use Exception;
use Illuminate\Support\Facades\DB;

class TestimonialService extends BaseService implements TestimonialContract
{
    protected array $relation = ['customer', 'event', 'catalog', 'order'];

    public function __construct(Testimonial $model)
    {
        parent::__construct($model);
    }

    public function submitTestimonial(array $payloads): mixed
    {
        try {
            DB::beginTransaction();

            $order = Order::findOrFail($payloads['order_id']);

            abort_if($order->customer_id !== $payloads['customer_id'], 403, 'Unauthorized.');
            abort_if($order->status !== 'confirmed', 422, 'Order is not confirmed.');
            abort_if($order->checked_in_at === null, 422, 'You must attend the session before leaving feedback.');

            $exists = Testimonial::where('order_id', $order->id)->exists();
            abort_if($exists, 422, 'You have already submitted feedback for this order.');

            $testimonial = Testimonial::create([
                'order_id' => $order->id,
                'customer_id' => $order->customer_id,
                'event_id' => $order->event_id,
                'catalog_id' => $order->catalog_id,
                'rating' => $payloads['rating'],
                'body' => $payloads['body'] ?? null,
            ]);

            DB::commit();

            return $testimonial->fresh($this->relation);
        } catch (Exception $e) {
            DB::rollBack();
            return $e;
        }
    }

    public function toggleHighlight(int $id): mixed
    {
        try {
            DB::beginTransaction();

            $testimonial = Testimonial::findOrFail($id);
            $testimonial->update([
                'is_highlighted' => !$testimonial->is_highlighted,
            ]);

            DB::commit();

            return $testimonial->fresh($this->relation);
        } catch (Exception $e) {
            DB::rollBack();
            return $e;
        }
    }
}
