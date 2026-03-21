<?php

namespace App\Http\Controllers\Master;

use App\Contract\Master\ArticleContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\ArticleRequest;
use App\Utils\WebResponse;
use Illuminate\Support\Facades\Request;
use Inertia\Inertia;

class ArticleController extends Controller
{
    protected ArticleContract $service;

    public function __construct(ArticleContract $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        return Inertia::render('master/article/index');
    }

    public function fetch()
    {
        $data = $this->service->all(
            allowedFilters: [],
            allowedSorts: [],
            withPaginate: true,
            relation: ['author', 'media'],
            perPage: request()->get('per_page', 10),
        );
        return response()->json($data);
    }

    public function create()
    {
        return Inertia::render('master/article/form');
    }

    public function store(ArticleRequest $request)
    {
        $data = $this->service->create($request->validated());
        return WebResponse::response($data, 'backoffice.master.article.index');
    }

    public function show($id)
    {
        $data = $this->service->find($id, ['author', 'media']);

        return Inertia::render('master/article/form', [
            'article' => $data,
        ]);
    }

    public function update(ArticleRequest $request, $id)
    {
        $data = $this->service->update($id, $request->validated());
        return WebResponse::response($data, 'backoffice.master.article.index');
    }

    public function destroy($id)
    {
        $data = $this->service->destroy($id);
        return WebResponse::response($data, 'backoffice.master.article.index');
    }

    public function destroy_bulk(Request $request)
    {
        $data = $this->service->bulkDeleteByIds($request->ids ?? []);
        return WebResponse::response($data, 'backoffice.master.article.index');
    }
}
