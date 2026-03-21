<?php

namespace App\Service\Payment\Gateway;

use App\Contract\Payment\PaymentGatewayContract;
use App\Models\Order;
use App\Models\PaymentRefund;
use App\Models\PaymentTransaction;
use App\Service\Payment\DTO\PaymentResult;
use App\Service\Payment\DTO\RefundResult;
use App\Service\Payment\DTO\TransactionStatus;
use App\Service\Payment\DTO\WebhookResult;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;

class ManualGateway implements PaymentGatewayContract
{
    public function createCharge(Order $order, array $options = []): PaymentResult
    {
        return new PaymentResult(
            gatewayTransactionId: 'manual_' . $order->order_code,
            status: 'pending',
            method: 'bank_transfer',
        );
    }

    public function handleWebhook(Request $request): WebhookResult
    {
        throw new \BadMethodCallException('Manual gateway does not support webhooks.');
    }

    public function refund(PaymentTransaction $transaction, int $amount, ?string $reason = null): RefundResult
    {
        $refund = PaymentRefund::create([
            'payment_transaction_id' => $transaction->id,
            'gateway_refund_id' => 'manual_refund_' . $transaction->id . '_' . time(),
            'amount' => $amount,
            'reason' => $reason,
            'status' => 'completed',
        ]);

        return new RefundResult(
            gatewayRefundId: $refund->gateway_refund_id,
            status: 'completed',
            amount: $amount,
        );
    }

    public function getStatus(PaymentTransaction $transaction): TransactionStatus
    {
        return new TransactionStatus(
            status: $transaction->status,
            paidAt: $transaction->paid_at ? CarbonImmutable::instance($transaction->paid_at) : null,
            method: $transaction->method,
        );
    }

    public function availableMethods(): array
    {
        return ['bank_transfer'];
    }

    public function verifyWebhookSignature(Request $request): bool
    {
        return true;
    }
}
