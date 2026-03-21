<?php

namespace App\Http\Controllers\Webhook;

use App\Http\Controllers\Controller;
use App\Models\PaymentTransaction;
use App\Service\Operational\OrderService;
use App\Service\Payment\PaymentGatewayManager;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentWebhookController extends Controller
{
    public function __construct(
        private PaymentGatewayManager $gatewayManager,
    ) {}

    public function xendit(Request $request): Response
    {
        return $this->handle('xendit', $request);
    }

    public function stripe(Request $request): Response
    {
        return $this->handle('stripe', $request);
    }

    public function midtrans(Request $request): Response
    {
        return $this->handle('midtrans', $request);
    }

    private function handle(string $gateway, Request $request): Response
    {
        $gatewayAdapter = $this->gatewayManager->resolve($gateway);

        // Verify signature
        if (!$gatewayAdapter->verifyWebhookSignature($request)) {
            Log::warning("Webhook signature verification failed for {$gateway}");

            return response('Unauthorized', 401);
        }

        // Parse the webhook payload
        $result = $gatewayAdapter->handleWebhook($request);

        $transaction = PaymentTransaction::where(
            'gateway_transaction_id',
            $result->gatewayTransactionId,
        )->first();

        if (!$transaction) {
            Log::warning('Webhook for unknown transaction', [
                'gateway' => $gateway,
                'gateway_transaction_id' => $result->gatewayTransactionId,
            ]);

            return response('Transaction not found', 404);
        }

        // Idempotency: already processed
        if ($transaction->isTerminal()) {
            return response('OK', 200);
        }

        DB::transaction(function () use ($transaction, $result) {
            $transaction->update([
                'status' => $result->status,
                'method' => $result->method ?? $transaction->method,
                'gateway_fee' => $result->gatewayFee,
                'paid_at' => $result->status === 'paid' ? now() : null,
                'raw_payload' => $result->rawPayload,
            ]);

            if ($result->status === 'paid') {
                app(OrderService::class)->confirmOrder($transaction->order_id);
            }
        });

        return response('OK', 200);
    }
}
