<?php

use App\Http\Controllers\Customer\OrderController;
use App\Http\Middleware\RedirectIfNotCustomer;
use Illuminate\Support\Facades\Route;

Route::group(['middleware' => RedirectIfNotCustomer::class, 'prefix' => 'customer', 'as' => 'customer.'], function () {

    Route::group(['prefix' => 'orders', 'as' => 'orders.'], function () {
        Route::get('/', [OrderController::class, 'index'])->name('index');
        Route::post('/', [OrderController::class, 'store'])->name('store');
        Route::get('/{order}', [OrderController::class, 'show'])->name('show');
        Route::post('/{order}/pay', [OrderController::class, 'pay'])->name('pay');
        Route::get('/{order}/invoice', [OrderController::class, 'invoice'])->name('invoice');
        Route::post('/{order}/cancel', [OrderController::class, 'cancel'])->name('cancel');
    });

    Route::post('/voucher/validate', [OrderController::class, 'validateVoucher'])->name('voucher.validate');
});
