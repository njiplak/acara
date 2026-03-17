<?php

namespace Database\Seeders;

use App\Models\Venue;
use Illuminate\Database\Seeder;

class VenueSeeder extends Seeder
{
    public function run(): void
    {
        $venues = [
            [
                'name' => 'Kawakib Studio Seminyak',
                'address' => 'Jl. Sunset Road No. 88',
                'city' => 'Seminyak, Bali',
                'capacity' => 30,
                'maps_url' => 'https://maps.app.goo.gl/example1',
                'notes' => 'Main studio. AC, sound system, yoga mats provided.',
            ],
            [
                'name' => 'Beachfront Shala',
                'address' => 'Jl. Pantai Berawa No. 12',
                'city' => 'Canggu, Bali',
                'capacity' => 50,
                'maps_url' => 'https://maps.app.goo.gl/example2',
                'notes' => 'Open-air shala with ocean view. Best for sunrise sessions.',
            ],
            [
                'name' => 'Ubud Wellness Center',
                'address' => 'Jl. Raya Ubud No. 45',
                'city' => 'Ubud, Bali',
                'capacity' => 20,
                'maps_url' => 'https://maps.app.goo.gl/example3',
                'notes' => 'Intimate space surrounded by rice terraces. Parking available.',
            ],
        ];

        foreach ($venues as $venue) {
            Venue::updateOrCreate(['name' => $venue['name']], $venue);
        }
    }
}
