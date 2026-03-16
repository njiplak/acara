<?php

namespace App\Service\Master;

use App\Contract\Master\SpeakerContract;
use App\Models\Speaker;
use App\Service\BaseService;
use Illuminate\Support\Facades\DB;

class SpeakerService extends BaseService implements SpeakerContract
{
    protected array $relation = ['catalogs', 'media'];
    protected array $fileKeys = ['photo'];

    public function __construct(Speaker $model)
    {
        parent::__construct($model);
    }

    public function create($payloads)
    {
        try {
            DB::beginTransaction();
            $catalogIds = $payloads['catalog_ids'] ?? [];
            unset($payloads['catalog_ids']);

            // Remove file keys from payloads before creating
            foreach ($this->fileKeys as $fileKey) {
                unset($payloads[$fileKey]);
            }

            $model = $this->model->create($payloads);

            // Handle media upload
            foreach ($this->fileKeys as $fileKey) {
                $model->addMultipleMediaFromRequest([$fileKey])
                    ->each(function ($image) use ($fileKey) {
                        $image->toMediaCollection($fileKey);
                    });
            }

            $model->catalogs()->sync($catalogIds);

            DB::commit();
            return $model->fresh(['catalogs', 'media']);
        } catch (\Exception $e) {
            DB::rollBack();
            return $e;
        }
    }

    public function update($id, $payloads)
    {
        try {
            DB::beginTransaction();
            $catalogIds = $payloads['catalog_ids'] ?? [];
            unset($payloads['catalog_ids']);

            // Remove file keys from payloads before updating
            foreach ($this->fileKeys as $fileKey) {
                if (isset($payloads[$fileKey])) {
                    unset($payloads[$fileKey]);
                }
            }

            $model = $this->model->findOrFail($id);
            $model->update($payloads);

            // Handle media upload
            foreach ($this->fileKeys as $fileKey) {
                $model->addMultipleMediaFromRequest([$fileKey])
                    ->each(function ($image) use ($fileKey) {
                        $image->toMediaCollection($fileKey);
                    });
            }

            $model->catalogs()->sync($catalogIds);

            DB::commit();
            return $model->fresh(['catalogs', 'media']);
        } catch (\Exception $e) {
            DB::rollBack();
            return $e;
        }
    }
}
