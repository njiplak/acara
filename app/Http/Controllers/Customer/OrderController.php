<?php

namespace App\Http\Controllers\Customer;

use App\Contract\Operational\OrderContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\PaymentProofRequest;
use App\Http\Requests\PlaceAddonOrderRequest;
use App\Http\Requests\PlaceOrderRequest;
use App\Models\EventMaterial;
use App\Models\LandingPageSetting;
use App\Models\Order;
use App\Models\Testimonial;
use App\Models\Voucher;
use App\Models\Waitlist;
use App\Service\CertificateService;
use App\Service\Payment\PaymentService;
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

        // Check for active birthday voucher
        $birthdayVoucher = Voucher::where('customer_id', $customer->id)
            ->where('is_active', true)
            ->where('valid_until', '>=', now())
            ->where('code', 'LIKE', 'BDAY%')
            ->where(function ($q) {
                $q->whereNull('max_uses')
                    ->orWhereRaw('(SELECT COUNT(*) FROM orders WHERE orders.voucher_id = vouchers.id AND orders.status NOT IN (\'cancelled\', \'rejected\', \'refunded\')) < vouchers.max_uses');
            })
            ->first();

        return Inertia::render('customer/orders/index', [
            'orders' => $orders,
            'referralCode' => $customer->referral_code,
            'referralBalance' => $customer->referral_balance,
            'logoUrl' => $settings->getFirstMediaUrl('logo') ?: null,
            'birthdayVoucher' => $birthdayVoucher ? [
                'code' => $birthdayVoucher->code,
                'value' => $birthdayVoucher->value,
                'valid_until' => $birthdayVoucher->valid_until->toDateString(),
            ] : null,
        ]);
    }

    public function store(PlaceOrderRequest $request)
    {
        $payloads = $request->validated();
        $payloads['customer_id'] = Auth::guard('customer')->id();

        $result = $this->service->placeOrder($payloads);

        if ($result instanceof \Exception) {
            return WebResponse::response($result);
        }

        // For gateway orders with a redirect URL, redirect to gateway checkout
        $transaction = $result->latestTransaction;
        if ($transaction && $transaction->gateway !== 'manual') {
            $redirectUrl = $transaction->metadata['redirect_url'] ?? null;
            if ($redirectUrl) {
                return Inertia::location($redirectUrl);
            }
        }

        return WebResponse::response($result, ['customer.orders.show', ['order' => $result->id]]);
    }

    public function storeAddon(PlaceAddonOrderRequest $request)
    {
        $payloads = $request->validated();
        $payloads['customer_id'] = Auth::guard('customer')->id();

        $result = $this->service->placeAddonOrder($payloads);

        if ($result instanceof \Exception) {
            return WebResponse::response($result);
        }

        // For gateway orders with a redirect URL, redirect to gateway checkout
        $transaction = $result->latestTransaction;
        if ($transaction && $transaction->gateway !== 'manual') {
            $redirectUrl = $transaction->metadata['redirect_url'] ?? null;
            if ($redirectUrl) {
                return Inertia::location($redirectUrl);
            }
        }

        return WebResponse::response($result, ['customer.orders.show', ['order' => $result->id]]);
    }

    public function show(Order $order)
    {
        abort_if($order->customer_id !== Auth::guard('customer')->id(), 403);

        $order->load(['event', 'catalog', 'addons', 'confirmedByUser']);

        $settings = LandingPageSetting::instance();

        // Load materials for confirmed orders based on event config
        $materials = [];
        if ($order->status === 'confirmed' && $order->event_id) {
            $canViewMaterials = $order->event->material_require_checkin
                ? $order->checked_in_at !== null
                : true;

            if ($canViewMaterials) {
                $materials = EventMaterial::where('event_id', $order->event_id)
                    ->where(function ($q) use ($order) {
                        $q->whereNull('catalog_id')
                            ->orWhere('catalog_id', $order->catalog_id);
                    })
                    ->where(function ($q) {
                        $q->whereNull('available_from')
                            ->orWhere('available_from', '<=', now());
                    })
                    ->where(function ($q) {
                        $q->whereNull('available_until')
                            ->orWhere('available_until', '>=', now());
                    })
                    ->with('media')
                    ->get();
            }
        }

        $testimonial = Testimonial::where('order_id', $order->id)->first();
        $canSubmitTestimonial = $order->status === 'confirmed'
            && $order->event_id !== null
            && $order->checked_in_at !== null
            && $testimonial === null;

        $order->load('latestTransaction');

        return Inertia::render('customer/orders/show', [
            'order' => $order,
            'paymentInstruction' => $settings->payment_instruction,
            'materials' => $materials,
            'logoUrl' => $settings->getFirstMediaUrl('logo') ?: null,
            'testimonial' => $testimonial,
            'canSubmitTestimonial' => $canSubmitTestimonial,
        ]);
    }

    public function redirectToPayment(Order $order)
    {
        abort_if($order->customer_id !== Auth::guard('customer')->id(), 403);
        abort_if($order->payment_gateway === 'manual', 422, 'Manual payment does not support online checkout.');
        abort_if($order->status !== 'pending_payment', 422, 'Order is not awaiting payment.');

        // Check for existing pending transaction with a valid redirect URL
        $existingTransaction = $order->paymentTransactions()
            ->where('status', 'pending')
            ->where(function ($q) {
                $q->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->latest()
            ->first();

        if ($existingTransaction) {
            $redirectUrl = $existingTransaction->metadata['redirect_url'] ?? null;
            if ($redirectUrl) {
                return Inertia::location($redirectUrl);
            }
        }

        // No valid transaction — create a new charge
        $paymentService = app(PaymentService::class);
        $transaction = $paymentService->initiatePayment($order);

        if ($transaction instanceof \Exception) {
            return back()->with('error', 'Failed to initiate payment. Please try again.');
        }

        $redirectUrl = $transaction->metadata['redirect_url'] ?? null;
        if ($redirectUrl) {
            return Inertia::location($redirectUrl);
        }

        return redirect()->route('customer.orders.show', $order);
    }

    public function pay(PaymentProofRequest $request, Order $order)
    {
        abort_if($order->customer_id !== Auth::guard('customer')->id(), 403);
        abort_if($order->payment_gateway !== 'manual', 422, 'Payment proof upload is only for manual payments.');

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

    public function certificate(Order $order)
    {
        abort_if($order->customer_id !== Auth::guard('customer')->id(), 403);
        abort_if($order->status !== 'confirmed', 422, 'Certificate only available for confirmed orders.');
        abort_if($order->checked_in_at === null, 422, 'Certificate only available after check-in.');

        $pdfPath = CertificateService::generate($order);

        return response()->download($pdfPath, "certificate-{$order->order_code}.pdf")
            ->deleteFileAfterSend(true);
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
        if ($voucher->customer_id && $voucher->customer_id !== $customerId) {
            return response()->json(['valid' => false, 'message' => 'This promo code is not valid for your account.']);
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

    public function joinWaitlist()
    {
        $request = request();
        $request->validate([
            'event_id' => ['required', 'integer', 'exists:events,id'],
            'catalog_id' => ['required', 'integer', 'exists:catalogs,id'],
        ]);

        $customerId = Auth::guard('customer')->id();
        $eventId = (int) $request->input('event_id');
        $catalogId = (int) $request->input('catalog_id');

        $exists = Waitlist::where('customer_id', $customerId)
            ->where('event_id', $eventId)
            ->where('catalog_id', $catalogId)
            ->exists();

        if ($exists) {
            return response()->json(['success' => false, 'message' => 'You are already on the waitlist.'], 422);
        }

        $maxPosition = Waitlist::where('event_id', $eventId)
            ->where('catalog_id', $catalogId)
            ->max('position') ?? 0;

        Waitlist::create([
            'customer_id' => $customerId,
            'event_id' => $eventId,
            'catalog_id' => $catalogId,
            'position' => $maxPosition + 1,
        ]);

        return response()->json(['success' => true, 'message' => 'You have been added to the waitlist!']);
    }

    public function leaveWaitlist()
    {
        $request = request();
        $request->validate([
            'event_id' => ['required', 'integer'],
            'catalog_id' => ['required', 'integer'],
        ]);

        $customerId = Auth::guard('customer')->id();

        Waitlist::where('customer_id', $customerId)
            ->where('event_id', $request->input('event_id'))
            ->where('catalog_id', $request->input('catalog_id'))
            ->delete();

        return response()->json(['success' => true, 'message' => 'You have been removed from the waitlist.']);
    }
}
