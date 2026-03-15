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
    ];

    public function catalogs(): BelongsToMany
    {
        return $this->belongsToMany(Catalog::class);
    }
}
