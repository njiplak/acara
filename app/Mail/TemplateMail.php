<?php

namespace App\Mail;

use App\Models\MailTemplate;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TemplateMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $renderedBody;

    public function __construct(
        protected MailTemplate $template,
        protected array $data = [],
    ) {
        $this->renderedBody = $this->template->renderBody($this->data);
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->template->renderSubject($this->data),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.template',
            with: [
                'body' => $this->renderedBody,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
