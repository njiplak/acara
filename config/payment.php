<?php

return [
    'default' => env('PAYMENT_DEFAULT_GATEWAY', 'manual'),
    'expiry_hours' => env('PAYMENT_EXPIRY_HOURS', 24),

    'gateways' => [
        'manual' => [
            'enabled' => true,
        ],
        'xendit' => [
            'enabled' => env('XENDIT_ENABLED', false),
            'secret_key' => env('XENDIT_SECRET_KEY'),
            'public_key' => env('XENDIT_PUBLIC_KEY'),
            'webhook_token' => env('XENDIT_WEBHOOK_TOKEN'),
        ],
        'stripe' => [
            'enabled' => env('STRIPE_ENABLED', false),
            'secret_key' => env('STRIPE_SECRET_KEY'),
            'publishable_key' => env('STRIPE_PUBLISHABLE_KEY'),
            'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
        ],
        'midtrans' => [
            'enabled' => env('MIDTRANS_ENABLED', false),
            'server_key' => env('MIDTRANS_SERVER_KEY'),
            'client_key' => env('MIDTRANS_CLIENT_KEY'),
            'is_production' => env('MIDTRANS_IS_PRODUCTION', false),
        ],
    ],

    'reconciliation' => [
        'stale_threshold_minutes' => env('PAYMENT_STALE_THRESHOLD', 30),
    ],
];
