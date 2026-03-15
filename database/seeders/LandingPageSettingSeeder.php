<?php

namespace Database\Seeders;

use App\Models\LandingPageSetting;
use Illuminate\Database\Seeder;

class LandingPageSettingSeeder extends Seeder
{
    public function run(): void
    {
        LandingPageSetting::updateOrCreate([], [
            'business_name' => 'Kawakib Yoga',
            'business_description' => 'Kawakib Yoga adalah studio yoga yang menghadirkan pengalaman transformatif melalui kelas yoga, meditasi, dan sound healing untuk keseimbangan tubuh, pikiran, dan jiwa.',
            'business_phone' => '+6281234567890',
            'business_email' => 'hello@kawakibyoga.com',
            'business_address' => 'Jl. Sunset Road No. 88, Seminyak, Bali 80361',
            'hero_badge_text' => 'Welcome to Kawakib Yoga',
            'hero_title' => 'Temukan Keseimbangan Tubuh & Jiwa',
            'hero_subtitle' => 'Bergabunglah dengan kelas yoga, meditasi, dan sound healing kami untuk memulai perjalanan menuju ketenangan dan kesehatan holistik.',
            'cta_text' => 'Daftar Sekarang',
            'cta_url' => 'https://wa.me/6281234567890',
            'meta_title' => 'Kawakib Yoga - Studio Yoga & Meditasi di Bali',
            'meta_description' => 'Kawakib Yoga menawarkan kelas yoga, meditasi, dan sound healing di Bali. Temukan keseimbangan tubuh dan jiwa bersama instruktur berpengalaman.',
            'meta_keywords' => 'yoga bali, kelas yoga, meditasi, sound healing, kawakib yoga, studio yoga seminyak',
            'social_instagram' => 'https://instagram.com/kawakibyoga',
            'social_whatsapp' => '6281234567890',
            'social_tiktok' => 'https://tiktok.com/@kawakibyoga',
            'social_facebook' => 'https://facebook.com/kawakibyoga',
            'footer_text' => '© 2026 Kawakib Yoga. All rights reserved.',
        ]);
    }
}
