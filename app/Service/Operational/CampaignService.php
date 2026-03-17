<?php

namespace App\Service\Operational;

use App\Contract\Operational\CampaignContract;
use App\Models\Campaign;
use App\Models\Customer;
use App\Service\BaseService;
use App\Service\MailService;
use Exception;
use Illuminate\Support\Facades\DB;

class CampaignService extends BaseService implements CampaignContract
{
    protected array $relation = ['mailTemplate'];

    public function __construct(Campaign $model)
    {
        parent::__construct($model);
    }

    public function previewCount(array $tags): int
    {
        return Customer::matchingAnyTags($tags)->count();
    }

    public function sendCampaign(int $campaignId): mixed
    {
        try {
            DB::beginTransaction();

            $campaign = Campaign::with('mailTemplate')->findOrFail($campaignId);

            abort_if($campaign->isSent(), 422, 'Campaign has already been sent.');
            abort_if(!$campaign->mailTemplate || !$campaign->mailTemplate->is_active, 422, 'Mail template is not active.');

            $templateSlug = $campaign->mailTemplate->slug;
            $sent = 0;

            Customer::matchingAnyTags($campaign->target_tags)
                ->select(['id', 'name', 'email'])
                ->chunk(100, function ($customers) use ($templateSlug, $campaign, &$sent) {
                    foreach ($customers as $customer) {
                        MailService::sendForCampaign(
                            slug: $templateSlug,
                            to: $customer->email,
                            data: [
                                'customer_name' => $customer->name,
                            ],
                            campaignId: $campaign->id,
                        );
                        $sent++;
                    }
                });

            $campaign->update([
                'sent_count' => $sent,
                'sent_at' => now(),
            ]);

            DB::commit();

            return $campaign->fresh($this->relation);
        } catch (Exception $e) {
            DB::rollBack();
            return $e;
        }
    }
}
