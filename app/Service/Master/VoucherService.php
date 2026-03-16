<?php

namespace App\Service\Master;

use App\Contract\Master\VoucherContract;
use App\Models\Voucher;
use App\Service\BaseService;

class VoucherService extends BaseService implements VoucherContract
{
    public function __construct(Voucher $model)
    {
        parent::__construct($model);
    }
}
