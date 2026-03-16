<?php

namespace App\Http\Controllers\Setting;

use App\Contract\Setting\PageContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\PageRequest;
use App\Utils\WebResponse;
use Inertia\Inertia;

class PageController extends Controller
{
    protected PageContract $service;

    public function __construct(PageContract $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        return Inertia::render('setting/page/index');
    }

    public function fetch()
    {
        $data = $this->service->all(
            allowedFilters: ['title', 'slug', 'status'],
            allowedSorts: ['title', 'status', 'created_at'],
            withPaginate: true,
            perPage: request()->get('per_page', 10)
        );
        return response()->json($data);
    }

    public function create()
    {
        return Inertia::render('setting/page/form');
    }

    public function store(PageRequest $request)
    {
        $data = $this->service->create($request->validated());
        return WebResponse::response($data, 'backoffice.setting.page.index');
    }

    public function show($id)
    {
        $data = $this->service->find($id);
        return Inertia::render('setting/page/form', [
            'page_data' => $data,
        ]);
    }

    public function update(PageRequest $request, $id)
    {
        $data = $this->service->update($id, $request->validated());
        return WebResponse::response($data, 'backoffice.setting.page.index');
    }

    public function destroy($id)
    {
        $page = $this->service->find($id);
        if ($page->is_system) {
            return back()->withErrors(['errors' => 'System pages cannot be deleted.']);
        }

        $data = $this->service->destroy($id);
        return WebResponse::response($data, 'backoffice.setting.page.index');
    }

    public function destroy_bulk()
    {
        $data = $this->service->bulkDeleteByIds(request()->ids ?? []);
        return WebResponse::response($data, 'backoffice.setting.page.index');
    }
}
