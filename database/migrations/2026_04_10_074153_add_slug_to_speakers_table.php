<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('speakers', function (Blueprint $table) {
            $table->string('slug')->nullable()->after('name');
        });

        // Backfill slugs for existing speakers
        $usedSlugs = [];
        foreach (\App\Models\Speaker::orderBy('id')->get() as $speaker) {
            $slug = Str::slug($speaker->name);

            if (in_array($slug, $usedSlugs)) {
                $counter = 2;
                while (in_array("{$slug}-{$counter}", $usedSlugs)) {
                    $counter++;
                }
                $slug = "{$slug}-{$counter}";
            }

            $usedSlugs[] = $slug;
            $speaker->update(['slug' => $slug]);
        }

        Schema::table('speakers', function (Blueprint $table) {
            $table->string('slug')->unique()->nullable(false)->change();
        });
    }

    public function down(): void
    {
        Schema::table('speakers', function (Blueprint $table) {
            $table->dropUnique(['slug']);
            $table->dropColumn('slug');
        });
    }
};
