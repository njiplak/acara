<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderRejectedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Order $order,
        public string $rejectionReason,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Order #{$this->order->order_code} Update",
        );
    }

    public function content(): Content
    {
        $order = $this->order;
        $order->loadMissing('customer');

        $body = '<h2>Order Update</h2>'
            . "<p>Hi {$order->customer->name},</p>"
            . "<p>Unfortunately, your order <strong>#{$order->order_code}</strong> could not be processed.</p>"
            . "<p><strong>Reason:</strong> {$this->rejectionReason}</p>"
            . '<p>If you have any questions, please contact our support team.</p>';

        return new Content(
            view: 'emails.template',
            with: ['body' => $body],
        );
    }
}
