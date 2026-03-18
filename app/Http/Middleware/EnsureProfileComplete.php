<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureProfileComplete
{
    public function handle(Request $request, Closure $next): Response
    {
        $customer = Auth::guard('customer')->user();

        if ($customer && !$customer->isProfileComplete()) {
            if (!$request->routeIs('customer.profile.complete', 'customer.profile.complete.store', 'customer.auth.logout')) {
                return redirect()->route('customer.profile.complete');
            }
        }

        return $next($request);
    }
}
