<?php

namespace App\Console\Commands;

use App\Models\Event;
use App\Models\Order;
use App\Service\MailService;
use Illuminate\Console\Command;

class SendEventReminders extends Command
{
    protected $signature = 'mail:send-event-reminders';

    protected $description = 'Send event reminder emails to confirmed attendees (D-3 and D-1)';

    public function handle(): void
    {
        $reminderDates = [
            now()->addDays(3)->toDateString(),
            now()->addDays(1)->toDateString(),
        ];

        $events = Event::with('venue')
            ->where('status', 'published')
            ->whereIn('start_date', $reminderDates)
            ->get();

        if ($events->isEmpty()) {
            $this->info('No events found for reminder dates.');
            return;
        }

        $sent = 0;

        foreach ($events as $event) {
            $orders = Order::with('customer')
                ->where('event_id', $event->id)
                ->where('status', 'confirmed')
                ->get();

            foreach ($orders as $order) {
                MailService::send(
                    slug: 'order-reminder',
                    to: $order->customer->email,
                    data: [
                        'customer_name' => $order->customer->name,
                        'event_name' => $event->name,
                        'event_date' => $event->start_date,
                        'venue_name' => $event->venue?->name ?? '-',
                    ],
                    orderId: $order->id,
                    eventId: $event->id,
                );

                $sent++;
            }
        }

        $this->info("Sent {$sent} event reminder(s).");
    }
}
