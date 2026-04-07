<?php

namespace App\Http\Controllers\Master;

use App\Contract\Master\SubscriptionFeatureContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\SubscriptionFeatureRequest;
use App\Utils\WebResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubscriptionFeatureController extends Controller
{
    protected SubscriptionFeatureContract $service;

    public function __construct(SubscriptionFeatureContract $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        return Inertia::render('master/subscription-feature/index');
    }

    public function fetch()
    {
        $data = $this->service->all(
            allowedFilters: [],
            allowedSorts: [],
            withPaginate: true,
            relation: ['plans'],
            perPage: request()->get('per_page', 10),
        );

        return response()->json($data);
    }

    public function create()
    {
        return Inertia::render('master/subscription-feature/form');
    }

    public function store(SubscriptionFeatureRequest $request)
    {
        $data = $this->service->create($request->validated());
        return WebResponse::response($data, 'backoffice.master.subscription-feature.index');
    }

    public function show($id)
    {
        $data = $this->service->find($id, ['plans']);

        return Inertia::render('master/subscription-feature/form', [
            'feature' => $data,
        ]);
    }

    public function update(SubscriptionFeatureRequest $request, $id)
    {
        $data = $this->service->update($id, $request->validated());
        return WebResponse::response($data, 'backoffice.master.subscription-feature.index');
    }

    public function destroy($id)
    {
        $data = $this->service->destroy($id);
        return WebResponse::response($data, 'backoffice.master.subscription-feature.index');
    }

    public function destroy_bulk(Request $request)
    {
        $data = $this->service->bulkDeleteByIds($request->ids ?? []);
        return WebResponse::response($data, 'backoffice.master.subscription-feature.index');
    }
}
