<?php

namespace App\Service\Master;

use App\Contract\Master\EventMaterialContract;
use App\Models\EventMaterial;
use App\Service\BaseService;

class EventMaterialService extends BaseService implements EventMaterialContract
{
    protected array $relation = ['media', 'catalog'];
    protected array $fileKeys = ['attachment'];

    public function __construct(EventMaterial $model)
    {
        parent::__construct($model);
    }
}
