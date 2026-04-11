<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderPlacedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Order $order,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Order #{$this->order->order_code} Confirmed",
        );
    }

    public function content(): Content
    {
        $order = $this->order;
        $order->loadMissing(['customer', 'event']);

        $body = '<h2>Order Confirmation</h2>'
            . "<p>Hi {$order->customer->name},</p>"
            . '<p>Thank you for your order! Here are the details:</p>'
            . "<p><strong>Order Number:</strong> {$order->order_code}"
            . "<br><strong>Event:</strong> {$order->event->name}"
            . '<br><strong>Total:</strong> Rp ' . number_format($order->total_amount, 0, ',', '.') . '</p>'
            . '<p>We will notify you once your payment is confirmed.</p>';

        return new Content(
            view: 'emails.template',
            with: ['body' => $body],
        );
    }
}
