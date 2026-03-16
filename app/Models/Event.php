<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Event extends Model
{
    /** @use HasFactory<\Database\Factories\EventFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'start_date',
        'end_date',
        'status',
        'payment_method',
        'schedule',
        'material_require_checkin',
        'venue_id',
    ];

    protected function casts(): array
    {
        return [
            'schedule' => 'array',
            'material_require_checkin' => 'boolean',
        ];
    }

    public function venue(): BelongsTo
    {
        return $this->belongsTo(Venue::class);
    }

    public function catalogs(): BelongsToMany
    {
        return $this->belongsToMany(Catalog::class)
            ->withPivot('max_participant', 'pricing_type', 'pricing_tiers')
            ->using(CatalogEventPivot::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function materials(): HasMany
    {
        return $this->hasMany(EventMaterial::class);
    }
}
