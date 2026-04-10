<?php

namespace App\Service\Master;

use App\Contract\Master\SpeakerContract;
use App\Models\Speaker;
use App\Service\BaseService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SpeakerService extends BaseService implements SpeakerContract
{
    protected array $relation = ['media'];
    protected array $fileKeys = ['photo'];

    public function __construct(Speaker $model)
    {
        parent::__construct($model);
    }

    public function create($payloads)
    {
        try {
            DB::beginTransaction();
            // Remove file keys from payloads before creating
            foreach ($this->fileKeys as $fileKey) {
                unset($payloads[$fileKey]);
            }

            $payloads['slug'] = $this->generateUniqueSlug($payloads['name']);

            $model = $this->model->create($payloads);

            // Handle media upload
            foreach ($this->fileKeys as $fileKey) {
                $model->addMultipleMediaFromRequest([$fileKey])
                    ->each(function ($image) use ($fileKey) {
                        $image->toMediaCollection($fileKey);
                    });
            }

            DB::commit();
            return $model->fresh(['media']);
        } catch (\Exception $e) {
            DB::rollBack();
            return $e;
        }
    }

    public function update($id, $payloads)
    {
        try {
            DB::beginTransaction();
            // Remove file keys from payloads before updating
            foreach ($this->fileKeys as $fileKey) {
                if (isset($payloads[$fileKey])) {
                    unset($payloads[$fileKey]);
                }
            }

            $model = $this->model->findOrFail($id);

            if (isset($payloads['name']) && $payloads['name'] !== $model->name) {
                $payloads['slug'] = $this->generateUniqueSlug($payloads['name'], $model->id);
            }

            $model->update($payloads);

            // Handle media upload
            foreach ($this->fileKeys as $fileKey) {
                $model->addMultipleMediaFromRequest([$fileKey])
                    ->each(function ($image) use ($fileKey) {
                        $image->toMediaCollection($fileKey);
                    });
            }

            DB::commit();
            return $model->fresh(['media']);
        } catch (\Exception $e) {
            DB::rollBack();
            return $e;
        }
    }

    private function generateUniqueSlug(string $name, ?int $excludeId = null): string
    {
        $slug = Str::slug($name);
        $query = Speaker::where('slug', $slug);

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        if (! $query->exists()) {
            return $slug;
        }

        $counter = 2;
        while (Speaker::where('slug', "{$slug}-{$counter}")
            ->when($excludeId, fn ($q) => $q->where('id', '!=', $excludeId))
            ->exists()
        ) {
            $counter++;
        }

        return "{$slug}-{$counter}";
    }
}
