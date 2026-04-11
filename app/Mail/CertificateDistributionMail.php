<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CertificateDistributionMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $customerName,
        public string $eventName,
        public string $certificateUrl,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Your Certificate for {$this->eventName}",
        );
    }

    public function content(): Content
    {
        $body = '<h2>Your Certificate is Ready!</h2>'
            . "<p>Hi {$this->customerName},</p>"
            . "<p>Thank you for attending <strong>{$this->eventName}</strong>. Your certificate of attendance is now available for download.</p>"
            . "<p><a href=\"{$this->certificateUrl}\">Download Your Certificate</a></p>"
            . '<p>We hope to see you at future events!</p>';

        return new Content(
            view: 'emails.template',
            with: ['body' => $body],
        );
    }
}
