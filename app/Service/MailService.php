<?php

namespace App\Service;

use App\Mail\TemplateMail;
use App\Models\MailLog;
use App\Models\MailTemplate;
use App\Models\Order;
use Illuminate\Support\Facades\Mail;

class MailService
{
    public static function send(
        string $slug,
        string $to,
        array $data = [],
        ?int $orderId = null,
        ?int $eventId = null,
    ): void {
        $template = MailTemplate::where('slug', $slug)
            ->where('is_active', true)
            ->first();

        if (!$template) {
            return;
        }

        // Dedup: skip if already sent for this template+recipient+order combo
        $exists = MailLog::where('mail_template_id', $template->id)
            ->where('recipient_email', $to)
            ->where('order_id', $orderId)
            ->exists();

        if ($exists) {
            return;
        }

        Mail::to($to)->queue(new TemplateMail($template, $data));

        MailLog::create([
            'mail_template_id' => $template->id,
            'recipient_email' => $to,
            'order_id' => $orderId,
            'event_id' => $eventId,
            'sent_at' => now(),
        ]);
    }

    public static function sendForOrder(string $slug, Order $order, array $extraData = []): void
    {
        $order->loadMissing(['customer', 'event.venue']);

        $data = array_merge([
            'customer_name' => $order->customer->name,
            'order_number' => $order->order_code,
            'event_name' => $order->event->name,
            'total_amount' => 'Rp ' . number_format($order->total_amount, 0, ',', '.'),
        ], $extraData);

        static::send(
            slug: $slug,
            to: $order->customer->email,
            data: $data,
            orderId: $order->id,
            eventId: $order->event_id,
        );
    }
}
