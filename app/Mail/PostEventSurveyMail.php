<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PostEventSurveyMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $customerName,
        public string $eventName,
        public string $surveyUrl,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Share Your Feedback for {$this->eventName}",
        );
    }

    public function content(): Content
    {
        $body = '<h2>We Value Your Feedback!</h2>'
            . "<p>Hi {$this->customerName},</p>"
            . "<p>Thank you for attending <strong>{$this->eventName}</strong>. We'd love to hear about your experience!</p>"
            . '<p>Please take a moment to fill out our survey:</p>'
            . "<p><a href=\"{$this->surveyUrl}\">Take the Survey</a></p>"
            . '<p>Your feedback helps us improve future events.</p>';

        return new Content(
            view: 'emails.template',
            with: ['body' => $body],
        );
    }
}
