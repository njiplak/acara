<?php

namespace App\Console\Commands;

use App\Models\Event;
use App\Models\Order;
use App\Models\Survey;
use App\Service\MailService;
use Illuminate\Console\Command;

class SendPostEventSurveyEmails extends Command
{
    protected $signature = 'mail:send-post-event-survey';

    protected $description = 'Send post-event survey emails to checked-in attendees';

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
            $survey = Survey::where('event_id', $event->id)
                ->where('is_active', true)
                ->first();

            if (!$survey) {
                continue;
            }

            $surveyUrl = url("/customer/survey/{$survey->slug}");

            $orders = Order::with('customer')
                ->where('event_id', $event->id)
                ->where('status', 'confirmed')
                ->whereNotNull('checked_in_at')
                ->get();

            foreach ($orders as $order) {
                MailService::send(
                    slug: 'post-event-survey',
                    to: $order->customer->email,
                    data: [
                        'customer_name' => $order->customer->name,
                        'event_name' => $event->name,
                        'survey_url' => $surveyUrl,
                    ],
                    orderId: $order->id,
                    eventId: $event->id,
                );

                $sent++;
            }
        }

        $this->info("Sent {$sent} post-event survey email(s).");
    }
}
