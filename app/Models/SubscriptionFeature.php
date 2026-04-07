<?php

namespace App\Models;

use LucasDotVin\Soulbscription\Models\Feature;

class SubscriptionFeature extends Feature
{
    protected $table = 'features';

    protected $fillable = [
        'consumable',
        'name',
        'description',
        'periodicity_type',
        'periodicity',
        'quota',
        'postpaid',
    ];

    protected function casts(): array
    {
        return [
            'consumable' => 'boolean',
            'quota' => 'boolean',
            'postpaid' => 'boolean',
            'periodicity' => 'integer',
        ];
    }
}
