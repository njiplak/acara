<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mail_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mail_template_id')->constrained()->cascadeOnDelete();
            $table->string('recipient_email');
            $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('event_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamp('sent_at');
            $table->timestamps();

            $table->unique(['mail_template_id', 'recipient_email', 'order_id'], 'mail_logs_template_recipient_order_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mail_logs');
    }
};
