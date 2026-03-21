<?php

namespace App\Service\Payment\DTO;

final readonly class RefundResult
{
    public function __construct(
        public string $gatewayRefundId,
        public string $status,
        public int $amount,
        public array $rawPayload = [],
    ) {}
}
