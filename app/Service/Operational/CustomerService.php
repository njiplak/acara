<?php

namespace App\Service\Operational;

use App\Contract\Operational\CustomerContract;
use App\Models\Customer;
use App\Service\BaseService;
use Exception;
use Spatie\QueryBuilder\QueryBuilder;

class CustomerService extends BaseService implements CustomerContract
{
    public function __construct(Customer $model)
    {
        parent::__construct($model);
    }

    public function allWithTags(
        $allowedFilters,
        $allowedSorts,
        bool|null $withPaginate = null,
        int $perPage = 10,
    ) {
        try {
            $model = QueryBuilder::for(Customer::withTags())
                ->allowedFilters($allowedFilters)
                ->allowedSorts($allowedSorts)
                ->orderBy('id', 'asc');

            if (is_null($withPaginate)) $withPaginate = config('service-contract.default_paginated');
            if (!$withPaginate) return $model->get()->each(fn ($item) => $item->append('tags'));

            $result = $model->paginate(request()->get('per_page', $perPage))
                ->appends(request()->query());

            $startOrderNo = ($result->currentPage() - 1) * $result->perPage() + 1;

            $items = collect($result->items())->map(function ($item, $index) use ($startOrderNo) {
                $item->order_no = $startOrderNo + $index;
                $item->append('tags');
                return $item;
            })->all();

            return [
                'items' => $items,
                'prev_page' => $result->currentPage() > 1 ? $result->currentPage() - 1 : null,
                'current_page' => $result->currentPage(),
                'next_page' => $result->hasMorePages() ? $result->currentPage() + 1 : null,
                'total_page' => $result->lastPage(),
                'per_page' => $result->perPage(),
            ];
        } catch (Exception $e) {
            return $e;
        }
    }

    public function findWithTags($id)
    {
        try {
            $customer = Customer::withTags()->findOrFail($id);
            $customer->append('tags');
            return $customer;
        } catch (Exception $e) {
            return $e;
        }
    }
}
