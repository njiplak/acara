<?php

use App\Http\Controllers\Customer\OrderController;
use App\Http\Controllers\Customer\ProfileController;
use App\Http\Controllers\Customer\SurveyController;
use App\Http\Controllers\Customer\TestimonialController;
use App\Http\Middleware\RedirectIfNotCustomer;
use Illuminate\Support\Facades\Route;

Route::group(['middleware' => RedirectIfNotCustomer::class, 'prefix' => 'customer', 'as' => 'customer.'], function () {

    Route::group(['prefix' => 'orders', 'as' => 'orders.'], function () {
        Route::get('/', [OrderController::class, 'index'])->name('index');
        Route::post('/', [OrderController::class, 'store'])->name('store');
        Route::get('/{order}', [OrderController::class, 'show'])->name('show');
        Route::post('/{order}/pay', [OrderController::class, 'pay'])->name('pay');
        Route::get('/{order}/invoice', [OrderController::class, 'invoice'])->name('invoice');
        Route::get('/{order}/certificate', [OrderController::class, 'certificate'])->name('certificate');
        Route::post('/{order}/cancel', [OrderController::class, 'cancel'])->name('cancel');
    });

    Route::post('/voucher/validate', [OrderController::class, 'validateVoucher'])->name('voucher.validate');

    Route::post('/waitlist/join', [OrderController::class, 'joinWaitlist'])->name('waitlist.join');
    Route::post('/waitlist/leave', [OrderController::class, 'leaveWaitlist'])->name('waitlist.leave');

    Route::post('/testimonials', [TestimonialController::class, 'store'])->name('testimonials.store');

    Route::get('/profile', [ProfileController::class, 'show'])->name('profile.show');
    Route::put('/profile', [ProfileController::class, 'update'])->name('profile.update');

    Route::get('/survey/{slug}', [SurveyController::class, 'show'])->name('survey.show');
    Route::post('/survey', [SurveyController::class, 'store'])->name('survey.store');
});
