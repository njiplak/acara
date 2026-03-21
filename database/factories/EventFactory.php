<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Event>
 */
class EventFactory extends Factory
{
    public function definition(): array
    {
        $startDate = $this->faker->dateTimeBetween('now', '+3 months');

        return [
            'name' => $this->faker->words(3, true),
            'description' => $this->faker->sentence(),
            'start_date' => $startDate,
            'end_date' => $this->faker->dateTimeBetween($startDate, $startDate->format('Y-m-d') . ' +7 days'),
            'status' => $this->faker->randomElement(['draft', 'published']),
            'payment_gateway' => $this->faker->randomElement(['manual', 'xendit', 'stripe']),
            'currency' => 'IDR',
        ];
    }
}
