<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PaymentConfirmedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Order $order,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Payment Confirmed for Order #{$this->order->order_code}",
        );
    }

    public function content(): Content
    {
        $order = $this->order;
        $order->loadMissing(['customer', 'event']);

        $body = '<h2>Payment Confirmed</h2>'
            . "<p>Hi {$order->customer->name},</p>"
            . "<p>Your payment for order <strong>#{$order->order_code}</strong> has been confirmed.</p>"
            . "<p><strong>Event:</strong> {$order->event->name}"
            . '<br><strong>Amount Paid:</strong> Rp ' . number_format($order->total_amount, 0, ',', '.') . '</p>'
            . '<p>We look forward to seeing you at the event!</p>';

        return new Content(
            view: 'emails.template',
            with: ['body' => $body],
        );
    }
}
