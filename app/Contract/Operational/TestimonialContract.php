<?php

namespace App\Contract\Operational;

use App\Contract\BaseContract;

interface TestimonialContract extends BaseContract
{
    public function submitTestimonial(array $payloads): mixed;
    public function toggleHighlight(int $id): mixed;
}
