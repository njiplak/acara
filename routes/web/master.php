<?php

use App\Http\Controllers\Master\AddonController;
use App\Http\Controllers\Master\CatalogController;
use App\Http\Controllers\Master\EventController;
use App\Http\Controllers\Master\EventMaterialController;
use App\Http\Controllers\Master\SpeakerController;
use App\Http\Controllers\Master\VenueController;
use App\Http\Controllers\Master\VoucherController;
use Illuminate\Support\Facades\Route;

Route::group(['middleware' => 'auth', 'prefix' => 'master', 'as' => 'backoffice.master.'], function () {

    Route::group(['prefix' => 'addon', 'as' => 'addon.'], function () {
        Route::get('/', [AddonController::class, 'index'])->name('index');
        Route::get('/fetch', [AddonController::class, 'fetch'])->name('fetch');
        Route::get('/create', [AddonController::class, 'create'])->name('create');
        Route::post('/', [AddonController::class, 'store'])->name('store');
        Route::get('/{id}', [AddonController::class, 'show'])->name('show');
        Route::put('/{id}', [AddonController::class, 'update'])->name('update');
        Route::delete('/{id}', [AddonController::class, 'destroy'])->name('destroy');
        Route::post('/destroy-bulk', [AddonController::class, 'destroy_bulk'])->name('destroy-bulk');
    });

    Route::group(['prefix' => 'catalog', 'as' => 'catalog.'], function () {
        Route::get('/', [CatalogController::class, 'index'])->name('index');
        Route::get('/fetch', [CatalogController::class, 'fetch'])->name('fetch');
        Route::get('/create', [CatalogController::class, 'create'])->name('create');
        Route::post('/', [CatalogController::class, 'store'])->name('store');
        Route::get('/{id}', [CatalogController::class, 'show'])->name('show');
        Route::put('/{id}', [CatalogController::class, 'update'])->name('update');
        Route::delete('/{id}', [CatalogController::class, 'destroy'])->name('destroy');
        Route::post('/destroy-bulk', [CatalogController::class, 'destroy_bulk'])->name('destroy-bulk');
    });

    Route::group(['prefix' => 'speaker', 'as' => 'speaker.'], function () {
        Route::get('/', [SpeakerController::class, 'index'])->name('index');
        Route::get('/fetch', [SpeakerController::class, 'fetch'])->name('fetch');
        Route::get('/create', [SpeakerController::class, 'create'])->name('create');
        Route::post('/', [SpeakerController::class, 'store'])->name('store');
        Route::get('/{id}', [SpeakerController::class, 'show'])->name('show');
        Route::put('/{id}', [SpeakerController::class, 'update'])->name('update');
        Route::delete('/{id}', [SpeakerController::class, 'destroy'])->name('destroy');
        Route::post('/destroy-bulk', [SpeakerController::class, 'destroy_bulk'])->name('destroy-bulk');
    });

    Route::group(['prefix' => 'venue', 'as' => 'venue.'], function () {
        Route::get('/', [VenueController::class, 'index'])->name('index');
        Route::get('/fetch', [VenueController::class, 'fetch'])->name('fetch');
        Route::get('/create', [VenueController::class, 'create'])->name('create');
        Route::post('/', [VenueController::class, 'store'])->name('store');
        Route::get('/{id}', [VenueController::class, 'show'])->name('show');
        Route::put('/{id}', [VenueController::class, 'update'])->name('update');
        Route::delete('/{id}', [VenueController::class, 'destroy'])->name('destroy');
        Route::post('/destroy-bulk', [VenueController::class, 'destroy_bulk'])->name('destroy-bulk');
    });

    Route::group(['prefix' => 'voucher', 'as' => 'voucher.'], function () {
        Route::get('/', [VoucherController::class, 'index'])->name('index');
        Route::get('/fetch', [VoucherController::class, 'fetch'])->name('fetch');
        Route::get('/create', [VoucherController::class, 'create'])->name('create');
        Route::post('/', [VoucherController::class, 'store'])->name('store');
        Route::get('/{id}', [VoucherController::class, 'show'])->name('show');
        Route::put('/{id}', [VoucherController::class, 'update'])->name('update');
        Route::delete('/{id}', [VoucherController::class, 'destroy'])->name('destroy');
        Route::post('/destroy-bulk', [VoucherController::class, 'destroy_bulk'])->name('destroy-bulk');
    });

    Route::group(['prefix' => 'event', 'as' => 'event.'], function () {
        Route::get('/', [EventController::class, 'index'])->name('index');
        Route::get('/fetch', [EventController::class, 'fetch'])->name('fetch');
        Route::get('/create', [EventController::class, 'create'])->name('create');
        Route::post('/', [EventController::class, 'store'])->name('store');
        Route::get('/{id}', [EventController::class, 'show'])->name('show');
        Route::get('/{id}/registrants', [EventController::class, 'registrants'])->name('registrants');
        Route::put('/{id}', [EventController::class, 'update'])->name('update');
        Route::delete('/{id}', [EventController::class, 'destroy'])->name('destroy');
        Route::post('/destroy-bulk', [EventController::class, 'destroy_bulk'])->name('destroy-bulk');

        Route::group(['prefix' => '{eventId}/materials', 'as' => 'materials.'], function () {
            Route::get('/', [EventMaterialController::class, 'index'])->name('index');
            Route::get('/create', [EventMaterialController::class, 'create'])->name('create');
            Route::post('/', [EventMaterialController::class, 'store'])->name('store');
            Route::get('/{id}', [EventMaterialController::class, 'show'])->name('show');
            Route::put('/{id}', [EventMaterialController::class, 'update'])->name('update');
            Route::delete('/{id}', [EventMaterialController::class, 'destroy'])->name('destroy');
        });
    });
});
