<?php

namespace App\Http\Controllers\Master;

use App\Contract\Master\CatalogContract;
use App\Contract\Master\SpeakerContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\SpeakerRequest;
use App\Utils\WebResponse;
use Illuminate\Support\Facades\Request;
use Inertia\Inertia;

class SpeakerController extends Controller
{
    protected SpeakerContract $service;
    protected CatalogContract $catalogService;

    public function __construct(SpeakerContract $service, CatalogContract $catalogService)
    {
        $this->service = $service;
        $this->catalogService = $catalogService;
    }

    public function index()
    {
        return Inertia::render('master/speaker/index');
    }

    public function fetch()
    {
        $data = $this->service->all(
            allowedFilters: [],
            allowedSorts: [],
            withPaginate: true,
            relation: ['catalogs', 'media'],
            perPage: request()->get('per_page', 10)
        );
        return response()->json($data);
    }

    public function create()
    {
        $catalogs = $this->catalogService->all(
            allowedFilters: [],
            allowedSorts: [],
            withPaginate: false,
        );

        return Inertia::render('master/speaker/form', [
            'catalogs' => $catalogs,
        ]);
    }

    public function store(SpeakerRequest $request)
    {
        $data = $this->service->create($request->validated());
        return WebResponse::response($data, 'backoffice.master.speaker.index');
    }

    public function show($id)
    {
        $data = $this->service->find($id, ['catalogs', 'media']);
        $catalogs = $this->catalogService->all(
            allowedFilters: [],
            allowedSorts: [],
            withPaginate: false,
        );

        return Inertia::render('master/speaker/form', [
            'speaker' => $data,
            'catalogs' => $catalogs,
        ]);
    }

    public function update(SpeakerRequest $request, $id)
    {
        $data = $this->service->update($id, $request->validated());
        return WebResponse::response($data, 'backoffice.master.speaker.index');
    }

    public function destroy($id)
    {
        $data = $this->service->destroy($id);
        return WebResponse::response($data, 'backoffice.master.speaker.index');
    }

    public function destroy_bulk(Request $request)
    {
        $data = $this->service->bulkDeleteByIds($request->ids ?? []);
        return WebResponse::response($data, 'backoffice.master.speaker.index');
    }
}
