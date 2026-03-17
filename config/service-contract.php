<?php

return [
    'default_paginated' => true,
    'pagination_per_page' => 10,
    'seeder_faker' => env('SEEDER_FAKER', false),
    'auth' => [
        'otp_expired' => 15,
        'token_expired' => 10
    ],
    'referral' => [
        'referee_discount' => env('REFERRAL_REFEREE_DISCOUNT', 25000),
        'referrer_credit' => env('REFERRAL_REFERRER_CREDIT', 25000),
    ],

    'customer_tags' => [
        'big_spender_threshold' => env('CUSTOMER_TAG_BIG_SPENDER', 1000000),
        'active_days' => 90,
        'lapsed_days' => 180,
    ],

];
