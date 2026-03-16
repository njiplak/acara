<?php

namespace App\Http\Controllers\Customer;

use App\Contract\Operational\TestimonialContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTestimonialRequest;
use App\Utils\WebResponse;
use Illuminate\Support\Facades\Auth;

class TestimonialController extends Controller
{
    protected TestimonialContract $service;

    public function __construct(TestimonialContract $service)
    {
        $this->service = $service;
    }

    public function store(StoreTestimonialRequest $request)
    {
        $payloads = $request->validated();
        $payloads['customer_id'] = Auth::guard('customer')->id();

        $result = $this->service->submitTestimonial($payloads);

        return WebResponse::response($result);
    }
}
