<?php

namespace App\Http\Controllers\Master;

use App\Contract\Master\VenueContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\VenueRequest;
use App\Utils\WebResponse;
use Illuminate\Support\Facades\Request;
use Inertia\Inertia;

class VenueController extends Controller
{
    protected VenueContract $service;

    public function __construct(VenueContract $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        return Inertia::render('master/venue/index');
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
        return Inertia::render('master/venue/form');
    }

    public function store(VenueRequest $request)
    {
        $data = $this->service->create($request->validated());
        return WebResponse::response($data, 'backoffice.master.venue.index');
    }

    public function show($id)
    {
        $data = $this->service->find($id);
        return Inertia::render('master/venue/form', [
            'venue' => $data,
        ]);
    }

    public function update(VenueRequest $request, $id)
    {
        $data = $this->service->update($id, $request->validated());
        return WebResponse::response($data, 'backoffice.master.venue.index');
    }

    public function destroy($id)
    {
        $data = $this->service->destroy($id);
        return WebResponse::response($data, 'backoffice.master.venue.index');
    }

    public function destroy_bulk(Request $request)
    {
        $data = $this->service->bulkDeleteByIds($request->ids ?? []);
        return WebResponse::response($data, 'backoffice.master.venue.index');
    }
}
