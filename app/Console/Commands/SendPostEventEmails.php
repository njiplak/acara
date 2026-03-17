<?php

namespace App\Console\Commands;

use App\Models\Event;
use App\Models\Order;
use App\Service\MailService;
use Illuminate\Console\Command;

class SendPostEventEmails extends Command
{
    protected $signature = 'mail:send-post-event-emails';

    protected $description = 'Send post-event thank you emails to checked-in attendees';

    public function handle(): void
    {
        $yesterday = now()->subDay()->toDateString();

        $events = Event::where('status', 'published')
            ->where('end_date', $yesterday)
            ->get();

        if ($events->isEmpty()) {
            $this->info('No events ended yesterday.');
            return;
        }

        $sent = 0;

        foreach ($events as $event) {
            $orders = Order::with('customer')
                ->where('event_id', $event->id)
                ->where('status', 'confirmed')
                ->whereNotNull('checked_in_at')
                ->get();

            foreach ($orders as $order) {
                MailService::send(
                    slug: 'post-event-thank-you',
                    to: $order->customer->email,
                    data: [
                        'customer_name' => $order->customer->name,
                        'event_name' => $event->name,
                    ],
                    orderId: $order->id,
                    eventId: $event->id,
                );

                $sent++;
            }
        }

        $this->info("Sent {$sent} post-event email(s).");
    }
}
