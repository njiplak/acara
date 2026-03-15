<?php

namespace App\Http\Controllers\Customer;

use App\Contract\Operational\OrderContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\PaymentProofRequest;
use App\Http\Requests\PlaceOrderRequest;
use App\Models\LandingPageSetting;
use App\Models\Order;
use App\Utils\WebResponse;
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
        $orders = Order::where('customer_id', Auth::guard('customer')->id())
            ->with(['event', 'catalog', 'addons'])
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('customer/orders/index', [
            'orders' => $orders,
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

        return Inertia::render('customer/orders/show', [
            'order' => $order,
            'paymentInstruction' => $settings->payment_instruction,
        ]);
    }

    public function pay(PaymentProofRequest $request, Order $order)
    {
        abort_if($order->customer_id !== Auth::guard('customer')->id(), 403);

        $path = $request->file('payment_proof')->store('payment-proofs', 'public');

        $result = $this->service->uploadPaymentProof($order->id, $path);

        return WebResponse::response($result);
    }

    public function cancel(Order $order)
    {
        abort_if($order->customer_id !== Auth::guard('customer')->id(), 403);

        $result = $this->service->cancelOrder($order->id);

        return WebResponse::response($result);
    }
}
