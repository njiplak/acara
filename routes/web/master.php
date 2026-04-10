<?php

use App\Http\Controllers\Master\ArticleController;
use App\Http\Controllers\Master\AddonController;
use App\Http\Controllers\Master\SubscriptionPlanController;
use App\Http\Controllers\Master\SubscriptionFeatureController;
use App\Http\Controllers\Master\CatalogController;
use App\Http\Controllers\Master\EventController;
use App\Http\Controllers\Master\EventMaterialController;
use App\Http\Controllers\Master\EventTemplateController;
use App\Http\Controllers\Master\FaqController;
use App\Http\Controllers\Master\SpeakerController;
use App\Http\Controllers\Master\VenueController;
use App\Http\Controllers\Master\VoucherController;
use Illuminate\Support\Facades\Route;

Route::group(['middleware' => 'auth', 'prefix' => 'master', 'as' => 'backoffice.master.'], function () {

    Route::group(['prefix' => 'article', 'as' => 'article.', 'middleware' => 'permission:article.view'], function () {
        Route::get('/', [ArticleController::class, 'index'])->name('index');
        Route::get('/fetch', [ArticleController::class, 'fetch'])->name('fetch');
        Route::get('/create', [ArticleController::class, 'create'])->name('create');
        Route::post('/', [ArticleController::class, 'store'])->name('store');
        Route::get('/{id}', [ArticleController::class, 'show'])->name('show');
        Route::put('/{id}', [ArticleController::class, 'update'])->name('update');
        Route::delete('/{id}', [ArticleController::class, 'destroy'])->name('destroy');
        Route::post('/destroy-bulk', [ArticleController::class, 'destroy_bulk'])->name('destroy-bulk');
    });

    Route::group(['prefix' => 'addon', 'as' => 'addon.', 'middleware' => 'permission:addon.view'], function () {
        Route::get('/', [AddonController::class, 'index'])->name('index');
        Route::get('/fetch', [AddonController::class, 'fetch'])->name('fetch');
        Route::get('/create', [AddonController::class, 'create'])->name('create');
        Route::post('/', [AddonController::class, 'store'])->name('store');
        Route::get('/{id}', [AddonController::class, 'show'])->name('show');
        Route::put('/{id}', [AddonController::class, 'update'])->name('update');
        Route::delete('/{id}', [AddonController::class, 'destroy'])->name('destroy');
        Route::post('/destroy-bulk', [AddonController::class, 'destroy_bulk'])->name('destroy-bulk');
    });

    Route::group(['prefix' => 'catalog', 'as' => 'catalog.', 'middleware' => 'permission:catalog.view'], function () {
        Route::get('/', [CatalogController::class, 'index'])->name('index');
        Route::get('/fetch', [CatalogController::class, 'fetch'])->name('fetch');
        Route::get('/create', [CatalogController::class, 'create'])->name('create');
        Route::post('/', [CatalogController::class, 'store'])->name('store');
        Route::get('/{id}', [CatalogController::class, 'show'])->name('show');
        Route::put('/{id}', [CatalogController::class, 'update'])->name('update');
        Route::delete('/{id}', [CatalogController::class, 'destroy'])->name('destroy');
        Route::post('/destroy-bulk', [CatalogController::class, 'destroy_bulk'])->name('destroy-bulk');
    });

    Route::group(['prefix' => 'speaker', 'as' => 'speaker.', 'middleware' => 'permission:speaker.view'], function () {
        Route::get('/', [SpeakerController::class, 'index'])->name('index');
        Route::get('/fetch', [SpeakerController::class, 'fetch'])->name('fetch');
        Route::get('/create', [SpeakerController::class, 'create'])->name('create');
        Route::post('/', [SpeakerController::class, 'store'])->name('store');
        Route::get('/{id}', [SpeakerController::class, 'show'])->name('show');
        Route::put('/{id}', [SpeakerController::class, 'update'])->name('update');
        Route::delete('/{id}', [SpeakerController::class, 'destroy'])->name('destroy');
        Route::post('/destroy-bulk', [SpeakerController::class, 'destroy_bulk'])->name('destroy-bulk');
    });

    Route::group(['prefix' => 'venue', 'as' => 'venue.', 'middleware' => 'permission:venue.view'], function () {
        Route::get('/', [VenueController::class, 'index'])->name('index');
        Route::get('/fetch', [VenueController::class, 'fetch'])->name('fetch');
        Route::get('/create', [VenueController::class, 'create'])->name('create');
        Route::post('/', [VenueController::class, 'store'])->name('store');
        Route::get('/{id}', [VenueController::class, 'show'])->name('show');
        Route::put('/{id}', [VenueController::class, 'update'])->name('update');
        Route::delete('/{id}', [VenueController::class, 'destroy'])->name('destroy');
        Route::post('/destroy-bulk', [VenueController::class, 'destroy_bulk'])->name('destroy-bulk');
    });

    Route::group(['prefix' => 'voucher', 'as' => 'voucher.', 'middleware' => 'permission:voucher.view'], function () {
        Route::get('/', [VoucherController::class, 'index'])->name('index');
        Route::get('/fetch', [VoucherController::class, 'fetch'])->name('fetch');
        Route::get('/create', [VoucherController::class, 'create'])->name('create');
        Route::post('/', [VoucherController::class, 'store'])->name('store');
        Route::get('/{id}', [VoucherController::class, 'show'])->name('show');
        Route::put('/{id}', [VoucherController::class, 'update'])->name('update');
        Route::delete('/{id}', [VoucherController::class, 'destroy'])->name('destroy');
        Route::post('/destroy-bulk', [VoucherController::class, 'destroy_bulk'])->name('destroy-bulk');
    });

    Route::group(['prefix' => 'event-template', 'as' => 'event-template.', 'middleware' => 'permission:event_template.view'], function () {
        Route::get('/', [EventTemplateController::class, 'index'])->name('index');
        Route::get('/fetch', [EventTemplateController::class, 'fetch'])->name('fetch');
        Route::get('/create', [EventTemplateController::class, 'create'])->name('create');
        Route::post('/', [EventTemplateController::class, 'store'])->name('store');
        Route::get('/{id}', [EventTemplateController::class, 'show'])->name('show');
        Route::get('/{id}/generate', [EventTemplateController::class, 'generateForm'])->name('generate');
        Route::post('/{id}/generate', [EventTemplateController::class, 'generate'])->name('generate.store');
        Route::put('/{id}', [EventTemplateController::class, 'update'])->name('update');
        Route::delete('/{id}', [EventTemplateController::class, 'destroy'])->name('destroy');
        Route::post('/destroy-bulk', [EventTemplateController::class, 'destroy_bulk'])->name('destroy-bulk');
    });

    Route::group(['prefix' => 'faq', 'as' => 'faq.', 'middleware' => 'permission:faq.view'], function () {
        Route::get('/', [FaqController::class, 'index'])->name('index');
        Route::get('/fetch', [FaqController::class, 'fetch'])->name('fetch');
        Route::get('/create', [FaqController::class, 'create'])->name('create');
        Route::post('/', [FaqController::class, 'store'])->name('store');
        Route::get('/{id}', [FaqController::class, 'show'])->name('show');
        Route::put('/{id}', [FaqController::class, 'update'])->name('update');
        Route::delete('/{id}', [FaqController::class, 'destroy'])->name('destroy');
        Route::post('/destroy-bulk', [FaqController::class, 'destroy_bulk'])->name('destroy-bulk');
    });

    Route::group(['prefix' => 'subscription-plan', 'as' => 'subscription-plan.', 'middleware' => 'permission:subscription_plan.view'], function () {
        Route::get('/', [SubscriptionPlanController::class, 'index'])->name('index');
        Route::get('/fetch', [SubscriptionPlanController::class, 'fetch'])->name('fetch');
        Route::get('/create', [SubscriptionPlanController::class, 'create'])->name('create');
        Route::post('/', [SubscriptionPlanController::class, 'store'])->name('store');
        Route::get('/{id}', [SubscriptionPlanController::class, 'show'])->name('show');
        Route::put('/{id}', [SubscriptionPlanController::class, 'update'])->name('update');
        Route::delete('/{id}', [SubscriptionPlanController::class, 'destroy'])->name('destroy');
        Route::post('/destroy-bulk', [SubscriptionPlanController::class, 'destroy_bulk'])->name('destroy-bulk');
    });

    Route::group(['prefix' => 'subscription-feature', 'as' => 'subscription-feature.', 'middleware' => 'permission:subscription_feature.view'], function () {
        Route::get('/', [SubscriptionFeatureController::class, 'index'])->name('index');
        Route::get('/fetch', [SubscriptionFeatureController::class, 'fetch'])->name('fetch');
        Route::get('/create', [SubscriptionFeatureController::class, 'create'])->name('create');
        Route::post('/', [SubscriptionFeatureController::class, 'store'])->name('store');
        Route::get('/{id}', [SubscriptionFeatureController::class, 'show'])->name('show');
        Route::put('/{id}', [SubscriptionFeatureController::class, 'update'])->name('update');
        Route::delete('/{id}', [SubscriptionFeatureController::class, 'destroy'])->name('destroy');
        Route::post('/destroy-bulk', [SubscriptionFeatureController::class, 'destroy_bulk'])->name('destroy-bulk');
    });

    Route::group(['prefix' => 'event', 'as' => 'event.', 'middleware' => 'permission:event.view'], function () {
        Route::get('/', [EventController::class, 'index'])->name('index');
        Route::get('/fetch', [EventController::class, 'fetch'])->name('fetch');
        Route::get('/create', [EventController::class, 'create'])->name('create');
        Route::post('/', [EventController::class, 'store'])->name('store');
        Route::post('/check-conflicts', [EventController::class, 'checkConflicts'])->name('check-conflicts');
        Route::post('/{id}/save-as-template', [EventController::class, 'saveAsTemplate'])->name('save-as-template');
        Route::get('/{id}', [EventController::class, 'show'])->name('show');
        Route::get('/{id}/registrants', [EventController::class, 'registrants'])->name('registrants');
        Route::get('/{id}/economics', [EventController::class, 'economics'])->name('economics');
        Route::get('/{id}/economics/export', [EventController::class, 'exportEconomics'])->name('economics.export');
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
