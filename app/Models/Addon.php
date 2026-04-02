<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Addon extends Model
{
    /** @use HasFactory<\Database\Factories\AddonFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'strike_price',
        'price',
        'status',
        'is_standalone',
        'payment_gateway',
        'currency',
    ];

    protected function casts(): array
    {
        return [
            'is_standalone' => 'boolean',
        ];
    }

    public function catalogs(): BelongsToMany
    {
        return $this->belongsToMany(Catalog::class);
    }

    public function scopePublishedStandalone($query)
    {
        return $query->where('status', 'published')->where('is_standalone', true);
    }
}
