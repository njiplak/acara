<?php

namespace App\Service\Setting;

use App\Contract\Setting\PageContract;
use App\Models\Page;
use App\Service\BaseService;

class PageService extends BaseService implements PageContract
{
    public function __construct(Page $model)
    {
        parent::__construct($model);
    }
}
