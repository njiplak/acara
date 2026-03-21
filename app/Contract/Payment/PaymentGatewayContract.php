<?php

namespace App\Contract\Payment;

use App\Models\Order;
use App\Models\PaymentTransaction;
use App\Service\Payment\DTO\PaymentResult;
use App\Service\Payment\DTO\RefundResult;
use App\Service\Payment\DTO\TransactionStatus;
use App\Service\Payment\DTO\WebhookResult;
use Illuminate\Http\Request;

interface PaymentGatewayContract
{
    public function createCharge(Order $order, array $options = []): PaymentResult;

    public function handleWebhook(Request $request): WebhookResult;

    public function refund(PaymentTransaction $transaction, int $amount, ?string $reason = null): RefundResult;

    public function getStatus(PaymentTransaction $transaction): TransactionStatus;

    public function availableMethods(): array;

    public function verifyWebhookSignature(Request $request): bool;
}
