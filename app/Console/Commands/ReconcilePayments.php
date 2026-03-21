<?php

namespace App\Console\Commands;

use App\Models\PaymentTransaction;
use App\Service\Payment\PaymentService;
use Illuminate\Console\Command;

class ReconcilePayments extends Command
{
    protected $signature = 'payment:reconcile';
    protected $description = 'Check status of stale pending transactions with their gateways';

    public function handle(PaymentService $paymentService): void
    {
        $staleMinutes = config('payment.reconciliation.stale_threshold_minutes', 30);

        $staleTransactions = PaymentTransaction::stale($staleMinutes)->get();

        $this->info("Found {$staleTransactions->count()} stale transaction(s).");

        foreach ($staleTransactions as $transaction) {
            try {
                $status = $paymentService->checkTransactionStatus($transaction);
                $this->line("Transaction {$transaction->id} ({$transaction->gateway}): {$status->status}");
            } catch (\Exception $e) {
                $this->error("Failed for transaction {$transaction->id}: {$e->getMessage()}");
            }
        }
    }
}
