<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('waitlists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->foreignId('catalog_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('position');
            $table->timestamp('notified_at')->nullable();
            $table->timestamps();

            $table->unique(['customer_id', 'event_id', 'catalog_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('waitlists');
    }
};
