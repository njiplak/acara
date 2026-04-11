<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class OperationalSetting extends Model implements HasMedia
{
    use InteractsWithMedia;

    protected $fillable = [
        'payment_instruction',
    ];

    public static function instance(): static
    {
        return static::firstOrCreate([]);
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('certificate_template')->singleFile();
    }
}
