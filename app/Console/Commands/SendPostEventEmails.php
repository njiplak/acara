<?php

namespace App\Console\Commands;

use App\Mail\PostEventThankYouMail;
use App\Models\Event;
use App\Models\Order;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

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
                Mail::to($order->customer->email)->queue(new PostEventThankYouMail(
                    customerName: $order->customer->name,
                    eventName: $event->name,
                ));

                $sent++;
            }
        }

        $this->info("Sent {$sent} post-event email(s).");
    }
}
