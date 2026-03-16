<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('catalog_event', function (Blueprint $table) {
            $table->string('pricing_type')->default('fixed')->after('max_participant');
            $table->json('pricing_tiers')->nullable()->after('pricing_type');
        });
    }

    public function down(): void
    {
        Schema::table('catalog_event', function (Blueprint $table) {
            $table->dropColumn(['pricing_type', 'pricing_tiers']);
        });
    }
};
