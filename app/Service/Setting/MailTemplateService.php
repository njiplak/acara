<?php

namespace App\Service\Setting;

use App\Contract\Setting\MailTemplateContract;
use App\Models\MailTemplate;
use App\Service\BaseService;

class MailTemplateService extends BaseService implements MailTemplateContract
{
    public function __construct(MailTemplate $model)
    {
        parent::__construct($model);
    }
}
