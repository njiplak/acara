<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class BaseSeeder extends Seeder
{
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        $this->call([
            SettingSeeder::class,
            LandingPageSettingSeeder::class,
            // MailTemplateSeeder::class,
            PageSeeder::class,
            // VenueSeeder::class,
            // SpeakerSeeder::class,
            // AddonSeeder::class,
            // CatalogSeeder::class,
        ]);
    }
}
