<?php

namespace Database\Seeders;

use App\Models\Addon;
use Illuminate\Database\Seeder;

class AddonSeeder extends Seeder
{
    public function run(): void
    {
        $addons = [
            ['name' => 'Mat Rental', 'description' => 'Yoga mat rental for the session', 'price' => 5.00],
            ['name' => 'Towel Service', 'description' => 'Fresh towel provided', 'price' => 3.00],
            ['name' => 'Water Bottle', 'description' => 'Complimentary water bottle', 'price' => 2.00],
            ['name' => 'Photography', 'description' => 'Professional photo during session', 'price' => 15.00],
            ['name' => 'Lunch Package', 'description' => 'Healthy lunch box included', 'price' => 25.00, 'strike_price' => 30.00],
        ];

        foreach ($addons as $addon) {
            Addon::updateOrCreate(['name' => $addon['name']], $addon);
        }
    }
}
