<?php

namespace App\Service\Payment;

use App\Models\Order;
use App\Models\PaymentRefund;
use App\Models\PaymentTransaction;
use App\Service\Operational\OrderService;
use App\Service\Payment\DTO\TransactionStatus;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentService
{
    public function __construct(
        private PaymentGatewayManager $gatewayManager,
    ) {}

    public function initiatePayment(Order $order): PaymentTransaction|Exception
    {
        try {
            $order->loadMissing('event');
            $gateway = $this->gatewayManager->for($order->event);

            $result = $gateway->createCharge($order);

            $transaction = PaymentTransaction::create([
                'order_id' => $order->id,
                'gateway' => $order->event->payment_gateway,
                'gateway_transaction_id' => $result->gatewayTransactionId,
                'gateway_reference' => $result->paymentReference,
                'method' => $result->method,
                'currency' => $order->event->currency ?? 'IDR',
                'amount' => $order->total_amount,
                'status' => $result->status,
                'raw_payload' => $result->rawPayload,
                'expires_at' => $result->expiresAt,
                'metadata' => $result->redirectUrl ? ['redirect_url' => $result->redirectUrl] : null,
            ]);

            return $transaction;
        } catch (Exception $e) {
            Log::error('Payment initiation failed', [
                'order_id' => $order->id,
                'gateway' => $order->event->payment_gateway ?? 'unknown',
                'error' => $e->getMessage(),
            ]);

            return $e;
        }
    }

    public function initiateRefund(PaymentTransaction $transaction, int $amount, ?string $reason = null): PaymentRefund|Exception
    {
        try {
            $gateway = $this->gatewayManager->resolve($transaction->gateway);

            $result = $gateway->refund($transaction, $amount, $reason);

            $refund = PaymentRefund::create([
                'payment_transaction_id' => $transaction->id,
                'gateway_refund_id' => $result->gatewayRefundId,
                'amount' => $result->amount,
                'reason' => $reason,
                'status' => $result->status,
                'raw_payload' => $result->rawPayload,
            ]);

            // Update transaction status if fully refunded
            $totalRefunded = $transaction->refunds()->where('status', 'completed')->sum('amount') + ($result->status === 'completed' ? $result->amount : 0);
            if ($totalRefunded >= $transaction->amount) {
                $transaction->update(['status' => 'refunded']);
            } elseif ($totalRefunded > 0) {
                $transaction->update(['status' => 'partial_refund']);
            }

            return $refund;
        } catch (Exception $e) {
            Log::error('Refund initiation failed', [
                'transaction_id' => $transaction->id,
                'amount' => $amount,
                'error' => $e->getMessage(),
            ]);

            return $e;
        }
    }

    public function checkTransactionStatus(PaymentTransaction $transaction): TransactionStatus
    {
        $gateway = $this->gatewayManager->resolve($transaction->gateway);

        $status = $gateway->getStatus($transaction);

        // Update local status if changed
        if ($status->status !== $transaction->status) {
            DB::transaction(function () use ($transaction, $status) {
                $transaction->update([
                    'status' => $status->status,
                    'method' => $status->method ?? $transaction->method,
                    'paid_at' => $status->paidAt,
                    'raw_payload' => $status->rawPayload,
                ]);

                if ($status->status === 'paid') {
                    $order = $transaction->order;
                    if ($order && $order->status === 'pending_payment') {
                        app(OrderService::class)->confirmOrder($transaction->order_id);
                    }
                }
            });
        }

        return $status;
    }
}
