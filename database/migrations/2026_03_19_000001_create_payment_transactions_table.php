<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->string('gateway'); // manual, xendit, stripe, midtrans
            $table->string('gateway_transaction_id')->nullable()->unique();
            $table->string('gateway_reference')->nullable();
            $table->string('method')->nullable(); // virtual_account, qris, ewallet, card, bank_transfer
            $table->string('currency', 3)->default('IDR');
            $table->unsignedBigInteger('amount');
            $table->unsignedInteger('gateway_fee')->nullable();
            $table->string('status')->default('pending'); // pending, paid, failed, expired, refunded, partial_refund
            $table->json('raw_payload')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['order_id', 'status']);
            $table->index(['gateway', 'status']);
            $table->index(['status', 'expires_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_transactions');
    }
};
