<?php

use App\Models\MailTemplate;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        MailTemplate::updateOrCreate(
            ['slug' => 'certificate-distribution'],
            [
                'name' => 'Certificate Distribution',
                'subject' => 'Your Certificate for {{event_name}}',
                'body' => '<h2>Your Certificate is Ready!</h2><p>Hi {{customer_name}},</p><p>Thank you for attending <strong>{{event_name}}</strong>. Your certificate of attendance is now available for download.</p><p><a href="{{certificate_url}}">Download Your Certificate</a></p><p>We hope to see you at future events!</p>',
                'variables' => ['customer_name', 'event_name', 'certificate_url'],
                'is_active' => true,
            ],
        );
    }

    public function down(): void
    {
        MailTemplate::where('slug', 'certificate-distribution')->delete();
    }
};
