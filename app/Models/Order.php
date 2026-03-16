<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_code',
        'customer_id',
        'event_id',
        'catalog_id',
        'catalog_price',
        'addons_total',
        'referral_discount',
        'balance_used',
        'total_amount',
        'status',
        'payment_proof',
        'paid_at',
        'confirmed_at',
        'confirmed_by',
        'rejection_reason',
        'refunded_at',
        'refund_reason',
        'checked_in_at',
        'notes',
        'referred_by',
        'voucher_id',
        'voucher_discount',
    ];

    protected function casts(): array
    {
        return [
            'paid_at' => 'datetime',
            'confirmed_at' => 'datetime',
            'checked_in_at' => 'datetime',
            'refunded_at' => 'datetime',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function catalog(): BelongsTo
    {
        return $this->belongsTo(Catalog::class);
    }

    public function referrer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'referred_by');
    }

    public function confirmedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'confirmed_by');
    }

    public function voucher(): BelongsTo
    {
        return $this->belongsTo(Voucher::class);
    }

    public function testimonial(): HasOne
    {
        return $this->hasOne(Testimonial::class);
    }

    public function addons(): BelongsToMany
    {
        return $this->belongsToMany(Addon::class)->withPivot('addon_name', 'addon_price');
    }

    public static function generateOrderCode(): string
    {
        $date = now()->format('Ymd');
        $random = strtoupper(substr(bin2hex(random_bytes(2)), 0, 4));
        $code = "ORD-{$date}-{$random}";

        while (static::where('order_code', $code)->exists()) {
            $random = strtoupper(substr(bin2hex(random_bytes(2)), 0, 4));
            $code = "ORD-{$date}-{$random}";
        }

        return $code;
    }
}
