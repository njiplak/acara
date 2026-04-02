<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('addons', function (Blueprint $table) {
            $table->string('status')->default('draft')->after('price');
            $table->boolean('is_standalone')->default(false)->after('status');
            $table->string('payment_gateway')->default('manual')->after('is_standalone');
            $table->string('currency', 3)->default('IDR')->after('payment_gateway');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('event_id')->nullable()->change();
            $table->foreignId('catalog_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('addons', function (Blueprint $table) {
            $table->dropColumn(['status', 'is_standalone', 'payment_gateway', 'currency']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('event_id')->nullable(false)->change();
            $table->foreignId('catalog_id')->nullable(false)->change();
        });
    }
};
