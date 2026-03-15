<?php

namespace App\Service\Master;

use App\Contract\Master\AddonContract;
use App\Models\Addon;
use App\Service\BaseService;

class AddonService extends BaseService implements AddonContract
{
    public function __construct(Addon $model)
    {
        parent::__construct($model);
    }
}
