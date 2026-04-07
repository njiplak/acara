<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->text('description')->nullable()->after('name');
            $table->unsignedBigInteger('price')->default(0)->after('description');
            $table->boolean('is_active')->default(true)->after('price');
            $table->json('resources')->nullable()->after('is_active');
            $table->unsignedInteger('sort_order')->default(0)->after('resources');
        });

        Schema::table('features', function (Blueprint $table) {
            $table->text('description')->nullable()->after('name');
        });
    }

    public function down(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->dropColumn(['description', 'price', 'is_active', 'resources', 'sort_order']);
        });

        Schema::table('features', function (Blueprint $table) {
            $table->dropColumn('description');
        });
    }
};
