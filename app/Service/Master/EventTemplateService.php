<?php

namespace App\Service\Master;

use App\Contract\Master\EventTemplateContract;
use App\Models\EventTemplate;
use App\Service\BaseService;

class EventTemplateService extends BaseService implements EventTemplateContract
{
    public function __construct(EventTemplate $model)
    {
        parent::__construct($model);
    }
}
