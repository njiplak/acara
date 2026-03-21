<?php

namespace App\Http\Controllers\Master;

use App\Contract\Master\FaqContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\FaqRequest;
use App\Utils\WebResponse;
use Illuminate\Support\Facades\Request;
use Inertia\Inertia;

class FaqController extends Controller
{
    protected FaqContract $service;

    public function __construct(FaqContract $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        return Inertia::render('master/faq/index');
    }

    public function fetch()
    {
        $data = $this->service->all(
            allowedFilters: [],
            allowedSorts: [],
            withPaginate: true,
            perPage: request()->get('per_page', 10),
            orderColumn: 'sort_order',
            orderPosition: 'asc',
        );
        return response()->json($data);
    }

    public function create()
    {
        return Inertia::render('master/faq/form');
    }

    public function store(FaqRequest $request)
    {
        $data = $this->service->create($request->validated());
        return WebResponse::response($data, 'backoffice.master.faq.index');
    }

    public function show($id)
    {
        $data = $this->service->find($id);

        return Inertia::render('master/faq/form', [
            'faq' => $data,
        ]);
    }

    public function update(FaqRequest $request, $id)
    {
        $data = $this->service->update($id, $request->validated());
        return WebResponse::response($data, 'backoffice.master.faq.index');
    }

    public function destroy($id)
    {
        $data = $this->service->destroy($id);
        return WebResponse::response($data, 'backoffice.master.faq.index');
    }

    public function destroy_bulk(Request $request)
    {
        $data = $this->service->bulkDeleteByIds($request->ids ?? []);
        return WebResponse::response($data, 'backoffice.master.faq.index');
    }
}
