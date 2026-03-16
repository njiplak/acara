<?php

namespace App\Http\Controllers\Customer;

use App\Contract\Operational\OrderContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\PaymentProofRequest;
use App\Http\Requests\PlaceOrderRequest;
use App\Models\EventMaterial;
use App\Models\LandingPageSetting;
use App\Models\Order;
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

        return Inertia::render('customer/orders/show', [
            'order' => $order,
            'paymentInstruction' => $settings->payment_instruction,
            'materials' => $materials,
            'logoUrl' => $settings->getFirstMediaUrl('logo') ?: null,
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

    public function cancel(Order $order)
    {
        abort_if($order->customer_id !== Auth::guard('customer')->id(), 403);

        $result = $this->service->cancelOrder($order->id);

        return WebResponse::response($result);
    }
}
