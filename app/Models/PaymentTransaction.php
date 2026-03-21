<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PaymentTransaction extends Model
{
    protected $fillable = [
        'order_id',
        'gateway',
        'gateway_transaction_id',
        'gateway_reference',
        'method',
        'currency',
        'amount',
        'gateway_fee',
        'status',
        'raw_payload',
        'paid_at',
        'expires_at',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'raw_payload' => 'array',
            'metadata' => 'array',
            'paid_at' => 'datetime',
            'expires_at' => 'datetime',
            'amount' => 'integer',
            'gateway_fee' => 'integer',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function refunds(): HasMany
    {
        return $this->hasMany(PaymentRefund::class);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    public function scopeStale($query, int $minutes = 30)
    {
        return $query->where('status', 'pending')
            ->where('gateway', '!=', 'manual')
            ->where('created_at', '<', now()->subMinutes($minutes));
    }

    public function isTerminal(): bool
    {
        return in_array($this->status, ['paid', 'failed', 'expired', 'refunded']);
    }
}
