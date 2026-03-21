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
use Xendit\Configuration;
use Xendit\Invoice\CreateInvoiceRequest;
use Xendit\Invoice\InvoiceApi;
use Xendit\Refund\CreateRefund;
use Xendit\Refund\RefundApi;

class XenditGateway implements PaymentGatewayContract
{
    private InvoiceApi $invoiceApi;
    private RefundApi $refundApi;

    public function __construct()
    {
        Configuration::setXenditKey(config('payment.gateways.xendit.secret_key'));
        $this->invoiceApi = new InvoiceApi();
        $this->refundApi = new RefundApi();
    }

    public function createCharge(Order $order, array $options = []): PaymentResult
    {
        $order->loadMissing(['event', 'customer']);

        $expirySeconds = config('payment.expiry_hours', 24) * 3600;
        $successUrl = route('customer.orders.show', ['order' => $order->id]);
        $failureUrl = route('customer.orders.show', ['order' => $order->id]);

        $invoiceRequest = new CreateInvoiceRequest([
            'external_id' => $order->order_code,
            'amount' => $order->total_amount,
            'description' => "Order {$order->order_code} - {$order->event->name}",
            'invoice_duration' => $expirySeconds,
            'currency' => 'IDR',
            'success_redirect_url' => $successUrl,
            'failure_redirect_url' => $failureUrl,
            'payer_email' => $order->customer->email,
            'customer' => [
                'given_names' => $order->customer->name,
                'email' => $order->customer->email,
            ],
        ]);

        $invoice = $this->invoiceApi->createInvoice($invoiceRequest);

        return new PaymentResult(
            gatewayTransactionId: $invoice['id'],
            status: 'pending',
            redirectUrl: $invoice['invoice_url'],
            paymentReference: $invoice['invoice_url'],
            expiresAt: CarbonImmutable::now()->addSeconds($expirySeconds),
            rawPayload: (array) $invoice,
        );
    }

    public function handleWebhook(Request $request): WebhookResult
    {
        // Signature already verified in controller. Just parse the payload.
        $payload = $request->all();

        $status = match (strtoupper($payload['status'] ?? '')) {
            'PAID', 'SETTLED' => 'paid',
            'EXPIRED' => 'expired',
            default => 'failed',
        };

        return new WebhookResult(
            gatewayTransactionId: $payload['id'],
            status: $status,
            amount: (int) ($payload['paid_amount'] ?? $payload['amount'] ?? 0),
            method: $payload['payment_method'] ?? $payload['payment_channel'] ?? null,
            gatewayFee: isset($payload['fees_paid_amount']) ? (int) $payload['fees_paid_amount'] : null,
            rawPayload: $payload,
        );
    }

    public function verifyWebhookSignature(Request $request): bool
    {
        $callbackToken = $request->header('x-callback-token');

        return $callbackToken === config('payment.gateways.xendit.webhook_token');
    }

    public function refund(PaymentTransaction $transaction, int $amount, ?string $reason = null): RefundResult
    {
        $createRefund = new CreateRefund([
            'invoice_id' => $transaction->gateway_transaction_id,
            'amount' => $amount,
            'currency' => $transaction->currency,
            'reason' => $reason ?? 'REQUESTED_BY_CUSTOMER',
        ]);

        $refund = $this->refundApi->createRefund(
            idempotency_key: 'refund_' . $transaction->id . '_' . time(),
            create_refund: $createRefund,
        );

        return new RefundResult(
            gatewayRefundId: $refund['id'],
            status: match ($refund['status'] ?? '') {
                'SUCCEEDED' => 'completed',
                'FAILED' => 'failed',
                default => 'pending',
            },
            amount: $amount,
            rawPayload: (array) $refund,
        );
    }

    public function getStatus(PaymentTransaction $transaction): TransactionStatus
    {
        $invoice = $this->invoiceApi->getInvoiceById($transaction->gateway_transaction_id);

        $status = match (strtoupper($invoice['status'] ?? '')) {
            'PAID', 'SETTLED' => 'paid',
            'EXPIRED' => 'expired',
            'PENDING' => 'pending',
            default => 'failed',
        };

        return new TransactionStatus(
            status: $status,
            paidAt: isset($invoice['paid_at']) ? CarbonImmutable::parse($invoice['paid_at']) : null,
            method: $invoice['payment_method'] ?? null,
            rawPayload: (array) $invoice,
        );
    }

    public function availableMethods(): array
    {
        return ['virtual_account', 'qris', 'ewallet', 'credit_card', 'retail_outlet'];
    }
}
