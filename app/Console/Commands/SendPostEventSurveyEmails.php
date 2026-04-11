<?php

namespace App\Console\Commands;

use App\Mail\PostEventSurveyMail;
use App\Models\Event;
use App\Models\Order;
use App\Models\Survey;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

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
                Mail::to($order->customer->email)->queue(new PostEventSurveyMail(
                    customerName: $order->customer->name,
                    eventName: $event->name,
                    surveyUrl: $surveyUrl,
                ));

                $sent++;
            }
        }

        $this->info("Sent {$sent} post-event survey email(s).");
    }
}
