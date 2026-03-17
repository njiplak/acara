<?php

namespace Database\Seeders;

use App\Models\Speaker;
use Illuminate\Database\Seeder;

class SpeakerSeeder extends Seeder
{
    public function run(): void
    {
        $speakers = [
            [
                'name' => 'Made Surya',
                'title' => 'Yoga Instructor',
                'bio' => 'Certified Hatha & Vinyasa instructor with 10+ years of experience. Specializes in alignment-based flow and breathwork.',
            ],
            [
                'name' => 'Ayu Pratiwi',
                'title' => 'Meditation Guide',
                'bio' => 'Mindfulness practitioner trained in Vipassana and loving-kindness meditation. Leads retreats across Southeast Asia.',
            ],
            [
                'name' => 'Kadek Dharma',
                'title' => 'Sound Healer',
                'bio' => 'Sound healing practitioner specializing in Tibetan singing bowls and gong bath therapy. Trained in Bali and Nepal.',
            ],
            [
                'name' => 'Wayan Ari',
                'title' => 'Wellness Coach',
                'bio' => 'Holistic wellness coach combining yoga, nutrition, and Ayurvedic principles. Former competitive athlete turned mindful movement advocate.',
            ],
        ];

        foreach ($speakers as $speaker) {
            Speaker::updateOrCreate(['name' => $speaker['name']], $speaker);
        }
    }
}
