<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class LandingPageSetting extends Model implements HasMedia
{
    /** @use HasFactory<\Database\Factories\LandingPageSettingFactory> */
    use HasFactory, InteractsWithMedia;

    protected $fillable = [
        'business_name',
        'business_description',
        'business_phone',
        'business_email',
        'business_address',
        'hero_badge_text',
        'hero_title',
        'hero_subtitle',
        'cta_text',
        'cta_url',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'og_image',
        'google_site_verification',
        'google_analytics_id',
        'google_tag_manager_id',
        'meta_pixel_id',
        'custom_head_scripts',
        'social_instagram',
        'social_whatsapp',
        'social_tiktok',
        'social_facebook',
        'footer_text',
        'payment_instruction',
    ];

    public static function instance(): static
    {
        return static::firstOrCreate([]);
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('logo')->singleFile();
        $this->addMediaCollection('certificate_template')->singleFile();
    }
}
