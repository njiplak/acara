<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Campaign extends Model
{
    protected $fillable = [
        'name',
        'target_tags',
        'mail_template_id',
        'sent_count',
        'sent_at',
    ];

    protected function casts(): array
    {
        return [
            'target_tags' => 'array',
            'sent_at' => 'datetime',
        ];
    }

    public function mailTemplate(): BelongsTo
    {
        return $this->belongsTo(MailTemplate::class);
    }

    public function isSent(): bool
    {
        return $this->sent_at !== null;
    }
}
