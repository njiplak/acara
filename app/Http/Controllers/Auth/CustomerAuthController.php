<?php

namespace App\Http\Controllers\Auth;

use App\Contract\Auth\CustomerAuthContract;
use App\Http\Controllers\Controller;
use App\Utils\WebResponse;
use Inertia\Inertia;

class CustomerAuthController extends Controller
{
    protected CustomerAuthContract $service;

    public function __construct(CustomerAuthContract $service)
    {
        $this->service = $service;
    }

    public function redirect()
    {
        return $this->service->redirectToProvider('google');
    }

    public function callback()
    {
        $result = $this->service->handleProviderCallback('google');

        if ($result instanceof \Exception) {
            return WebResponse::response($result, 'home');
        }

        if (!$result->isProfileComplete()) {
            return Inertia::location(route('customer.profile.complete'));
        }

        return Inertia::location(route('customer.orders.index'));
    }

    public function logout()
    {
        $result = $this->service->logout();

        return WebResponse::response($result, 'home');
    }
}
