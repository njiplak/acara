<?php

namespace App\Http\Controllers\Setting;

use App\Http\Controllers\Controller;
use App\Http\Requests\LandingPageSettingRequest;
use App\Models\LandingPageSetting;
use App\Utils\WebResponse;
use Inertia\Inertia;

class LandingPageSettingController extends Controller
{
    public function edit()
    {
        $setting = LandingPageSetting::instance();
        $setting->load('media');

        return Inertia::render('setting/landing-page/form', [
            'landingPageSetting' => $setting,
            'logoUrl' => $setting->getFirstMediaUrl('logo') ?: null,
        ]);
    }

    public function update(LandingPageSettingRequest $request)
    {
        $setting = LandingPageSetting::instance();
        $setting->update($request->safe()->except(['logo']));

        if ($request->hasFile('logo')) {
            $setting->addMediaFromRequest('logo')->toMediaCollection('logo');
        }

        return WebResponse::response($setting, 'backoffice.setting.landing-page.edit');
    }
}
