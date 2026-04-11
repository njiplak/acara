<?php

use App\Http\Controllers\Operational\CustomerController;
use App\Http\Controllers\Operational\OrderController;
use App\Http\Controllers\Operational\SubscriptionOrderController;
use App\Http\Controllers\Operational\SurveyController;
use App\Http\Controllers\Operational\TestimonialController;
use Illuminate\Support\Facades\Route;

Route::group(['middleware' => 'auth', 'prefix' => 'operational', 'as' => 'backoffice.operational.'], function () {

    Route::group(['prefix' => 'customer', 'as' => 'customer.', 'middleware' => 'permission:customer.view'], function () {
        Route::get('/', [CustomerController::class, 'index'])->name('index');
        Route::get('/fetch', [CustomerController::class, 'fetch'])->name('fetch');
        Route::get('/{id}', [CustomerController::class, 'show'])->name('show');
        Route::delete('/{id}', [CustomerController::class, 'destroy'])->name('destroy');
        Route::post('/destroy-bulk', [CustomerController::class, 'destroy_bulk'])->name('destroy-bulk');
        Route::post('/{id}/birthday-voucher', [CustomerController::class, 'generateBirthdayVoucher'])->name('birthday-voucher');
    });

    Route::group(['prefix' => 'order', 'as' => 'order.', 'middleware' => 'permission:order.view'], function () {
        Route::get('/', [OrderController::class, 'index'])->name('index');
        Route::get('/fetch', [OrderController::class, 'fetch'])->name('fetch');
        Route::get('/export', [OrderController::class, 'export'])->name('export');
        Route::get('/{id}', [OrderController::class, 'show'])->name('show');
        Route::post('/{id}/confirm', [OrderController::class, 'confirm'])->name('confirm');
        Route::post('/{id}/reject', [OrderController::class, 'reject'])->name('reject');
        Route::post('/{id}/refund', [OrderController::class, 'refund'])->name('refund');
        Route::get('/{id}/invoice', [OrderController::class, 'invoice'])->name('invoice');
        Route::post('/{id}/check-in', [OrderController::class, 'checkIn'])->name('check-in');
        Route::post('/{id}/undo-check-in', [OrderController::class, 'undoCheckIn'])->name('undo-check-in');
        Route::post('/{id}/session-check-in', [OrderController::class, 'sessionCheckIn'])->name('session-check-in');
        Route::post('/{id}/undo-session-check-in', [OrderController::class, 'undoSessionCheckIn'])->name('undo-session-check-in');
    });

    Route::group(['prefix' => 'subscription-order', 'as' => 'subscription-order.', 'middleware' => 'permission:subscription_order.view'], function () {
        Route::get('/', [SubscriptionOrderController::class, 'index'])->name('index');
        Route::get('/fetch', [SubscriptionOrderController::class, 'fetch'])->name('fetch');
        Route::get('/{id}', [SubscriptionOrderController::class, 'show'])->name('show');
        Route::post('/{id}/confirm', [SubscriptionOrderController::class, 'confirm'])->name('confirm');
        Route::post('/{id}/reject', [SubscriptionOrderController::class, 'reject'])->name('reject');
    });

    Route::group(['prefix' => 'check-in', 'as' => 'check-in.', 'middleware' => 'permission:check_in.view'], function () {
        Route::get('/', [OrderController::class, 'scannerPage'])->name('scanner');
        Route::post('/scan', [OrderController::class, 'scanCheckIn'])->name('scan');
    });

    Route::group(['prefix' => 'testimonial', 'as' => 'testimonial.', 'middleware' => 'permission:testimonial.view'], function () {
        Route::get('/', [TestimonialController::class, 'index'])->name('index');
        Route::get('/fetch', [TestimonialController::class, 'fetch'])->name('fetch');
        Route::post('/{id}/toggle-highlight', [TestimonialController::class, 'toggleHighlight'])->name('toggle-highlight');
    });

    Route::group(['prefix' => 'survey', 'as' => 'survey.', 'middleware' => 'permission:survey.view'], function () {
        Route::get('/', [SurveyController::class, 'index'])->name('index');
        Route::get('/fetch', [SurveyController::class, 'fetch'])->name('fetch');
        Route::get('/create', [SurveyController::class, 'create'])->name('create');
        Route::post('/', [SurveyController::class, 'store'])->name('store');
        Route::get('/{id}/results', [SurveyController::class, 'results'])->name('results');
        Route::get('/{id}', [SurveyController::class, 'show'])->name('show');
        Route::put('/{id}', [SurveyController::class, 'update'])->name('update');
        Route::delete('/{id}', [SurveyController::class, 'destroy'])->name('destroy');
        Route::post('/destroy-bulk', [SurveyController::class, 'destroy_bulk'])->name('destroy-bulk');
    });

});
