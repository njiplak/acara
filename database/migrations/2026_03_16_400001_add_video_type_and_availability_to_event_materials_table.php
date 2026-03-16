<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('event_materials', function (Blueprint $table) {
            $table->dateTime('available_from')->nullable()->after('content');
            $table->dateTime('available_until')->nullable()->after('available_from');
        });

        // The type column is validated at application level (EventMaterialRequest).
        // SQLite stores enum as varchar — no schema change needed for adding 'video'.
        // For MySQL, the original create migration should be updated to include 'video'.
    }

    public function down(): void
    {
        Schema::table('event_materials', function (Blueprint $table) {
            $table->dropColumn(['available_from', 'available_until']);
        });
    }
};
