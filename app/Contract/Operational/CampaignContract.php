<?php

namespace App\Contract\Operational;

use App\Contract\BaseContract;

interface CampaignContract extends BaseContract
{
    public function previewCount(array $tags): int;
    public function sendCampaign(int $campaignId): mixed;
}
