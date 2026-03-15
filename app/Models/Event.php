<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
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
    ];

    public function catalogs(): BelongsToMany
    {
        return $this->belongsToMany(Catalog::class)->withPivot('max_participant');
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}
