<?php

namespace App\Service\Payment\DTO;

use Carbon\CarbonImmutable;

final readonly class PaymentResult
{
    public function __construct(
        public string $gatewayTransactionId,
        public string $status,
        public ?string $redirectUrl = null,
        public ?string $paymentReference = null,
        public ?CarbonImmutable $expiresAt = null,
        public array $rawPayload = [],
        public ?string $method = null,
    ) {}
}
