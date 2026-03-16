<?php

namespace App\Service;

use App\Mail\TemplateMail;
use App\Models\MailTemplate;
use Illuminate\Support\Facades\Mail;

class MailService
{
    public static function send(string $slug, string $to, array $data = []): void
    {
        $template = MailTemplate::where('slug', $slug)
            ->where('is_active', true)
            ->first();

        if (!$template) {
            return;
        }

        Mail::to($to)->send(new TemplateMail($template, $data));
    }
}
