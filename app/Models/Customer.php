<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\DB;

class Customer extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'google_id',
        'avatar',
        'referral_code',
        'referral_balance',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function testimonials(): HasMany
    {
        return $this->hasMany(Testimonial::class);
    }

    public function scopeWithTags(Builder $query): Builder
    {
        return $query->addSelect([
            'customers.*',
            DB::raw('(SELECT COUNT(*) FROM orders WHERE orders.customer_id = customers.id AND orders.status = \'confirmed\') as confirmed_orders_count'),
            DB::raw('(SELECT MAX(orders.confirmed_at) FROM orders WHERE orders.customer_id = customers.id AND orders.status = \'confirmed\') as last_confirmed_at'),
            DB::raw('(SELECT COALESCE(SUM(orders.total_amount), 0) FROM orders WHERE orders.customer_id = customers.id AND orders.status = \'confirmed\') as total_spend'),
            DB::raw('(SELECT COUNT(*) FROM orders JOIN events ON events.id = orders.event_id WHERE orders.customer_id = customers.id AND orders.status = \'confirmed\' AND orders.checked_in_at IS NULL AND events.end_date < CURDATE()) as no_show_count'),
            DB::raw('(SELECT COUNT(*) FROM orders WHERE orders.referred_by = customers.id AND orders.status = \'confirmed\') as referral_count'),
        ]);
    }

    public function scopeMatchingAnyTags(Builder $query, array $tags): Builder
    {
        $activeDays = config('service-contract.customer_tags.active_days', 90);
        $lapsedDays = config('service-contract.customer_tags.lapsed_days', 180);
        $threshold = config('service-contract.customer_tags.big_spender_threshold', 1000000);

        // Must have at least one confirmed order to be targetable
        $query->whereRaw("(SELECT COUNT(*) FROM orders WHERE orders.customer_id = customers.id AND orders.status = 'confirmed') >= 1");

        return $query->where(function ($q) use ($tags, $activeDays, $lapsedDays, $threshold) {
            foreach ($tags as $tag) {
                match ($tag) {
                    'new' => $q->orWhereRaw("(SELECT COUNT(*) FROM orders WHERE orders.customer_id = customers.id AND orders.status = 'confirmed') = 1"),
                    'returning' => $q->orWhereRaw("(SELECT COUNT(*) FROM orders WHERE orders.customer_id = customers.id AND orders.status = 'confirmed') BETWEEN 2 AND 3"),
                    'loyal' => $q->orWhereRaw("(SELECT COUNT(*) FROM orders WHERE orders.customer_id = customers.id AND orders.status = 'confirmed') >= 4"),
                    'active' => $q->orWhereRaw("(SELECT MAX(orders.confirmed_at) FROM orders WHERE orders.customer_id = customers.id AND orders.status = 'confirmed') >= ?", [now()->subDays($activeDays)]),
                    'lapsed' => $q->orWhereRaw("(SELECT MAX(orders.confirmed_at) FROM orders WHERE orders.customer_id = customers.id AND orders.status = 'confirmed') < ? AND (SELECT MAX(orders.confirmed_at) FROM orders WHERE orders.customer_id = customers.id AND orders.status = 'confirmed') >= ?", [now()->subDays($activeDays), now()->subDays($lapsedDays)]),
                    'inactive' => $q->orWhereRaw("(SELECT MAX(orders.confirmed_at) FROM orders WHERE orders.customer_id = customers.id AND orders.status = 'confirmed') < ?", [now()->subDays($lapsedDays)]),
                    'no-show' => $q->orWhereRaw("(SELECT COUNT(*) FROM orders JOIN events ON events.id = orders.event_id WHERE orders.customer_id = customers.id AND orders.status = 'confirmed' AND orders.checked_in_at IS NULL AND events.end_date < CURDATE()) > 0"),
                    'big-spender' => $q->orWhereRaw("(SELECT COALESCE(SUM(orders.total_amount), 0) FROM orders WHERE orders.customer_id = customers.id AND orders.status = 'confirmed') > ?", [$threshold]),
                    'referrer' => $q->orWhereRaw("(SELECT COUNT(*) FROM orders WHERE orders.referred_by = customers.id AND orders.status = 'confirmed') > 0"),
                    default => null,
                };
            }
        });
    }

    public function getTagsAttribute(): array
    {
        $tags = [];
        $count = $this->confirmed_orders_count ?? 0;

        if ($count === 0) {
            return $tags;
        }

        $threshold = config('service-contract.customer_tags.big_spender_threshold', 1000000);
        $activeDays = config('service-contract.customer_tags.active_days', 90);
        $lapsedDays = config('service-contract.customer_tags.lapsed_days', 180);

        // Frequency
        if ($count === 1) {
            $tags[] = 'new';
        } elseif ($count >= 2 && $count <= 3) {
            $tags[] = 'returning';
        } elseif ($count >= 4) {
            $tags[] = 'loyal';
        }

        // Recency
        if ($this->last_confirmed_at) {
            $daysSince = Carbon::parse($this->last_confirmed_at)->diffInDays(now());
            if ($daysSince <= $activeDays) {
                $tags[] = 'active';
            } elseif ($daysSince <= $lapsedDays) {
                $tags[] = 'lapsed';
            } else {
                $tags[] = 'inactive';
            }
        }

        // Behavior
        if (($this->no_show_count ?? 0) > 0) {
            $tags[] = 'no-show';
        }
        if (($this->total_spend ?? 0) > $threshold) {
            $tags[] = 'big-spender';
        }
        if (($this->referral_count ?? 0) > 0) {
            $tags[] = 'referrer';
        }

        return $tags;
    }
}
