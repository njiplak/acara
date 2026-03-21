<?php

namespace App\Service\Payment\DTO;

final readonly class WebhookResult
{
    public function __construct(
        public string $gatewayTransactionId,
        public string $status,
        public ?int $amount = null,
        public ?string $method = null,
        public ?int $gatewayFee = null,
        public array $rawPayload = [],
    ) {}
}
