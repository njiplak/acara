<?php

namespace App\Http\Controllers\Operational;

use App\Contract\Operational\CustomerContract;
use App\Filters\CustomerTagFilter;
use App\Http\Controllers\Controller;
use App\Utils\WebResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\QueryBuilder\AllowedFilter;

class CustomerController extends Controller
{
    protected CustomerContract $service;

    public function __construct(CustomerContract $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        return Inertia::render(component: 'operational/customer/index');
    }

    public function fetch()
    {
        $data = $this->service->allWithTags(
            allowedFilters: [
                AllowedFilter::custom('tags', new CustomerTagFilter()),
            ],
            allowedSorts: ['name', 'email', 'created_at'],
            withPaginate: true,
            perPage: request()->get('per_page', 10),
        );
        return response()->json($data);
    }

    public function show($id)
    {
        $data = $this->service->findWithTags($id);
        return Inertia::render('operational/customer/show', [
            'customer' => $data,
        ]);
    }

    public function destroy($id)
    {
        $data = $this->service->destroy($id);
        return WebResponse::response($data, 'backoffice.operational.customer.index');
    }

    public function destroy_bulk(Request $request)
    {
        $data = $this->service->bulkDeleteByIds($request->ids ?? []);
        return WebResponse::response($data, 'backoffice.operational.customer.index');
    }
}
