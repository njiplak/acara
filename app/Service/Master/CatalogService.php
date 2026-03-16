<?php

namespace App\Service\Master;

use App\Contract\Master\CatalogContract;
use App\Models\Catalog;
use App\Service\BaseService;
use Illuminate\Support\Facades\DB;

class CatalogService extends BaseService implements CatalogContract
{
    protected array $relation = ['addons', 'speakers'];

    public function __construct(Catalog $model)
    {
        parent::__construct($model);
    }

    public function create($payloads)
    {
        try {
            DB::beginTransaction();
            $addonIds = $payloads['addon_ids'] ?? [];
            unset($payloads['addon_ids']);
            $speakerIds = $payloads['speaker_ids'] ?? [];
            unset($payloads['speaker_ids']);

            $model = $this->model->create($payloads);
            $model->addons()->sync($addonIds);
            $model->speakers()->sync($speakerIds);

            DB::commit();
            return $model->fresh(['addons', 'speakers']);
        } catch (\Exception $e) {
            DB::rollBack();
            return $e;
        }
    }

    public function update($id, $payloads)
    {
        try {
            DB::beginTransaction();
            $addonIds = $payloads['addon_ids'] ?? [];
            unset($payloads['addon_ids']);
            $speakerIds = $payloads['speaker_ids'] ?? [];
            unset($payloads['speaker_ids']);

            $model = $this->model->findOrFail($id);
            $model->update($payloads);
            $model->addons()->sync($addonIds);
            $model->speakers()->sync($speakerIds);

            DB::commit();
            return $model->fresh(['addons', 'speakers']);
        } catch (\Exception $e) {
            DB::rollBack();
            return $e;
        }
    }
}
