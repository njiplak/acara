<?php

namespace App\Console\Commands;

use App\Models\Event;
use App\Models\Order;
use App\Service\MailService;
use Illuminate\Console\Command;

class SendCertificateEmails extends Command
{
    protected $signature = 'mail:send-certificates';

    protected $description = 'Send certificate download emails to checked-in attendees the day after event ends';

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
                $certificateUrl = url("/customer/orders/{$order->id}/certificate");

                MailService::send(
                    slug: 'certificate-distribution',
                    to: $order->customer->email,
                    data: [
                        'customer_name' => $order->customer->name,
                        'event_name' => $event->name,
                        'certificate_url' => $certificateUrl,
                    ],
                    orderId: $order->id,
                    eventId: $event->id,
                );

                $sent++;
            }
        }

        $this->info("Sent {$sent} certificate email(s).");
    }
}
