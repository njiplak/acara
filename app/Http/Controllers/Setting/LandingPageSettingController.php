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
        return Inertia::render('setting/landing-page/form', [
            'landingPageSetting' => LandingPageSetting::instance(),
        ]);
    }

    public function update(LandingPageSettingRequest $request)
    {
        $setting = LandingPageSetting::instance();
        $setting->update($request->validated());

        return WebResponse::response($setting, 'backoffice.setting.landing-page.edit');
    }
}
