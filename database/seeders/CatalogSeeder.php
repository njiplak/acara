<?php

namespace Database\Seeders;

use App\Models\Addon;
use App\Models\Catalog;
use Illuminate\Database\Seeder;

class CatalogSeeder extends Seeder
{
    public function run(): void
    {
        $catalogs = [
            ['name' => 'Morning Yoga', 'description' => 'Sunrise yoga session', 'price' => 50.00, 'strike_price' => 65.00],
            ['name' => 'Evening Meditation', 'description' => 'Guided meditation class', 'price' => 35.00],
            ['name' => 'Sound Bath', 'description' => 'Healing sound therapy', 'price' => 75.00],
            ['name' => 'Deep Tissue Massage', 'description' => 'Full body massage session', 'price' => 120.00, 'strike_price' => 150.00],
        ];

        $addonIds = Addon::pluck('id')->toArray();

        foreach ($catalogs as $catalog) {
            $model = Catalog::updateOrCreate(['name' => $catalog['name']], $catalog);
            if ($model->wasRecentlyCreated && !empty($addonIds)) {
                $model->addons()->sync(array_slice($addonIds, 0, rand(1, count($addonIds))));
            }
        }
    }
}
