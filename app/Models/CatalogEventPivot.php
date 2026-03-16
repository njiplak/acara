<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class CatalogEventPivot extends Pivot
{
    protected function casts(): array
    {
        return [
            'pricing_tiers' => 'array',
        ];
    }
}
