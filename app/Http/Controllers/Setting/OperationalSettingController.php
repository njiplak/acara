<?php

namespace App\Http\Controllers\Setting;

use App\Http\Controllers\Controller;
use App\Http\Requests\OperationalSettingRequest;
use App\Models\OperationalSetting;
use App\Utils\WebResponse;
use Inertia\Inertia;

class OperationalSettingController extends Controller
{
    public function edit()
    {
        $setting = OperationalSetting::instance();
        $setting->load('media');

        $certificateMedia = $setting->getFirstMedia('certificate_template');

        return Inertia::render('setting/operational/form', [
            'operationalSetting' => $setting,
            'certificateTemplateUrl' => $certificateMedia?->getUrl(),
            'certificateTemplateName' => $certificateMedia?->file_name,
        ]);
    }

    public function update(OperationalSettingRequest $request)
    {
        $setting = OperationalSetting::instance();
        $setting->update($request->safe()->except(['certificate_template']));

        if ($request->hasFile('certificate_template')) {
            $setting->addMediaFromRequest('certificate_template')->toMediaCollection('certificate_template');
        }

        return WebResponse::response($setting, 'backoffice.setting.operational.edit');
    }
}
