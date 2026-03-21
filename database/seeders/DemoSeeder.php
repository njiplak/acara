<?php

namespace Database\Seeders;

use App\Models\Addon;
use App\Models\Campaign;
use App\Models\Catalog;
use App\Models\Customer;
use App\Models\Event;
use App\Models\EventAnnouncement;
use App\Models\EventMaterial;
use App\Models\MailLog;
use App\Models\MailTemplate;
use App\Models\Order;
use App\Models\SessionAttendance;
use App\Models\Speaker;
use App\Models\Survey;
use App\Models\SurveyResponse;
use App\Models\Testimonial;
use App\Models\User;
use App\Models\Venue;
use App\Models\Voucher;
use App\Models\Waitlist;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        // Run base seeders first (config + master data)
        $this->call(BaseSeeder::class);

        $admin = User::where('email', 'test@example.com')->first();
        $venues = Venue::all();
        $speakers = Speaker::all();
        $catalogs = Catalog::all();
        $addons = Addon::all();

        // ─── Events ────────────────────────────────────────────
        $events = $this->seedEvents($venues, $catalogs, $speakers);

        // ─── Vouchers ──────────────────────────────────────────
        $vouchers = $this->seedVouchers($events);

        // ─── Customers ─────────────────────────────────────────
        $customers = $this->seedCustomers();

        // ─── Orders ────────────────────────────────────────────
        $orders = $this->seedOrders($customers, $events, $vouchers, $addons, $admin);

        // ─── Check-ins ─────────────────────────────────────────
        $this->seedCheckIns($orders, $events);

        // ─── Referrals ─────────────────────────────────────────
        $this->seedReferrals($customers, $orders);

        // ─── Testimonials ──────────────────────────────────────
        $this->seedTestimonials($orders);

        // ─── Surveys + Responses ───────────────────────────────
        $this->seedSurveys($events, $orders);

        // ─── Event Materials ───────────────────────────────────
        $this->seedEventMaterials($events);

        // ─── Campaigns ─────────────────────────────────────────
        $this->seedCampaigns();

        // ─── Waitlist ──────────────────────────────────────────
        $this->seedWaitlist($events, $customers);

        // ─── Announcements ─────────────────────────────────────
        $this->seedAnnouncements($events);
    }

    private function seedEvents($venues, $catalogs, $speakers): array
    {
        $now = Carbon::now();

        $eventData = [
            // Past event — fully completed
            [
                'name' => 'Sunrise Flow & Breathwork',
                'description' => 'Sesi yoga pagi dengan fokus pada pranayama dan vinyasa flow. Cocok untuk semua level, dari pemula hingga advanced.',
                'start_date' => $now->copy()->subDays(30)->format('Y-m-d'),
                'end_date' => $now->copy()->subDays(30)->format('Y-m-d'),
                'status' => 'published',
                'payment_gateway' => 'manual',
                'venue_id' => $venues->where('name', 'Beachfront Shala')->first()?->id,
                'material_require_checkin' => true,
                'schedule' => [
                    ['time' => '06:00 - 07:30', 'title' => 'Pranayama & Warm-up'],
                    ['time' => '07:30 - 09:00', 'title' => 'Vinyasa Flow'],
                    ['time' => '09:00 - 09:30', 'title' => 'Savasana & Closing'],
                ],
            ],
            // Past event — completed 2 weeks ago
            [
                'name' => 'Full Moon Sound Bath',
                'description' => 'Pengalaman sound healing di bawah cahaya bulan purnama. Menggunakan singing bowl, gong, dan crystal bowl untuk relaksasi mendalam.',
                'start_date' => $now->copy()->subDays(14)->format('Y-m-d'),
                'end_date' => $now->copy()->subDays(14)->format('Y-m-d'),
                'status' => 'published',
                'payment_gateway' => 'manual',
                'venue_id' => $venues->where('name', 'Ubud Wellness Center')->first()?->id,
                'material_require_checkin' => true,
                'schedule' => [
                    ['time' => '18:00 - 18:30', 'title' => 'Opening Meditation'],
                    ['time' => '18:30 - 20:00', 'title' => 'Sound Bath Session'],
                    ['time' => '20:00 - 20:30', 'title' => 'Tea Ceremony & Sharing'],
                ],
            ],
            // Upcoming event — next week
            [
                'name' => 'Weekend Wellness Retreat',
                'description' => 'Retreat akhir pekan dengan yoga, meditasi, dan workshop nutrisi. Termasuk makan siang sehat dan sesi konsultasi pribadi.',
                'start_date' => $now->copy()->addDays(7)->format('Y-m-d'),
                'end_date' => $now->copy()->addDays(9)->format('Y-m-d'),
                'status' => 'published',
                'payment_gateway' => 'manual',
                'venue_id' => $venues->where('name', 'Kawakib Studio Seminyak')->first()?->id,
                'material_require_checkin' => false,
                'schedule' => [
                    ['time' => '08:00 - 09:30', 'title' => 'Morning Yoga'],
                    ['time' => '10:00 - 11:30', 'title' => 'Meditation Workshop'],
                    ['time' => '13:00 - 14:30', 'title' => 'Nutrition Talk'],
                    ['time' => '15:00 - 16:30', 'title' => 'Restorative Yoga'],
                ],
            ],
            // Upcoming event — next month
            [
                'name' => 'Yoga Teacher Training Intro',
                'description' => 'Sesi pengenalan untuk program Yoga Teacher Training 200-hour. Belajar dasar-dasar mengajar yoga dan anatomi gerakan.',
                'start_date' => $now->copy()->addDays(30)->format('Y-m-d'),
                'end_date' => $now->copy()->addDays(30)->format('Y-m-d'),
                'status' => 'published',
                'payment_gateway' => 'manual',
                'venue_id' => $venues->where('name', 'Beachfront Shala')->first()?->id,
                'material_require_checkin' => true,
                'schedule' => [
                    ['time' => '09:00 - 10:30', 'title' => 'Teaching Methodology'],
                    ['time' => '11:00 - 12:30', 'title' => 'Anatomy Basics'],
                    ['time' => '14:00 - 15:30', 'title' => 'Practice Teaching'],
                ],
            ],
            // Draft event
            [
                'name' => 'Summer Yoga Festival 2026',
                'description' => 'Festival yoga tahunan dengan berbagai kelas, workshop, dan pertunjukan. Tiga hari penuh aktivitas wellness.',
                'start_date' => $now->copy()->addDays(60)->format('Y-m-d'),
                'end_date' => $now->copy()->addDays(62)->format('Y-m-d'),
                'status' => 'draft',
                'payment_gateway' => 'manual',
                'venue_id' => $venues->where('name', 'Beachfront Shala')->first()?->id,
                'material_require_checkin' => false,
                'schedule' => [],
            ],
        ];

        $events = [];
        $catalogIds = $catalogs->pluck('id')->toArray();
        $speakerIds = $speakers->pluck('id')->toArray();

        foreach ($eventData as $i => $data) {
            $event = Event::updateOrCreate(['name' => $data['name']], $data);

            if ($event->wasRecentlyCreated && !empty($catalogIds)) {
                // Assign 2-3 catalogs per event
                $selected = array_slice($catalogIds, 0, min(rand(2, 3), count($catalogIds)));
                $pivotData = [];
                foreach ($selected as $catalogId) {
                    $pivotData[$catalogId] = [
                        'max_participant' => rand(15, 40),
                        'pricing_type' => 'fixed',
                        'pricing_tiers' => null,
                    ];
                }
                $event->catalogs()->sync($pivotData);

                // Assign speakers to catalogs
                foreach ($event->catalogs as $catalog) {
                    $catalog->speakers()->syncWithoutDetaching(
                        array_slice($speakerIds, 0, rand(1, 2))
                    );
                }
            }

            $events[] = $event;
        }

        return $events;
    }

    private function seedVouchers(array $events): array
    {
        $now = Carbon::now();
        $publishedEvents = collect($events)->where('status', 'published');

        $voucherData = [
            [
                'code' => 'WELCOME20',
                'name' => 'Welcome Discount 20%',
                'type' => 'percentage',
                'value' => 20,
                'max_discount' => 100000,
                'max_uses' => 50,
                'max_uses_per_customer' => 1,
                'min_order_amount' => 0,
                'valid_from' => $now->copy()->subDays(30),
                'valid_until' => $now->copy()->addDays(60),
                'is_active' => true,
                'stackable_with_referral' => false,
            ],
            [
                'code' => 'EARLYBIRD',
                'name' => 'Early Bird Rp 50.000',
                'type' => 'fixed',
                'value' => 50000,
                'max_discount' => null,
                'max_uses' => 20,
                'max_uses_per_customer' => 1,
                'min_order_amount' => 100000,
                'valid_from' => $now->copy()->subDays(14),
                'valid_until' => $now->copy()->addDays(30),
                'is_active' => true,
                'stackable_with_referral' => true,
            ],
            [
                'code' => 'RETREAT15',
                'name' => 'Retreat Special 15%',
                'type' => 'percentage',
                'value' => 15,
                'max_discount' => 200000,
                'event_id' => $publishedEvents->where('name', 'Weekend Wellness Retreat')->first()?->id,
                'max_uses' => 10,
                'max_uses_per_customer' => 1,
                'min_order_amount' => 0,
                'valid_from' => $now->copy()->subDays(7),
                'valid_until' => $now->copy()->addDays(14),
                'is_active' => true,
                'stackable_with_referral' => false,
            ],
            [
                'code' => 'EXPIRED10',
                'name' => 'Expired Promo 10%',
                'type' => 'percentage',
                'value' => 10,
                'max_discount' => 50000,
                'max_uses' => 100,
                'max_uses_per_customer' => 1,
                'min_order_amount' => 0,
                'valid_from' => $now->copy()->subDays(60),
                'valid_until' => $now->copy()->subDays(30),
                'is_active' => false,
                'stackable_with_referral' => false,
            ],
        ];

        $vouchers = [];
        foreach ($voucherData as $data) {
            $vouchers[] = Voucher::updateOrCreate(['code' => $data['code']], $data);
        }

        return $vouchers;
    }

    private function seedCustomers(): array
    {
        $customerData = [
            ['name' => 'Ni Luh Putu Sari', 'email' => 'sari.putu@gmail.com'],
            ['name' => 'Komang Adi Wijaya', 'email' => 'komang.adi@gmail.com'],
            ['name' => 'Putu Ayu Dewi', 'email' => 'ayu.dewi@gmail.com'],
            ['name' => 'I Wayan Gede', 'email' => 'wayan.gede@gmail.com'],
            ['name' => 'Kadek Rina', 'email' => 'kadek.rina@gmail.com'],
            ['name' => 'Made Agus Pratama', 'email' => 'agus.pratama@gmail.com'],
            ['name' => 'Ni Ketut Arimbi', 'email' => 'ketut.arimbi@gmail.com'],
            ['name' => 'I Nyoman Darma', 'email' => 'nyoman.darma@gmail.com'],
            ['name' => 'Sarah Chen', 'email' => 'sarah.chen@gmail.com'],
            ['name' => 'Michael Torres', 'email' => 'michael.torres@gmail.com'],
            ['name' => 'Emma Wilson', 'email' => 'emma.wilson@gmail.com'],
            ['name' => 'Yuki Tanaka', 'email' => 'yuki.tanaka@gmail.com'],
            ['name' => 'Putu Mega Sari', 'email' => 'mega.sari@gmail.com'],
            ['name' => 'I Gede Oka', 'email' => 'gede.oka@gmail.com'],
            ['name' => 'Lisa Müller', 'email' => 'lisa.muller@gmail.com'],
            ['name' => 'David Park', 'email' => 'david.park@gmail.com'],
            ['name' => 'Ni Made Ratih', 'email' => 'made.ratih@gmail.com'],
            ['name' => 'Ketut Budi Santoso', 'email' => 'budi.santoso@gmail.com'],
        ];

        $customers = [];
        foreach ($customerData as $data) {
            $customer = Customer::updateOrCreate(
                ['email' => $data['email']],
                [
                    ...$data,
                    'password' => bcrypt('password'),
                    'referral_code' => strtoupper(Str::random(8)),
                    'referral_balance' => 0,
                    'email_verified_at' => now(),
                ],
            );
            $customers[] = $customer;
        }

        return $customers;
    }

    private function seedOrders(array $customers, array $events, array $vouchers, $addons, $admin): array
    {
        $now = Carbon::now();
        $pastEvents = collect($events)->where('status', 'published')->filter(fn ($e) => Carbon::parse($e->start_date)->isPast());
        $upcomingEvents = collect($events)->where('status', 'published')->filter(fn ($e) => Carbon::parse($e->start_date)->isFuture());

        $orders = [];
        $orderCount = 0;

        // ─── Past events: confirmed orders (simulating completed events)
        foreach ($pastEvents as $event) {
            $eventCatalogs = $event->catalogs;
            if ($eventCatalogs->isEmpty()) continue;

            // 8-12 confirmed orders per past event
            $attendees = array_slice($customers, 0, rand(8, min(12, count($customers))));
            foreach ($attendees as $customer) {
                $catalog = $eventCatalogs->random();
                $catalogPrice = $catalog->price * 100; // store in cents-like value
                $orderAddons = $addons->random(rand(0, 2));
                $addonsTotal = $orderAddons->sum('price') * 100;

                $voucherDiscount = 0;
                $voucherId = null;

                // ~30% of orders use a voucher
                if (rand(1, 10) <= 3 && !empty($vouchers)) {
                    $voucher = $vouchers[0]; // WELCOME20
                    $voucherId = $voucher->id;
                    $voucherDiscount = $voucher->type === 'percentage'
                        ? min(($catalogPrice + $addonsTotal) * $voucher->value / 100, ($voucher->max_discount ?? PHP_INT_MAX) * 100)
                        : $voucher->value * 100;
                }

                $total = max(0, $catalogPrice + $addonsTotal - $voucherDiscount);
                $confirmedAt = Carbon::parse($event->start_date)->subDays(rand(3, 10));

                $order = Order::create([
                    'order_code' => 'ORD-' . Carbon::parse($event->start_date)->format('Ymd') . '-' . str_pad(++$orderCount, 4, '0', STR_PAD_LEFT),
                    'customer_id' => $customer->id,
                    'event_id' => $event->id,
                    'catalog_id' => $catalog->id,
                    'catalog_price' => $catalogPrice,
                    'addons_total' => $addonsTotal,
                    'referral_discount' => 0,
                    'balance_used' => 0,
                    'voucher_id' => $voucherId,
                    'voucher_discount' => $voucherDiscount,
                    'total_amount' => $total,
                    'status' => 'confirmed',
                    'paid_at' => $confirmedAt->copy()->subDays(1),
                    'confirmed_at' => $confirmedAt,
                    'confirmed_by' => $admin->id,
                    'notes' => null,
                ]);

                // Attach addons to order pivot
                foreach ($orderAddons as $addon) {
                    $order->addons()->attach($addon->id, [
                        'addon_name' => $addon->name,
                        'addon_price' => $addon->price * 100,
                    ]);
                }

                $orders[] = $order;
            }
        }

        // ─── Upcoming events: mix of statuses
        foreach ($upcomingEvents as $event) {
            $eventCatalogs = $event->catalogs;
            if ($eventCatalogs->isEmpty()) continue;

            $attendees = array_slice($customers, 2, rand(5, min(10, count($customers) - 2)));
            foreach ($attendees as $index => $customer) {
                $catalog = $eventCatalogs->random();
                $catalogPrice = $catalog->price * 100;
                $orderAddons = $addons->random(rand(0, 2));
                $addonsTotal = $orderAddons->sum('price') * 100;

                // Vary the statuses for upcoming events
                $statusPool = ['confirmed', 'confirmed', 'confirmed', 'waiting', 'waiting', 'pending', 'cancelled'];
                $status = $statusPool[array_rand($statusPool)];

                $createdDaysAgo = rand(1, 14);
                $paidAt = null;
                $confirmedAt = null;
                $confirmedBy = null;

                if (in_array($status, ['confirmed', 'waiting'])) {
                    $paidAt = $now->copy()->subDays($createdDaysAgo);
                }
                if ($status === 'confirmed') {
                    $confirmedAt = $now->copy()->subDays($createdDaysAgo - 1);
                    $confirmedBy = $admin->id;
                }

                $total = max(0, $catalogPrice + $addonsTotal);

                $order = Order::create([
                    'order_code' => 'ORD-' . $now->format('Ymd') . '-' . str_pad(++$orderCount, 4, '0', STR_PAD_LEFT),
                    'customer_id' => $customer->id,
                    'event_id' => $event->id,
                    'catalog_id' => $catalog->id,
                    'catalog_price' => $catalogPrice,
                    'addons_total' => $addonsTotal,
                    'referral_discount' => 0,
                    'balance_used' => 0,
                    'voucher_id' => null,
                    'voucher_discount' => 0,
                    'total_amount' => $total,
                    'status' => $status,
                    'paid_at' => $paidAt,
                    'confirmed_at' => $confirmedAt,
                    'confirmed_by' => $confirmedBy,
                    'notes' => $status === 'cancelled' ? 'Tidak bisa hadir karena perubahan jadwal.' : null,
                ]);

                foreach ($orderAddons as $addon) {
                    $order->addons()->attach($addon->id, [
                        'addon_name' => $addon->name,
                        'addon_price' => $addon->price * 100,
                    ]);
                }

                $orders[] = $order;
            }
        }

        // ─── A few rejected orders for realism
        if ($upcomingEvents->isNotEmpty()) {
            $event = $upcomingEvents->first();
            $eventCatalogs = $event->catalogs;
            if ($eventCatalogs->isNotEmpty()) {
                foreach (array_slice($customers, -2) as $customer) {
                    $catalog = $eventCatalogs->first();
                    $order = Order::create([
                        'order_code' => 'ORD-' . $now->format('Ymd') . '-' . str_pad(++$orderCount, 4, '0', STR_PAD_LEFT),
                        'customer_id' => $customer->id,
                        'event_id' => $event->id,
                        'catalog_id' => $catalog->id,
                        'catalog_price' => $catalog->price * 100,
                        'addons_total' => 0,
                        'referral_discount' => 0,
                        'balance_used' => 0,
                        'voucher_id' => null,
                        'voucher_discount' => 0,
                        'total_amount' => $catalog->price * 100,
                        'status' => 'rejected',
                        'paid_at' => $now->copy()->subDays(3),
                        'confirmed_by' => $admin->id,
                        'rejection_reason' => 'Bukti pembayaran tidak valid. Silakan upload ulang.',
                        'notes' => null,
                    ]);
                    $orders[] = $order;
                }
            }
        }

        return $orders;
    }

    private function seedCheckIns(array $orders, array $events): void
    {
        $pastEvents = collect($events)->filter(fn ($e) => Carbon::parse($e->start_date)->isPast());
        $pastEventIds = $pastEvents->pluck('id')->toArray();

        $confirmedPastOrders = collect($orders)
            ->where('status', 'confirmed')
            ->whereIn('event_id', $pastEventIds);

        // ~80% of confirmed past orders checked in
        $checkInCount = (int) ($confirmedPastOrders->count() * 0.8);
        $toCheckIn = $confirmedPastOrders->random(min($checkInCount, $confirmedPastOrders->count()));

        foreach ($toCheckIn as $order) {
            $event = $pastEvents->firstWhere('id', $order->event_id);
            $checkInTime = Carbon::parse($event->start_date)->addHours(rand(6, 8))->addMinutes(rand(0, 30));

            $order->update(['checked_in_at' => $checkInTime]);

            // Per-session attendance
            $schedule = $event->schedule ?? [];
            foreach ($schedule as $index => $session) {
                // ~90% chance of attending each session
                if (rand(1, 10) <= 9) {
                    SessionAttendance::create([
                        'order_id' => $order->id,
                        'session_index' => $index,
                        'checked_in_at' => $checkInTime->copy()->addMinutes($index * 90),
                    ]);
                }
            }
        }
    }

    private function seedReferrals(array $customers, array $orders): void
    {
        // Pick 3 customers as active referrers
        $referrers = array_slice($customers, 0, 3);

        foreach ($referrers as $referrer) {
            // Each referrer referred 2-3 people
            $referredOrders = collect($orders)
                ->where('status', 'confirmed')
                ->whereNotIn('customer_id', [$referrer->id])
                ->random(min(rand(2, 3), collect($orders)->where('status', 'confirmed')->count()));

            $totalCredit = 0;
            foreach ($referredOrders as $order) {
                $order->update(['referred_by' => $referrer->id]);
                $totalCredit += 10000; // Rp 10,000 per referral
            }

            $referrer->update([
                'referral_balance' => $referrer->referral_balance + $totalCredit,
            ]);
        }

        // Add loyalty credits for checked-in customers
        $checkedInOrders = collect($orders)->whereNotNull('checked_in_at');
        foreach ($checkedInOrders as $order) {
            $customer = collect($customers)->firstWhere('id', $order->customer_id);
            if ($customer) {
                $customer->update([
                    'referral_balance' => $customer->referral_balance + 1000, // Rp 1,000 attendance credit
                ]);
            }
        }
    }

    private function seedTestimonials(array $orders): void
    {
        $testimonialTexts = [
            ['rating' => 5, 'body' => 'Pengalaman yang luar biasa! Instrukturnya sangat sabar dan penuh perhatian. Pasti akan ikut lagi.'],
            ['rating' => 5, 'body' => 'Sound bath-nya benar-benar membawa saya ke level relaksasi yang belum pernah saya rasakan. Highly recommended!'],
            ['rating' => 4, 'body' => 'Kelas yang sangat bagus. Lokasi indah dan suasana tenang. Hanya saja parkir agak sulit.'],
            ['rating' => 5, 'body' => 'Ini kelas yoga terbaik yang pernah saya ikuti di Bali. Made Surya benar-benar guru yang inspiratif.'],
            ['rating' => 4, 'body' => 'Sesi meditasinya sangat membantu mengurangi stres saya. Terima kasih Kawakib!'],
            ['rating' => 5, 'body' => 'Amazing experience from start to finish. The beach setting made the morning yoga truly magical.'],
            ['rating' => 3, 'body' => 'Kelasnya bagus tapi ruangan terlalu penuh. Mungkin bisa dibatasi pesertanya agar lebih nyaman.'],
            ['rating' => 5, 'body' => 'The healing sound therapy was life-changing. I felt completely renewed afterward. Thank you!'],
            ['rating' => 4, 'body' => 'Sangat worth it! Materinya lengkap dan bisa diakses setelah kelas selesai. Sangat membantu untuk latihan di rumah.'],
            ['rating' => 5, 'body' => 'Sertifikatnya keren dan profesional. Overall pengalaman yang sangat berkesan.'],
        ];

        $checkedInOrders = collect($orders)->whereNotNull('checked_in_at')->values();

        // ~70% of checked-in attendees leave testimonials
        $count = (int) ($checkedInOrders->count() * 0.7);
        $toTestimonial = $checkedInOrders->random(min($count, $checkedInOrders->count()));

        foreach ($toTestimonial->values() as $i => $order) {
            $text = $testimonialTexts[$i % count($testimonialTexts)];

            Testimonial::updateOrCreate(
                ['order_id' => $order->id],
                [
                    'customer_id' => $order->customer_id,
                    'event_id' => $order->event_id,
                    'catalog_id' => $order->catalog_id,
                    'rating' => $text['rating'],
                    'body' => $text['body'],
                    'is_highlighted' => $i < 4, // highlight top 4
                ],
            );
        }
    }

    private function seedSurveys(array $events, array $orders): void
    {
        $pastEvents = collect($events)->filter(fn ($e) => Carbon::parse($e->start_date)->isPast());

        foreach ($pastEvents as $event) {
            $survey = Survey::updateOrCreate(
                ['event_id' => $event->id],
                [
                    'title' => "Survey: {$event->name}",
                    'description' => 'Bantu kami meningkatkan kualitas event dengan mengisi survey singkat ini.',
                    'slug' => Str::slug($event->name) . '-survey',
                    'is_active' => true,
                    'questions' => [
                        [
                            'id' => 'nps',
                            'type' => 'nps',
                            'label' => 'Seberapa besar kemungkinan Anda merekomendasikan event ini kepada teman atau kolega?',
                            'required' => true,
                        ],
                        [
                            'id' => 'overall_rating',
                            'type' => 'rating',
                            'label' => 'Bagaimana penilaian Anda secara keseluruhan terhadap event ini?',
                            'required' => true,
                        ],
                        [
                            'id' => 'favorite_part',
                            'type' => 'multiple_choice',
                            'label' => 'Bagian mana yang paling Anda sukai?',
                            'options' => ['Materi/konten', 'Instruktur/pembicara', 'Lokasi/venue', 'Suasana', 'Networking'],
                            'required' => false,
                        ],
                        [
                            'id' => 'improvement',
                            'type' => 'text',
                            'label' => 'Apa yang bisa kami tingkatkan untuk event berikutnya?',
                            'required' => false,
                        ],
                    ],
                ],
            );

            // Survey responses from checked-in orders
            $eventOrders = collect($orders)
                ->where('event_id', $event->id)
                ->whereNotNull('checked_in_at')
                ->values();

            // ~60% of checked-in attendees fill survey
            $count = (int) ($eventOrders->count() * 0.6);
            $respondents = $eventOrders->random(min($count, $eventOrders->count()));

            $improvements = [
                'Mungkin bisa ditambahkan sesi tanya jawab yang lebih panjang.',
                'Parkir perlu diperbaiki.',
                'Sudah sangat bagus, tidak ada yang perlu diubah!',
                'Akan lebih baik jika ada snack break.',
                'Mungkin bisa dimulai sedikit lebih siang.',
                'Sound system bisa lebih baik.',
            ];

            foreach ($respondents->values() as $i => $order) {
                $nps = collect([6, 7, 8, 8, 9, 9, 9, 10, 10, 10])->random();

                SurveyResponse::updateOrCreate(
                    ['survey_id' => $survey->id, 'order_id' => $order->id],
                    [
                        'customer_id' => $order->customer_id,
                        'nps_score' => $nps,
                        'answers' => [
                            'nps' => $nps,
                            'overall_rating' => rand(3, 5),
                            'favorite_part' => collect(['Materi/konten', 'Instruktur/pembicara', 'Lokasi/venue', 'Suasana'])->random(),
                            'improvement' => $improvements[$i % count($improvements)],
                        ],
                        'submitted_at' => Carbon::parse($event->end_date)->addDays(rand(1, 3)),
                    ],
                );
            }
        }
    }

    private function seedEventMaterials(array $events): void
    {
        $pastEvents = collect($events)->filter(fn ($e) => Carbon::parse($e->start_date)->isPast());

        foreach ($pastEvents as $event) {
            $catalogs = $event->catalogs;
            $endDate = Carbon::parse($event->end_date);

            // Global event materials
            EventMaterial::updateOrCreate(
                ['event_id' => $event->id, 'title' => 'Slide Presentasi'],
                [
                    'catalog_id' => null,
                    'type' => 'link',
                    'content' => 'https://docs.google.com/presentation/d/example-' . Str::slug($event->name),
                    'available_from' => $endDate,
                    'available_until' => $endDate->copy()->addDays(30),
                ],
            );

            EventMaterial::updateOrCreate(
                ['event_id' => $event->id, 'title' => 'Rekaman Sesi'],
                [
                    'catalog_id' => null,
                    'type' => 'video',
                    'content' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                    'available_from' => $endDate->copy()->addDay(),
                    'available_until' => $endDate->copy()->addDays(60),
                ],
            );

            // Per-catalog material
            if ($catalogs->isNotEmpty()) {
                $catalog = $catalogs->first();
                EventMaterial::updateOrCreate(
                    ['event_id' => $event->id, 'title' => "Panduan Latihan - {$catalog->name}"],
                    [
                        'catalog_id' => $catalog->id,
                        'type' => 'link',
                        'content' => 'https://docs.google.com/document/d/example-guide-' . Str::slug($catalog->name),
                        'available_from' => $endDate,
                        'available_until' => null,
                    ],
                );
            }
        }
    }

    private function seedCampaigns(): void
    {
        $now = Carbon::now();
        $templates = MailTemplate::all();
        $announcementTemplate = $templates->where('slug', 'event-announcement')->first();
        $thankYouTemplate = $templates->where('slug', 'post-event-thank-you')->first();

        if ($announcementTemplate) {
            Campaign::updateOrCreate(
                ['name' => 'Re-engage Lapsed Customers'],
                [
                    'target_tags' => ['lapsed', 'inactive'],
                    'mail_template_id' => $announcementTemplate->id,
                    'sent_count' => 12,
                    'sent_at' => $now->copy()->subDays(7),
                ],
            );
        }

        if ($thankYouTemplate) {
            Campaign::updateOrCreate(
                ['name' => 'Thank You — Loyal Members'],
                [
                    'target_tags' => ['loyal', 'active'],
                    'mail_template_id' => $thankYouTemplate->id,
                    'sent_count' => 5,
                    'sent_at' => $now->copy()->subDays(14),
                ],
            );
        }

        if ($announcementTemplate) {
            Campaign::updateOrCreate(
                ['name' => 'Weekend Retreat Promo'],
                [
                    'target_tags' => ['active', 'returning'],
                    'mail_template_id' => $announcementTemplate->id,
                    'sent_count' => 0,
                    'sent_at' => null, // draft campaign, not yet sent
                ],
            );
        }
    }

    private function seedWaitlist(array $events, array $customers): void
    {
        // Find an upcoming event and create waitlist entries for it
        $upcomingEvent = collect($events)
            ->where('status', 'published')
            ->filter(fn ($e) => Carbon::parse($e->start_date)->isFuture())
            ->first();

        if (!$upcomingEvent) return;

        $catalogs = $upcomingEvent->catalogs;
        if ($catalogs->isEmpty()) return;

        $catalog = $catalogs->first();

        // Pick a few customers who don't have orders for this event
        $existingCustomerIds = Order::where('event_id', $upcomingEvent->id)->pluck('customer_id')->toArray();
        $waitlistCustomers = collect($customers)
            ->whereNotIn('id', $existingCustomerIds)
            ->take(4);

        $position = 1;
        foreach ($waitlistCustomers as $customer) {
            Waitlist::updateOrCreate(
                [
                    'customer_id' => $customer->id,
                    'event_id' => $upcomingEvent->id,
                    'catalog_id' => $catalog->id,
                ],
                [
                    'position' => $position++,
                    'notified_at' => null,
                ],
            );
        }
    }

    private function seedAnnouncements(array $events): void
    {
        $pastEvents = collect($events)->filter(fn ($e) => Carbon::parse($e->start_date)->isPast());

        foreach ($pastEvents as $event) {
            $checkedInCount = Order::where('event_id', $event->id)->whereNotNull('checked_in_at')->count();

            if ($checkedInCount > 0) {
                EventAnnouncement::updateOrCreate(
                    ['event_id' => $event->id, 'subject' => 'Terima kasih sudah hadir!'],
                    [
                        'message' => "Terima kasih telah hadir di {$event->name}! Jangan lupa untuk mengisi survey dan download sertifikat Anda. Sampai jumpa di event berikutnya!",
                        'sent_count' => $checkedInCount,
                        'sent_at' => Carbon::parse($event->end_date)->addDay(),
                    ],
                );
            }
        }
    }
}
