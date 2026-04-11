<?php

namespace App\Console\Commands;

use App\Mail\EventReminderMail;
use App\Models\Event;
use App\Models\Order;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

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
                Mail::to($order->customer->email)->queue(new EventReminderMail(
                    customerName: $order->customer->name,
                    eventName: $event->name,
                    eventDate: $event->start_date,
                    venueName: $event->venue?->name ?? '-',
                ));

                $sent++;
            }
        }

        $this->info("Sent {$sent} event reminder(s).");
    }
}
