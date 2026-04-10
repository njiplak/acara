<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class BaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(PermissionSeeder::class);

        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        $user->assignRole('super-admin');

        $this->call([
            SettingSeeder::class,
            LandingPageSettingSeeder::class,
            PageSeeder::class,
            PermissionSeeder::class,
            // MailTemplateSeeder::class,
            // VenueSeeder::class,
            // SpeakerSeeder::class,
            // AddonSeeder::class,
            // CatalogSeeder::class,
        ]);
    }
}
