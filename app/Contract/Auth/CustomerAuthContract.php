<?php

namespace App\Contract\Auth;

use App\Contract\AuthContract;

interface CustomerAuthContract extends AuthContract
{
    public function redirectToProvider(string $provider);
    public function handleProviderCallback(string $provider);
}
