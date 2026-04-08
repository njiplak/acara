<?php

namespace App\Models;

use LucasDotVin\Soulbscription\Models\Plan;

class SubscriptionPlan extends Plan
{
    protected $table = 'plans';

    protected $fillable = [
        'grace_days',
        'name',
        'description',
        'price',
        'periodicity_type',
        'periodicity',
        'is_active',
        'resources',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'integer',
            'is_active' => 'boolean',
            'resources' => 'array',
            'sort_order' => 'integer',
            'grace_days' => 'integer',
            'periodicity' => 'integer',
        ];
    }

    public function features()
    {
        return $this->belongsToMany(config('soulbscription.models.feature'), 'feature_plan', 'plan_id', 'feature_id')
            ->using(config('soulbscription.models.feature_plan'))
            ->withPivot(['charges']);
    }
}
