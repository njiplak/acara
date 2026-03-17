<?php

namespace App\Contract\Operational;

use App\Contract\BaseContract;

interface SurveyContract extends BaseContract
{
    public function submitResponse(array $payloads): mixed;
    public function getResults(int $surveyId): mixed;
}
