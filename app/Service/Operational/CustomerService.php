<?php

namespace App\Service\Operational;

use App\Contract\Operational\CustomerContract;
use App\Models\Customer;
use App\Service\BaseService;

class CustomerService extends BaseService implements CustomerContract
{
    public function __construct(Customer $model)
    {
        parent::__construct($model);
    }
}
