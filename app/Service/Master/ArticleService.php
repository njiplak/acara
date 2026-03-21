<?php

namespace App\Service\Master;

use App\Contract\Master\ArticleContract;
use App\Models\Article;
use App\Service\BaseService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ArticleService extends BaseService implements ArticleContract
{
    protected array $relation = ['author', 'media'];
    protected array $fileKeys = ['featured_image'];

    public function __construct(Article $model)
    {
        parent::__construct($model);
    }

    public function create($payloads)
    {
        try {
            DB::beginTransaction();

            foreach ($this->fileKeys as $fileKey) {
                unset($payloads[$fileKey]);
            }

            $payloads['user_id'] = Auth::id();
            $payloads['slug'] = Str::slug($payloads['title']) . '-' . Str::random(6);

            if (!empty($payloads['is_published']) && empty($payloads['published_at'])) {
                $payloads['published_at'] = now();
            }

            $model = $this->model->create($payloads);

            foreach ($this->fileKeys as $fileKey) {
                $model->addMultipleMediaFromRequest([$fileKey])
                    ->each(function ($image) use ($fileKey) {
                        $image->toMediaCollection($fileKey);
                    });
            }

            DB::commit();
            return $model->fresh(['author', 'media']);
        } catch (\Exception $e) {
            DB::rollBack();
            return $e;
        }
    }

    public function update($id, $payloads)
    {
        try {
            DB::beginTransaction();

            foreach ($this->fileKeys as $fileKey) {
                if (isset($payloads[$fileKey])) {
                    unset($payloads[$fileKey]);
                }
            }

            $model = $this->model->findOrFail($id);

            if (!empty($payloads['is_published']) && !$model->is_published && empty($payloads['published_at'])) {
                $payloads['published_at'] = now();
            }

            if (isset($payloads['is_published']) && !$payloads['is_published']) {
                $payloads['published_at'] = null;
            }

            $model->update($payloads);

            foreach ($this->fileKeys as $fileKey) {
                $model->addMultipleMediaFromRequest([$fileKey])
                    ->each(function ($image) use ($fileKey) {
                        $image->toMediaCollection($fileKey);
                    });
            }

            DB::commit();
            return $model->fresh(['author', 'media']);
        } catch (\Exception $e) {
            DB::rollBack();
            return $e;
        }
    }
}
