<?php

namespace App\Contract\Operational;

use App\Contract\BaseContract;

interface OrderContract extends BaseContract
{
    public function placeOrder(array $payloads): mixed;
    public function uploadPaymentProof(int $orderId, string $proofPath): mixed;
    public function confirmOrder(int $orderId, int $userId): mixed;
    public function rejectOrder(int $orderId, int $userId, string $reason): mixed;
    public function cancelOrder(int $orderId): mixed;
    public function refundOrder(int $orderId, int $userId, string $reason): mixed;
}
