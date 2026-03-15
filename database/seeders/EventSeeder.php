<?php

namespace Database\Seeders;

use App\Models\Catalog;
use App\Models\Event;
use Illuminate\Database\Seeder;

class EventSeeder extends Seeder
{
    public function run(): void
    {
        $events = [
            [
                'name' => 'Weekend Wellness Retreat',
                'description' => 'A full weekend of wellness activities',
                'start_date' => '2026-04-01',
                'end_date' => '2026-04-03',
                'status' => 'published',
                'payment_method' => 'qris',
            ],
            [
                'name' => 'Summer Yoga Festival',
                'description' => 'Annual summer yoga gathering',
                'start_date' => '2026-06-15',
                'end_date' => '2026-06-17',
                'status' => 'draft',
                'payment_method' => 'manual',
            ],
        ];

        $catalogIds = Catalog::pluck('id')->toArray();

        foreach ($events as $event) {
            $model = Event::updateOrCreate(['name' => $event['name']], $event);
            if ($model->wasRecentlyCreated && !empty($catalogIds)) {
                $pivotData = [];
                foreach (array_slice($catalogIds, 0, rand(1, count($catalogIds))) as $catalogId) {
                    $pivotData[$catalogId] = ['max_participant' => rand(10, 50)];
                }
                $model->catalogs()->sync($pivotData);
            }
        }
    }
}
