<?php

namespace App\Http\Controllers\Customer;

use App\Contract\Operational\SurveyContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\SubmitSurveyResponseRequest;
use App\Models\LandingPageSetting;
use App\Models\Order;
use App\Models\Survey;
use App\Models\SurveyResponse;
use App\Utils\WebResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SurveyController extends Controller
{
    protected SurveyContract $service;

    public function __construct(SurveyContract $service)
    {
        $this->service = $service;
    }

    public function show($slug)
    {
        $survey = Survey::where('slug', $slug)
            ->where('is_active', true)
            ->with('event')
            ->firstOrFail();

        $customerId = Auth::guard('customer')->id();

        // Find eligible orders: confirmed + checked in for this event
        $eligibleOrders = Order::where('customer_id', $customerId)
            ->where('event_id', $survey->event_id)
            ->where('status', 'confirmed')
            ->whereNotNull('checked_in_at')
            ->with('catalog')
            ->get();

        // Filter out orders that already have a response
        $respondedOrderIds = SurveyResponse::where('survey_id', $survey->id)
            ->whereIn('order_id', $eligibleOrders->pluck('id'))
            ->pluck('order_id');

        $eligibleOrders = $eligibleOrders->filter(fn($order) => !$respondedOrderIds->contains($order->id))->values();

        $settings = LandingPageSetting::instance();

        return Inertia::render('customer/survey/show', [
            'survey' => $survey,
            'eligibleOrders' => $eligibleOrders,
            'logoUrl' => $settings->getFirstMediaUrl('logo') ?: null,
        ]);
    }

    public function store(SubmitSurveyResponseRequest $request)
    {
        $payloads = $request->validated();
        $payloads['customer_id'] = Auth::guard('customer')->id();

        $result = $this->service->submitResponse($payloads);

        return WebResponse::response($result);
    }
}
