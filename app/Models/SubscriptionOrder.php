<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubscriptionOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_code',
        'customer_id',
        'plan_id',
        'type',
        'amount',
        'pro_rate_credit',
        'payment_gateway',
        'status',
        'payment_proof',
        'paid_at',
        'confirmed_at',
        'confirmed_by',
        'rejection_reason',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'pro_rate_credit' => 'integer',
            'paid_at' => 'datetime',
            'confirmed_at' => 'datetime',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class, 'plan_id');
    }

    public function confirmedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'confirmed_by');
    }

    public static function generateOrderCode(): string
    {
        $date = now()->format('Ymd');
        $random = strtoupper(substr(bin2hex(random_bytes(3)), 0, 6));
        return "SUB-{$date}-{$random}";
    }
}
