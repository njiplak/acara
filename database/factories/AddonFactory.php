<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Addon>
 */
class AddonFactory extends Factory
{
    public function definition(): array
    {
        $price = $this->faker->randomFloat(2, 5, 100);

        return [
            'name' => $this->faker->words(2, true),
            'description' => $this->faker->sentence(),
            'strike_price' => $this->faker->optional(0.3)->randomFloat(2, $price, $price * 1.5),
            'price' => $price,
        ];
    }
}
