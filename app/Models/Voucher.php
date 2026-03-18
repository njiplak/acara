<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Voucher extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'type',
        'value',
        'max_discount',
        'event_id',
        'catalog_id',
        'customer_id',
        'max_uses',
        'max_uses_per_customer',
        'min_order_amount',
        'valid_from',
        'valid_until',
        'is_active',
        'stackable_with_referral',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'stackable_with_referral' => 'boolean',
            'valid_from' => 'datetime',
            'valid_until' => 'datetime',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function catalog(): BelongsTo
    {
        return $this->belongsTo(Catalog::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}
