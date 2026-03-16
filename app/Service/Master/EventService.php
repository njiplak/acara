<?php

namespace App\Service\Master;

use App\Contract\Master\EventContract;
use App\Models\Event;
use App\Service\BaseService;
use Illuminate\Support\Facades\DB;

class EventService extends BaseService implements EventContract
{
    protected array $relation = ['catalogs'];

    public function __construct(Event $model)
    {
        parent::__construct($model);
    }

    public function create($payloads)
    {
        try {
            DB::beginTransaction();
            $catalogs = $payloads['catalogs'] ?? [];
            unset($payloads['catalogs']);

            $model = $this->model->create($payloads);

            $pivotData = [];
            foreach ($catalogs as $catalog) {
                $pricingType = $catalog['pricing_type'] ?? 'fixed';
                $pivotData[$catalog['catalog_id']] = [
                    'max_participant' => $catalog['max_participant'] ?? null,
                    'pricing_type' => $pricingType,
                    'pricing_tiers' => $pricingType !== 'fixed'
                        ? json_encode($catalog['pricing_tiers'] ?? [])
                        : null,
                ];
            }
            $model->catalogs()->sync($pivotData);

            DB::commit();
            return $model->fresh(['catalogs']);
        } catch (\Exception $e) {
            DB::rollBack();
            return $e;
        }
    }

    public function update($id, $payloads)
    {
        try {
            DB::beginTransaction();
            $catalogs = $payloads['catalogs'] ?? [];
            unset($payloads['catalogs']);

            $model = $this->model->findOrFail($id);
            $model->update($payloads);

            $pivotData = [];
            foreach ($catalogs as $catalog) {
                $pricingType = $catalog['pricing_type'] ?? 'fixed';
                $pivotData[$catalog['catalog_id']] = [
                    'max_participant' => $catalog['max_participant'] ?? null,
                    'pricing_type' => $pricingType,
                    'pricing_tiers' => $pricingType !== 'fixed'
                        ? json_encode($catalog['pricing_tiers'] ?? [])
                        : null,
                ];
            }
            $model->catalogs()->sync($pivotData);

            DB::commit();
            return $model->fresh(['catalogs']);
        } catch (\Exception $e) {
            DB::rollBack();
            return $e;
        }
    }
}
