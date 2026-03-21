<?php

namespace App\Console\Commands;

use App\Models\PaymentTransaction;
use App\Service\Operational\OrderService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ExpirePayments extends Command
{
    protected $signature = 'payment:expire';
    protected $description = 'Expire pending transactions past their expiry time and cancel associated orders';

    public function handle(): void
    {
        $expired = PaymentTransaction::where('status', 'pending')
            ->where('gateway', '!=', 'manual')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<', now())
            ->get();

        $this->info("Found {$expired->count()} expired transaction(s).");

        foreach ($expired as $transaction) {
            try {
                DB::transaction(function () use ($transaction) {
                    $transaction->update(['status' => 'expired']);

                    $order = $transaction->order;
                    if ($order && $order->status === 'pending_payment') {
                        // Only cancel if no other pending transactions exist
                        $otherPending = PaymentTransaction::where('order_id', $order->id)
                            ->where('id', '!=', $transaction->id)
                            ->where('status', 'pending')
                            ->exists();

                        if (!$otherPending) {
                            app(OrderService::class)->cancelOrder($order->id);
                        }
                    }
                });

                $this->line("Expired transaction {$transaction->id}, order #{$transaction->order_id}");
            } catch (\Exception $e) {
                $this->error("Failed for transaction {$transaction->id}: {$e->getMessage()}");
            }
        }
    }
}
