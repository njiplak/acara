<?php

namespace App\Filters;

use Illuminate\Database\Eloquent\Builder;
use Spatie\QueryBuilder\Filters\Filter;

class CustomerTagFilter implements Filter
{
    public function __invoke(Builder $query, $value, string $property): void
    {
        $tags = is_array($value) ? $value : explode(',', $value);
        $activeDays = config('service-contract.customer_tags.active_days', 90);
        $lapsedDays = config('service-contract.customer_tags.lapsed_days', 180);
        $threshold = config('service-contract.customer_tags.big_spender_threshold', 1000000);

        foreach ($tags as $tag) {
            match ($tag) {
                'new' => $query->whereRaw("(SELECT COUNT(*) FROM orders WHERE orders.customer_id = customers.id AND orders.status = 'confirmed') = 1"),
                'returning' => $query->whereRaw("(SELECT COUNT(*) FROM orders WHERE orders.customer_id = customers.id AND orders.status = 'confirmed') BETWEEN 2 AND 3"),
                'loyal' => $query->whereRaw("(SELECT COUNT(*) FROM orders WHERE orders.customer_id = customers.id AND orders.status = 'confirmed') >= 4"),
                'active' => $query->whereRaw("(SELECT MAX(orders.confirmed_at) FROM orders WHERE orders.customer_id = customers.id AND orders.status = 'confirmed') >= ?", [now()->subDays($activeDays)]),
                'lapsed' => $query->whereRaw("(SELECT MAX(orders.confirmed_at) FROM orders WHERE orders.customer_id = customers.id AND orders.status = 'confirmed') < ? AND (SELECT MAX(orders.confirmed_at) FROM orders WHERE orders.customer_id = customers.id AND orders.status = 'confirmed') >= ?", [now()->subDays($activeDays), now()->subDays($lapsedDays)]),
                'inactive' => $query->whereRaw("(SELECT MAX(orders.confirmed_at) FROM orders WHERE orders.customer_id = customers.id AND orders.status = 'confirmed') < ?", [now()->subDays($lapsedDays)]),
                'no-show' => $query->whereRaw("(SELECT COUNT(*) FROM orders JOIN events ON events.id = orders.event_id WHERE orders.customer_id = customers.id AND orders.status = 'confirmed' AND orders.checked_in_at IS NULL AND events.end_date < CURDATE()) > 0"),
                'big-spender' => $query->whereRaw("(SELECT COALESCE(SUM(orders.total_amount), 0) FROM orders WHERE orders.customer_id = customers.id AND orders.status = 'confirmed') > ?", [$threshold]),
                'referrer' => $query->whereRaw("(SELECT COUNT(*) FROM orders WHERE orders.referred_by = customers.id AND orders.status = 'confirmed') > 0"),
                default => null,
            };
        }
    }
}
