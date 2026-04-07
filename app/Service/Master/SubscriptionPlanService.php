<?php

namespace App\Service\Master;

use App\Contract\Master\SubscriptionPlanContract;
use App\Service\BaseService;
use App\Models\SubscriptionPlan;

class SubscriptionPlanService extends BaseService implements SubscriptionPlanContract
{
    public function __construct(SubscriptionPlan $model)
    {
        parent::__construct($model);
    }
}
