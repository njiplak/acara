<?php

namespace App\Http\Controllers\Master;

use App\Contract\Master\EventTemplateContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\EventTemplateRequest;
use App\Utils\WebResponse;
use Illuminate\Support\Facades\Request;
use Inertia\Inertia;

class EventTemplateController extends Controller
{
    protected EventTemplateContract $service;

    public function __construct(EventTemplateContract $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        return Inertia::render('master/event-template/index');
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
        return Inertia::render('master/event-template/form');
    }

    public function store(EventTemplateRequest $request)
    {
        $data = $this->service->create($request->validated());
        return WebResponse::response($data, 'backoffice.master.event-template.index');
    }

    public function show($id)
    {
        $data = $this->service->find($id);
        return Inertia::render('master/event-template/form', [
            'template' => $data,
        ]);
    }

    public function update(EventTemplateRequest $request, $id)
    {
        $data = $this->service->update($id, $request->validated());
        return WebResponse::response($data, 'backoffice.master.event-template.index');
    }

    public function destroy($id)
    {
        $data = $this->service->destroy($id);
        return WebResponse::response($data, 'backoffice.master.event-template.index');
    }

    public function destroy_bulk(Request $request)
    {
        $data = $this->service->bulkDeleteByIds($request->ids ?? []);
        return WebResponse::response($data, 'backoffice.master.event-template.index');
    }
}
