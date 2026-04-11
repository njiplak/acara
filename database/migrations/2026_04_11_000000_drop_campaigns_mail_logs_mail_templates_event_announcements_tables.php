<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Drop in dependency order: campaigns references mail_templates,
        // mail_logs references mail_templates and campaigns
        Schema::dropIfExists('mail_logs');
        Schema::dropIfExists('campaigns');
        Schema::dropIfExists('mail_templates');
        Schema::dropIfExists('event_announcements');
    }

    public function down(): void
    {
        // Not reversible — these features have been removed.
    }
};
