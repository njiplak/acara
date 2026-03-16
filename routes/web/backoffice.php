<?php

use App\Http\Controllers\BackofficeController;
use App\Http\Controllers\CalendarController;
use Illuminate\Support\Facades\Route;

Route::group(['middleware' => 'auth', 'prefix' => 'backoffice', 'as' => 'backoffice.'], function () {
    Route::get('/', [BackofficeController::class, 'index'])->name('index');
    Route::get('/calendar', [CalendarController::class, 'index'])->name('calendar');
    Route::get('/calendar/fetch', [CalendarController::class, 'fetch'])->name('calendar.fetch');
});
