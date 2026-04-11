<?php

use App\Models\LandingPageSetting;
use App\Models\OperationalSetting;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $landingPage = DB::table('landing_page_settings')->first();

        if (! $landingPage) {
            return;
        }

        $operational = OperationalSetting::firstOrCreate([], [
            'payment_instruction' => $landingPage->payment_instruction,
        ]);

        // Move certificate_template media from LandingPageSetting to OperationalSetting
        DB::table('media')
            ->where('model_type', LandingPageSetting::class)
            ->where('model_id', $landingPage->id)
            ->where('collection_name', 'certificate_template')
            ->update([
                'model_type' => OperationalSetting::class,
                'model_id' => $operational->id,
            ]);

        // Clean up the old column value
        DB::table('landing_page_settings')
            ->where('id', $landingPage->id)
            ->update(['payment_instruction' => null]);
    }

    public function down(): void
    {
        $operational = DB::table('operational_settings')->first();

        if (! $operational) {
            return;
        }

        $landingPage = DB::table('landing_page_settings')->first();

        if ($landingPage) {
            DB::table('landing_page_settings')
                ->where('id', $landingPage->id)
                ->update(['payment_instruction' => $operational->payment_instruction]);

            DB::table('media')
                ->where('model_type', OperationalSetting::class)
                ->where('model_id', $operational->id)
                ->where('collection_name', 'certificate_template')
                ->update([
                    'model_type' => LandingPageSetting::class,
                    'model_id' => $landingPage->id,
                ]);
        }
    }
};
