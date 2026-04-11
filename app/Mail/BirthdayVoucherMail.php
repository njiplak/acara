<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BirthdayVoucherMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $customerName,
        public string $voucherCode,
        public string $voucherValue,
        public string $validUntil,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Happy Birthday, {$this->customerName}!",
        );
    }

    public function content(): Content
    {
        $body = '<h2>Happy Birthday!</h2>'
            . "<p>Hi {$this->customerName},</p>"
            . '<p>Wishing you a wonderful birthday! As a special gift, here is a discount code just for you:</p>'
            . '<p style="text-align:center;font-size:24px;font-weight:bold;letter-spacing:2px;padding:16px;background:#f5f5f5;border-radius:8px;">'
            . $this->voucherCode . '</p>'
            . "<p><strong>Discount:</strong> {$this->voucherValue}"
            . "<br><strong>Valid until:</strong> {$this->validUntil}</p>"
            . '<p>Use this code on your next order. Enjoy your special day!</p>';

        return new Content(
            view: 'emails.template',
            with: ['body' => $body],
        );
    }
}
