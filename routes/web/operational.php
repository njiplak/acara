<?php

use App\Http\Controllers\Operational\CustomerController;
use App\Http\Controllers\Operational\OrderController;
use Illuminate\Support\Facades\Route;

Route::group(['middleware' => 'auth', 'prefix' => 'operational', 'as' => 'backoffice.operational.'], function () {

    Route::group(['prefix' => 'customer', 'as' => 'customer.'], function () {
        Route::get('/', [CustomerController::class, 'index'])->name('index');
        Route::get('/fetch', [CustomerController::class, 'fetch'])->name('fetch');
        Route::get('/{id}', [CustomerController::class, 'show'])->name('show');
        Route::delete('/{id}', [CustomerController::class, 'destroy'])->name('destroy');
        Route::post('/destroy-bulk', [CustomerController::class, 'destroy_bulk'])->name('destroy-bulk');
    });

    Route::group(['prefix' => 'order', 'as' => 'order.'], function () {
        Route::get('/', [OrderController::class, 'index'])->name('index');
        Route::get('/fetch', [OrderController::class, 'fetch'])->name('fetch');
        Route::get('/{id}', [OrderController::class, 'show'])->name('show');
        Route::post('/{id}/confirm', [OrderController::class, 'confirm'])->name('confirm');
        Route::post('/{id}/reject', [OrderController::class, 'reject'])->name('reject');
        Route::post('/{id}/refund', [OrderController::class, 'refund'])->name('refund');
        Route::get('/{id}/invoice', [OrderController::class, 'invoice'])->name('invoice');
        Route::post('/{id}/check-in', [OrderController::class, 'checkIn'])->name('check-in');
        Route::post('/{id}/undo-check-in', [OrderController::class, 'undoCheckIn'])->name('undo-check-in');
    });

    Route::group(['prefix' => 'check-in', 'as' => 'check-in.'], function () {
        Route::get('/', [OrderController::class, 'scannerPage'])->name('scanner');
        Route::post('/scan', [OrderController::class, 'scanCheckIn'])->name('scan');
    });
});
