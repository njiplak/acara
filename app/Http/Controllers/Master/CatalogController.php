<?php

namespace App\Http\Controllers\Master;

use App\Contract\Master\AddonContract;
use App\Contract\Master\CatalogContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\CatalogRequest;
use App\Utils\WebResponse;
use Illuminate\Support\Facades\Request;
use Inertia\Inertia;

class CatalogController extends Controller
{
    protected CatalogContract $service;
    protected AddonContract $addonService;

    public function __construct(CatalogContract $service, AddonContract $addonService)
    {
        $this->service = $service;
        $this->addonService = $addonService;
    }

    public function index()
    {
        return Inertia::render('master/catalog/index');
    }

    public function fetch()
    {
        $data = $this->service->all(
            allowedFilters: [],
            allowedSorts: [],
            withPaginate: true,
            relation: ['addons'],
            perPage: request()->get('per_page', 10)
        );
        return response()->json($data);
    }

    public function create()
    {
        $addons = $this->addonService->all(
            allowedFilters: [],
            allowedSorts: [],
            withPaginate: false,
        );

        return Inertia::render('master/catalog/form', [
            'addons' => $addons,
        ]);
    }

    public function store(CatalogRequest $request)
    {
        $data = $this->service->create($request->validated());
        return WebResponse::response($data, 'backoffice.master.catalog.index');
    }

    public function show($id)
    {
        $data = $this->service->find($id, ['addons']);
        $addons = $this->addonService->all(
            allowedFilters: [],
            allowedSorts: [],
            withPaginate: false,
        );

        return Inertia::render('master/catalog/form', [
            'catalog' => $data,
            'addons' => $addons,
        ]);
    }

    public function update(CatalogRequest $request, $id)
    {
        $data = $this->service->update($id, $request->validated());
        return WebResponse::response($data, 'backoffice.master.catalog.index');
    }

    public function destroy($id)
    {
        $data = $this->service->destroy($id);
        return WebResponse::response($data, 'backoffice.master.catalog.index');
    }

    public function destroy_bulk(Request $request)
    {
        $data = $this->service->bulkDeleteByIds($request->ids ?? []);
        return WebResponse::response($data, 'backoffice.master.catalog.index');
    }
}
