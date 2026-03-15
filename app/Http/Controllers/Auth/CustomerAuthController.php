<?php

namespace App\Http\Controllers\Auth;

use App\Contract\Auth\CustomerAuthContract;
use App\Http\Controllers\Controller;
use App\Utils\WebResponse;

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

        return WebResponse::response($result, 'home');
    }

    public function logout()
    {
        $result = $this->service->logout();

        return WebResponse::response($result, 'home');
    }
}
