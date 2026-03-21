<?php

use App\Http\Controllers\Webhook\PaymentWebhookController;
use Illuminate\Support\Facades\Route;

Route::post('/webhooks/xendit', [PaymentWebhookController::class, 'xendit'])->name('webhooks.xendit');
Route::post('/webhooks/stripe', [PaymentWebhookController::class, 'stripe'])->name('webhooks.stripe');
Route::post('/webhooks/midtrans', [PaymentWebhookController::class, 'midtrans'])->name('webhooks.midtrans');
