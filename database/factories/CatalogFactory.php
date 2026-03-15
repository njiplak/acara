<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Catalog>
 */
class CatalogFactory extends Factory
{
    public function definition(): array
    {
        $price = $this->faker->randomFloat(2, 20, 500);

        return [
            'name' => $this->faker->words(3, true),
            'description' => $this->faker->sentence(),
            'strike_price' => $this->faker->optional(0.3)->randomFloat(2, $price, $price * 1.5),
            'price' => $price,
        ];
    }
}
