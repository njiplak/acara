<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
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
            MailTemplateSeeder::class,
            AddonSeeder::class,
            CatalogSeeder::class,
            EventSeeder::class,
        ]);
    }
}
