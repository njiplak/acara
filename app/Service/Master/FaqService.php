<?php

namespace App\Service\Master;

use App\Contract\Master\FaqContract;
use App\Models\Faq;
use App\Service\BaseService;

class FaqService extends BaseService implements FaqContract
{
    public function __construct(Faq $model)
    {
        parent::__construct($model);
    }
}
