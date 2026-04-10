<?php

namespace App\Service\Setting;

use App\Contract\Setting\UserContract;
use App\Models\User;
use App\Service\BaseService;
use Exception;
use Illuminate\Support\Facades\DB;

class UserService extends BaseService implements UserContract
{
    protected array $relation = ['roles'];

    public function __construct(User $model)
    {
        parent::__construct($model);
    }

    public function create($payloads)
    {
        try {
            $role = $payloads['role'];
            unset($payloads['role']);

            DB::beginTransaction();
            $model = $this->model->create($payloads);
            $model->syncRoles([$role]);
            DB::commit();

            return $model->fresh($this->relation);
        } catch (Exception $e) {
            DB::rollBack();
            return $e;
        }
    }

    public function update($id, $payloads)
    {
        try {
            $role = $payloads['role'];
            unset($payloads['role']);

            if (empty($payloads['password'])) {
                unset($payloads['password']);
            }

            DB::beginTransaction();
            $model = $this->model->findOrFail($id);
            $model->update($payloads);
            $model->syncRoles([$role]);
            DB::commit();

            return $model->fresh($this->relation);
        } catch (Exception $e) {
            DB::rollBack();
            return $e;
        }
    }
}
