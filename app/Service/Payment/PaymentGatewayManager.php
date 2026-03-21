<?php

namespace App\Service\Payment;

use App\Contract\Payment\PaymentGatewayContract;
use App\Models\Event;
use App\Service\Payment\Gateway\ManualGateway;
use App\Service\Payment\Gateway\StripeGateway;
use App\Service\Payment\Gateway\XenditGateway;

class PaymentGatewayManager
{
    public function resolve(string $gateway): PaymentGatewayContract
    {
        return match ($gateway) {
            'manual' => app(ManualGateway::class),
            'xendit' => app(XenditGateway::class),
            'stripe' => app(StripeGateway::class),
            'midtrans' => throw new \RuntimeException('Midtrans gateway is not yet implemented.'),
            default => throw new \InvalidArgumentException("Unknown payment gateway: {$gateway}"),
        };
    }

    public function for(Event $event): PaymentGatewayContract
    {
        return $this->resolve($event->payment_gateway);
    }
}
