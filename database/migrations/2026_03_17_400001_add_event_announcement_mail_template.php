<?php

use App\Models\MailTemplate;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        MailTemplate::updateOrCreate(
            ['slug' => 'event-announcement'],
            [
                'name' => 'Event Announcement',
                'subject' => '{{subject}}',
                'body' => '<h2>{{subject}}</h2><p>Hi {{customer_name}},</p><p>{{message}}</p><p>Regarding event: <strong>{{event_name}}</strong></p>',
                'variables' => ['customer_name', 'event_name', 'subject', 'message'],
                'is_active' => true,
            ],
        );
    }

    public function down(): void
    {
        MailTemplate::where('slug', 'event-announcement')->delete();
    }
};
