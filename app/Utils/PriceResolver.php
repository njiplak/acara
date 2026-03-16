<?php

namespace App\Utils;

use Carbon\Carbon;

class PriceResolver
{
    /**
     * Resolve the active price for a catalog-event pairing.
     *
     * @return array{active_price: int, active_tier_index: int|null, tiers: array, savings: int}
     */
    public static function resolve(
        string $pricingType,
        ?array $pricingTiers,
        int|float $catalogPrice,
        int $currentOrders = 0,
    ): array {
        if ($pricingType === 'fixed' || empty($pricingTiers)) {
            return [
                'active_price' => (int) $catalogPrice,
                'active_tier_index' => null,
                'tiers' => [],
                'savings' => 0,
            ];
        }

        $today = Carbon::today();
        $activeTierIndex = null;
        $activePrice = (int) $catalogPrice;

        if ($pricingType === 'date') {
            foreach ($pricingTiers as $index => $tier) {
                if ($tier['end_date'] === null || Carbon::parse($tier['end_date'])->gte($today)) {
                    $activeTierIndex = $index;
                    $activePrice = (int) $tier['price'];
                    break;
                }
            }
        }

        if ($pricingType === 'quantity') {
            $cumulativeSeats = 0;
            foreach ($pricingTiers as $index => $tier) {
                if ($tier['max_seats'] === null) {
                    $activeTierIndex = $index;
                    $activePrice = (int) $tier['price'];
                    break;
                }
                $cumulativeSeats += $tier['max_seats'];
                if ($currentOrders < $cumulativeSeats) {
                    $activeTierIndex = $index;
                    $activePrice = (int) $tier['price'];
                    break;
                }
            }
        }

        $lastTierPrice = (int) (end($pricingTiers)['price'] ?? $activePrice);
        $savings = max(0, $lastTierPrice - $activePrice);

        return [
            'active_price' => $activePrice,
            'active_tier_index' => $activeTierIndex,
            'tiers' => $pricingTiers,
            'savings' => $savings,
        ];
    }
}
