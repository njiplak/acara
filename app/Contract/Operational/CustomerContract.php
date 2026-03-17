<?php

namespace App\Contract\Operational;

use App\Contract\BaseContract;

interface CustomerContract extends BaseContract
{
    public function allWithTags(
        $allowedFilters,
        $allowedSorts,
        bool|null $withPaginate = null,
        int $perPage = 10,
    );

    public function findWithTags($id);
}
