<?php

namespace App\Http\Controllers\Customer;

use App\Contract\Operational\OrderContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\PaymentProofRequest;
use App\Http\Requests\PlaceOrderRequest;
use App\Models\EventMaterial;
use App\Models\LandingPageSetting;
use App\Models\Order;
use App\Models\Testimonial;
use App\Models\Voucher;
use App\Utils\WebResponse;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class OrderController extends Controller
{
    protected OrderContract $service;

    public function __construct(OrderContract $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        $customer = Auth::guard('customer')->user();
        $orders = Order::where('customer_id', $customer->id)
            ->with(['event', 'catalog', 'addons'])
            ->orderByDesc('created_at')
            ->get();

        $settings = LandingPageSetting::instance();

        return Inertia::render('customer/orders/index', [
            'orders' => $orders,
            'referralCode' => $customer->referral_code,
            'referralBalance' => $customer->referral_balance,
            'logoUrl' => $settings->getFirstMediaUrl('logo') ?: null,
        ]);
    }

    public function store(PlaceOrderRequest $request)
    {
        $payloads = $request->validated();
        $payloads['customer_id'] = Auth::guard('customer')->id();

        $result = $this->service->placeOrder($payloads);

        return WebResponse::response($result, ['customer.orders.show', ['order' => $result instanceof \Exception ? 0 : $result->id]]);
    }

    public function show(Order $order)
    {
        abort_if($order->customer_id !== Auth::guard('customer')->id(), 403);

        $order->load(['event', 'catalog', 'addons', 'confirmedByUser']);

        $settings = LandingPageSetting::instance();

        // Load materials for confirmed orders based on event config
        $materials = [];
        if ($order->status === 'confirmed') {
            $canViewMaterials = $order->event->material_require_checkin
                ? $order->checked_in_at !== null
                : true;

            if ($canViewMaterials) {
                $materials = EventMaterial::where('event_id', $order->event_id)
                    ->where(function ($q) use ($order) {
                        $q->whereNull('catalog_id')
                            ->orWhere('catalog_id', $order->catalog_id);
                    })
                    ->with('media')
                    ->get();
            }
        }

        $testimonial = Testimonial::where('order_id', $order->id)->first();
        $canSubmitTestimonial = $order->status === 'confirmed'
            && $order->checked_in_at !== null
            && $testimonial === null;

        return Inertia::render('customer/orders/show', [
            'order' => $order,
            'paymentInstruction' => $settings->payment_instruction,
            'materials' => $materials,
            'logoUrl' => $settings->getFirstMediaUrl('logo') ?: null,
            'testimonial' => $testimonial,
            'canSubmitTestimonial' => $canSubmitTestimonial,
        ]);
    }

    public function pay(PaymentProofRequest $request, Order $order)
    {
        abort_if($order->customer_id !== Auth::guard('customer')->id(), 403);

        $path = $request->file('payment_proof')->store('payment-proofs', 'public');

        $result = $this->service->uploadPaymentProof($order->id, $path);

        return WebResponse::response($result);
    }

    public function invoice(Order $order)
    {
        abort_if($order->customer_id !== Auth::guard('customer')->id(), 403);
        abort_if($order->status !== 'confirmed', 422, 'Invoice only available for confirmed orders.');

        $order->load(['event.venue', 'catalog', 'addons', 'customer']);
        $settings = LandingPageSetting::instance();

        $pdf = Pdf::loadView('pdf.invoice', [
            'order' => $order,
            'settings' => $settings,
        ]);

        return $pdf->download("invoice-{$order->order_code}.pdf");
    }

    public function validateVoucher()
    {
        $request = request();
        $code = strtoupper(trim($request->input('code', '')));
        $eventId = (int) $request->input('event_id');
        $catalogId = (int) $request->input('catalog_id');
        $subtotal = (int) $request->input('subtotal', 0);
        $customerId = Auth::guard('customer')->id();

        $voucher = Voucher::where('code', $code)->first();
        if (!$voucher) {
            return response()->json(['valid' => false, 'message' => 'Invalid promo code.']);
        }
        if (!$voucher->is_active) {
            return response()->json(['valid' => false, 'message' => 'This promo code is no longer active.']);
        }
        if ($voucher->valid_from && now()->lt($voucher->valid_from)) {
            return response()->json(['valid' => false, 'message' => 'This promo code is not yet valid.']);
        }
        if ($voucher->valid_until && now()->gt($voucher->valid_until)) {
            return response()->json(['valid' => false, 'message' => 'This promo code has expired.']);
        }
        if ($voucher->event_id && $voucher->event_id !== $eventId) {
            return response()->json(['valid' => false, 'message' => 'This promo code is not valid for this event.']);
        }
        if ($voucher->catalog_id && $voucher->catalog_id !== $catalogId) {
            return response()->json(['valid' => false, 'message' => 'This promo code is not valid for this session.']);
        }
        if ($voucher->max_uses) {
            $totalUsed = Order::where('voucher_id', $voucher->id)
                ->whereNotIn('status', ['cancelled', 'rejected', 'refunded'])
                ->count();
            if ($totalUsed >= $voucher->max_uses) {
                return response()->json(['valid' => false, 'message' => 'This promo code has reached its usage limit.']);
            }
        }
        if ($voucher->max_uses_per_customer) {
            $customerUsed = Order::where('voucher_id', $voucher->id)
                ->where('customer_id', $customerId)
                ->whereNotIn('status', ['cancelled', 'rejected', 'refunded'])
                ->count();
            if ($customerUsed >= $voucher->max_uses_per_customer) {
                return response()->json(['valid' => false, 'message' => 'You have already used this promo code.']);
            }
        }
        if ($voucher->min_order_amount && $subtotal < $voucher->min_order_amount) {
            return response()->json(['valid' => false, 'message' => 'Minimum order amount is Rp ' . number_format($voucher->min_order_amount, 0, ',', '.') . '.']);
        }

        if ($voucher->type === 'fixed') {
            $discount = min($voucher->value, $subtotal);
        } else {
            $calculated = (int) floor($subtotal * $voucher->value / 100);
            $discount = $voucher->max_discount ? min($calculated, $voucher->max_discount) : $calculated;
            $discount = min($discount, $subtotal);
        }

        return response()->json([
            'valid' => true,
            'discount' => $discount,
            'stackable_with_referral' => $voucher->stackable_with_referral,
            'message' => 'Promo code applied!',
        ]);
    }

    public function cancel(Order $order)
    {
        abort_if($order->customer_id !== Auth::guard('customer')->id(), 403);

        $result = $this->service->cancelOrder($order->id);

        return WebResponse::response($result);
    }
}
