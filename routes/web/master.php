<?php

use App\Http\Controllers\Master\AddonController;
use App\Http\Controllers\Master\CatalogController;
use App\Http\Controllers\Master\EventController;
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
    });
});
