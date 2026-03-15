<?php

namespace App\Http\Controllers\Master;

use App\Contract\Master\AddonContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\AddonRequest;
use App\Utils\WebResponse;
use Illuminate\Support\Facades\Request;
use Inertia\Inertia;

class AddonController extends Controller
{
    protected AddonContract $service;

    public function __construct(AddonContract $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        return Inertia::render('master/addon/index');
    }

    public function fetch()
    {
        $data = $this->service->all(
            allowedFilters: [],
            allowedSorts: [],
            withPaginate: true,
            perPage: request()->get('per_page', 10)
        );
        return response()->json($data);
    }

    public function create()
    {
        return Inertia::render('master/addon/form');
    }

    public function store(AddonRequest $request)
    {
        $data = $this->service->create($request->validated());
        return WebResponse::response($data, 'backoffice.master.addon.index');
    }

    public function show($id)
    {
        $data = $this->service->find($id);
        return Inertia::render('master/addon/form', [
            'addon' => $data,
        ]);
    }

    public function update(AddonRequest $request, $id)
    {
        $data = $this->service->update($id, $request->validated());
        return WebResponse::response($data, 'backoffice.master.addon.index');
    }

    public function destroy($id)
    {
        $data = $this->service->destroy($id);
        return WebResponse::response($data, 'backoffice.master.addon.index');
    }

    public function destroy_bulk(Request $request)
    {
        $data = $this->service->bulkDeleteByIds($request->ids ?? []);
        return WebResponse::response($data, 'backoffice.master.addon.index');
    }
}
