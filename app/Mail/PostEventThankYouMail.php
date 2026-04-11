<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PostEventThankYouMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $customerName,
        public string $eventName,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Thank You for Attending {$this->eventName}!",
        );
    }

    public function content(): Content
    {
        $body = '<h2>Thank You!</h2>'
            . "<p>Hi {$this->customerName},</p>"
            . "<p>Thank you for attending <strong>{$this->eventName}</strong>. We hope you had a great experience!</p>"
            . '<p>We\'d love to hear your feedback — your thoughts help us make future events even better.</p>'
            . '<p>See you at the next event!</p>';

        return new Content(
            view: 'emails.template',
            with: ['body' => $body],
        );
    }
}
