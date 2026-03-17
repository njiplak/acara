<?php

use App\Models\MailTemplate;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        MailTemplate::updateOrCreate(
            ['slug' => 'waitlist-spot-available'],
            [
                'name' => 'Waitlist Spot Available',
                'subject' => 'A spot just opened up for {{event_name}}!',
                'body' => '<h2>Good News!</h2><p>Hi {{customer_name}},</p><p>A spot has opened up for <strong>{{event_name}}</strong> — {{catalog_name}}.</p><p>Register now before it fills up again:</p><p><a href="{{event_url}}">Register Now</a></p><p>First come, first served!</p>',
                'variables' => ['customer_name', 'event_name', 'catalog_name', 'event_url'],
                'is_active' => true,
            ],
        );
    }

    public function down(): void
    {
        MailTemplate::where('slug', 'waitlist-spot-available')->delete();
    }
};
