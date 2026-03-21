<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->string('payment_gateway')->default('manual')->after('status');
            $table->string('currency', 3)->default('IDR')->after('payment_gateway');
        });

        // Backfill from payment_method
        DB::table('events')->whereNotNull('payment_method')->update([
            'payment_gateway' => DB::raw('payment_method'),
        ]);

        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn('payment_method');
        });
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->string('payment_method')->default('manual')->after('status');
        });

        DB::table('events')->update([
            'payment_method' => DB::raw('payment_gateway'),
        ]);

        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn(['payment_gateway', 'currency']);
        });
    }
};
