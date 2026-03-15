<?php

namespace App\Service\Auth;

use App\Contract\Auth\CustomerAuthContract;
use App\Models\Customer;
use App\Service\AuthService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Exception;

class CustomerAuthService extends AuthService implements CustomerAuthContract
{
    protected string $username = 'email';
    protected string|null $guard = 'customer';
    protected string|null $guardForeignKey = null;
    protected Model $model;

    public function __construct(Customer $model)
    {
        $this->model = $model;
    }

    /**
     * Redirect to OAuth provider.
     *
     * @param string $provider
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function redirectToProvider(string $provider)
    {
        return Socialite::driver($provider)->redirect();
    }

    /**
     * Handle OAuth provider callback.
     * Find or create customer, then log them in.
     *
     * @param string $provider
     * @return Customer|Exception
     */
    public function handleProviderCallback(string $provider)
    {
        try {
            $socialUser = Socialite::driver($provider)->user();

            DB::beginTransaction();

            $customer = $this->model::query()
                ->where('google_id', $socialUser->getId())
                ->orWhere('email', $socialUser->getEmail())
                ->first();

            if ($customer) {
                $customer->update([
                    'google_id' => $socialUser->getId(),
                    'avatar' => $socialUser->getAvatar(),
                ]);
            } else {
                $customer = $this->model::create([
                    'name' => $socialUser->getName(),
                    'email' => $socialUser->getEmail(),
                    'google_id' => $socialUser->getId(),
                    'avatar' => $socialUser->getAvatar(),
                    'email_verified_at' => now(),
                    'referral_code' => $this->generateReferralCode(),
                ]);
            }

            DB::commit();

            Auth::guard($this->guard)->login($customer, true);

            return $customer;
        } catch (Exception $exception) {
            DB::rollBack();
            return $exception;
        }
    }

    /**
     * Generate a unique referral code.
     *
     * @return string
     */
    private function generateReferralCode(): string
    {
        do {
            $code = strtoupper(Str::random(8));
        } while ($this->model::where('referral_code', $code)->exists());

        return $code;
    }
}
