<?php

use App\Models\MailTemplate;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        MailTemplate::updateOrCreate(
            ['slug' => 'post-event-survey'],
            [
                'name' => 'Post-Event Survey',
                'subject' => 'Share Your Feedback for {{event_name}}',
                'body' => '<h2>We Value Your Feedback!</h2><p>Hi {{customer_name}},</p><p>Thank you for attending <strong>{{event_name}}</strong>. We\'d love to hear about your experience!</p><p>Please take a moment to fill out our survey:</p><p><a href="{{survey_url}}">Take the Survey</a></p><p>Your feedback helps us improve future events.</p>',
                'variables' => ['customer_name', 'event_name', 'survey_url'],
                'is_active' => true,
            ],
        );
    }

    public function down(): void
    {
        MailTemplate::where('slug', 'post-event-survey')->delete();
    }
};
