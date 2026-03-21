<?php

namespace App\Service\Payment\Gateway;

use App\Contract\Payment\PaymentGatewayContract;
use App\Models\Order;
use App\Models\PaymentTransaction;
use App\Service\Payment\DTO\PaymentResult;
use App\Service\Payment\DTO\RefundResult;
use App\Service\Payment\DTO\TransactionStatus;
use App\Service\Payment\DTO\WebhookResult;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Stripe\StripeClient;
use Stripe\Webhook;

class StripeGateway implements PaymentGatewayContract
{
    private StripeClient $stripe;

    // Currencies that don't use decimal subdivisions
    private const ZERO_DECIMAL_CURRENCIES = [
        'BIF', 'CLP', 'DJF', 'GNF', 'JPY', 'KMF', 'KRW', 'MGA',
        'PYG', 'RWF', 'UGX', 'VND', 'VUV', 'XAF', 'XOF', 'XPF',
        'IDR',
    ];

    public function __construct()
    {
        $this->stripe = new StripeClient(config('payment.gateways.stripe.secret_key'));
    }

    public function createCharge(Order $order, array $options = []): PaymentResult
    {
        $order->loadMissing(['event', 'customer']);

        $currency = strtolower($order->event->currency ?? 'IDR');
        $amount = $this->toSmallestUnit($order->total_amount, $currency);

        $expiryHours = config('payment.expiry_hours', 24);
        // Stripe Checkout minimum expiry is 30 min, max is 24 hours
        $expiresAt = min(max($expiryHours * 3600, 1800), 86400);

        $session = $this->stripe->checkout->sessions->create([
            'mode' => 'payment',
            'line_items' => [[
                'price_data' => [
                    'currency' => $currency,
                    'unit_amount' => $amount,
                    'product_data' => [
                        'name' => "Order {$order->order_code}",
                        'description' => $order->event->name,
                    ],
                ],
                'quantity' => 1,
            ]],
            'customer_email' => $order->customer->email,
            'success_url' => route('customer.orders.show', ['order' => $order->id]) . '?payment=success',
            'cancel_url' => route('customer.orders.show', ['order' => $order->id]) . '?payment=cancelled',
            'expires_at' => time() + $expiresAt,
            'metadata' => [
                'order_code' => $order->order_code,
                'order_id' => $order->id,
            ],
        ]);

        return new PaymentResult(
            gatewayTransactionId: $session->id,
            status: 'pending',
            redirectUrl: $session->url,
            expiresAt: CarbonImmutable::createFromTimestamp($session->expires_at),
            rawPayload: $session->toArray(),
        );
    }

    public function handleWebhook(Request $request): WebhookResult
    {
        // This method receives an already-verified payload (signature checked in controller).
        // Parse the Stripe event structure from the request data.
        $payload = $request->all();

        $eventType = $payload['type'] ?? '';
        $session = $payload['data']['object'] ?? [];

        $status = match ($eventType) {
            'checkout.session.completed' => 'paid',
            'checkout.session.expired' => 'expired',
            default => 'failed',
        };

        $currency = $session['currency'] ?? 'idr';

        return new WebhookResult(
            gatewayTransactionId: $session['id'] ?? '',
            status: $status,
            amount: isset($session['amount_total']) ? $this->fromSmallestUnit((int) $session['amount_total'], $currency) : null,
            method: 'card',
            rawPayload: $payload,
        );
    }

    public function verifyWebhookSignature(Request $request): bool
    {
        try {
            Webhook::constructEvent(
                $request->getContent(),
                $request->header('Stripe-Signature'),
                config('payment.gateways.stripe.webhook_secret'),
            );

            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    public function refund(PaymentTransaction $transaction, int $amount, ?string $reason = null): RefundResult
    {
        // Retrieve the checkout session to get the payment intent
        $session = $this->stripe->checkout->sessions->retrieve($transaction->gateway_transaction_id);

        $currency = strtolower($transaction->currency);

        $refund = $this->stripe->refunds->create([
            'payment_intent' => $session->payment_intent,
            'amount' => $this->toSmallestUnit($amount, $currency),
            'reason' => 'requested_by_customer',
        ]);

        return new RefundResult(
            gatewayRefundId: $refund->id,
            status: $refund->status === 'succeeded' ? 'completed' : 'pending',
            amount: $amount,
            rawPayload: $refund->toArray(),
        );
    }

    public function getStatus(PaymentTransaction $transaction): TransactionStatus
    {
        $session = $this->stripe->checkout->sessions->retrieve($transaction->gateway_transaction_id);

        $status = match ($session->status) {
            'complete' => $session->payment_status === 'paid' ? 'paid' : 'pending',
            'expired' => 'expired',
            'open' => 'pending',
            default => 'failed',
        };

        return new TransactionStatus(
            status: $status,
            paidAt: $status === 'paid' ? CarbonImmutable::now() : null,
            method: 'card',
            rawPayload: $session->toArray(),
        );
    }

    public function availableMethods(): array
    {
        return ['card', 'apple_pay', 'google_pay'];
    }

    private function toSmallestUnit(int $amount, string $currency): int
    {
        if (in_array(strtoupper($currency), self::ZERO_DECIMAL_CURRENCIES)) {
            return $amount;
        }

        return $amount * 100;
    }

    private function fromSmallestUnit(int $amount, string $currency): int
    {
        if (in_array(strtoupper($currency), self::ZERO_DECIMAL_CURRENCIES)) {
            return $amount;
        }

        return (int) ($amount / 100);
    }
}
