<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WaitlistSpotAvailableMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $customerName,
        public string $eventName,
        public string $catalogName,
        public string $eventUrl,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "A spot just opened up for {$this->eventName}!",
        );
    }

    public function content(): Content
    {
        $body = '<h2>Good News!</h2>'
            . "<p>Hi {$this->customerName},</p>"
            . "<p>A spot has opened up for <strong>{$this->eventName}</strong> — {$this->catalogName}.</p>"
            . '<p>Register now before it fills up again:</p>'
            . "<p><a href=\"{$this->eventUrl}\">Register Now</a></p>"
            . '<p>First come, first served!</p>';

        return new Content(
            view: 'emails.template',
            with: ['body' => $body],
        );
    }
}
