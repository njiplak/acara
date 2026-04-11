<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EventReminderMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $customerName,
        public string $eventName,
        public string $eventDate,
        public string $venueName,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Reminder: {$this->eventName} is Coming Up!",
        );
    }

    public function content(): Content
    {
        $body = '<h2>Event Reminder</h2>'
            . "<p>Hi {$this->customerName},</p>"
            . "<p>This is a friendly reminder that <strong>{$this->eventName}</strong> is happening on <strong>{$this->eventDate}</strong>.</p>"
            . "<p><strong>Venue:</strong> {$this->venueName}</p>"
            . '<p>We look forward to seeing you there!</p>';

        return new Content(
            view: 'emails.template',
            with: ['body' => $body],
        );
    }
}
