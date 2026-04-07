<?php

namespace App\Service\Master;

use App\Contract\Master\SubscriptionFeatureContract;
use App\Service\BaseService;
use App\Models\SubscriptionFeature;

class SubscriptionFeatureService extends BaseService implements SubscriptionFeatureContract
{
    public function __construct(SubscriptionFeature $model)
    {
        parent::__construct($model);
    }
}
