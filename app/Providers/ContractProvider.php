<?php
    
namespace App\Providers;

use App\Contract\Auth\CustomerAuthContract;
use App\Contract\Auth\UserAuthContract;
use App\Contract\AuthContract;
use App\Contract\BaseContract;
use App\Contract\Master\AddonContract;
use App\Contract\Master\ArticleContract;
use App\Contract\Master\CatalogContract;
use App\Contract\Master\EventContract;
use App\Contract\Master\EventMaterialContract;
use App\Contract\Master\EventTemplateContract;
use App\Contract\Master\FaqContract;
use App\Contract\Master\SpeakerContract;
use App\Contract\Master\VenueContract;
use App\Contract\Master\SubscriptionFeatureContract;
use App\Contract\Master\SubscriptionPlanContract;
use App\Contract\Master\VoucherContract;
use App\Contract\Operational\CustomerContract;
use App\Contract\Operational\OrderContract;
use App\Contract\Operational\SurveyContract;
use App\Contract\Operational\TestimonialContract;
use App\Contract\Setting\RoleContract;
use App\Contract\Setting\UserContract;
use App\Contract\Setting\PageContract;
use App\Contract\Setting\SettingContract;
use App\Service\Auth\CustomerAuthService;
use App\Service\Auth\UserAuthService;
use App\Service\AuthService;
use App\Service\BaseService;
use App\Service\Master\AddonService;
use App\Service\Master\ArticleService;
use App\Service\Master\CatalogService;
use App\Service\Master\EventMaterialService;
use App\Service\Master\EventService;
use App\Service\Master\EventTemplateService;
use App\Service\Master\FaqService;
use App\Service\Master\SpeakerService;
use App\Service\Master\VenueService;
use App\Service\Master\SubscriptionFeatureService;
use App\Service\Master\SubscriptionPlanService;
use App\Service\Master\VoucherService;
use App\Service\Operational\CustomerService;
use App\Service\Operational\OrderService;
use App\Service\Operational\SurveyService;
use App\Service\Operational\TestimonialService;
use App\Service\Setting\PageService;
use App\Service\Setting\RoleService;
use App\Service\Setting\UserService;
use App\Service\Setting\SettingService;
use App\Service\Payment\PaymentGatewayManager;
use Illuminate\Support\ServiceProvider;

class ContractProvider extends ServiceProvider
{
    public array $bindings = [
        // Base
        BaseContract::class => BaseService::class,
        AuthContract::class => AuthService::class,
        UserAuthContract::class => UserAuthService::class,
        CustomerAuthContract::class => CustomerAuthService::class,

        // Operational
        CustomerContract::class => CustomerService::class,
        OrderContract::class => OrderService::class,
        SurveyContract::class => SurveyService::class,
        TestimonialContract::class => TestimonialService::class,

        // Master
        AddonContract::class => AddonService::class,
        ArticleContract::class => ArticleService::class,
        CatalogContract::class => CatalogService::class,
        EventContract::class => EventService::class,
        EventMaterialContract::class => EventMaterialService::class,
        EventTemplateContract::class => EventTemplateService::class,
        FaqContract::class => FaqService::class,
        SpeakerContract::class => SpeakerService::class,
        SubscriptionPlanContract::class => SubscriptionPlanService::class,
        SubscriptionFeatureContract::class => SubscriptionFeatureService::class,
        VenueContract::class => VenueService::class,
        VoucherContract::class => VoucherService::class,

        // Setting
        SettingContract::class => SettingService::class,
        RoleContract::class => RoleService::class,
        UserContract::class => UserService::class,
        PageContract::class => PageService::class,
    ];

    public function register(): void
    {
        foreach ($this->bindings as $contract => $service) {
            $this->app->bind($contract, $service);
        }

        $this->app->singleton(PaymentGatewayManager::class);
    }

    public function boot(): void {}
}
