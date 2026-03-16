<?php

namespace App\Service\Master;

use App\Contract\Master\VenueContract;
use App\Models\Venue;
use App\Service\BaseService;

class VenueService extends BaseService implements VenueContract
{
    public function __construct(Venue $model)
    {
        parent::__construct($model);
    }
}
