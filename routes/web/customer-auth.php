<?php

use App\Http\Controllers\Auth\CustomerAuthController;
use App\Http\Middleware\RedirectIfNotCustomer;
use Illuminate\Support\Facades\Route;

Route::group(['prefix' => 'customer/auth'], function () {
    Route::get('google', [CustomerAuthController::class, 'redirect'])->name('customer.auth.google');
    Route::get('google/callback', [CustomerAuthController::class, 'callback'])->name('customer.auth.google.callback');

    Route::group(['middleware' => RedirectIfNotCustomer::class], function () {
        Route::post('logout', [CustomerAuthController::class, 'logout'])->name('customer.auth.logout');
    });
});
