<?php

namespace App\Service\Payment\DTO;

use Carbon\CarbonImmutable;

final readonly class TransactionStatus
{
    public function __construct(
        public string $status,
        public ?CarbonImmutable $paidAt = null,
        public ?string $method = null,
        public array $rawPayload = [],
    ) {}
}
