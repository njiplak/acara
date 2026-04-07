<?php

namespace App\Http\Controllers\Master;

use App\Contract\Master\SubscriptionFeatureContract;
use App\Contract\Master\SubscriptionPlanContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\SubscriptionPlanRequest;
use App\Utils\WebResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\SubscriptionPlan;
use LucasDotVin\Soulbscription\Models\Subscription;

class SubscriptionPlanController extends Controller
{
    protected SubscriptionPlanContract $service;
    protected SubscriptionFeatureContract $featureService;

    public function __construct(SubscriptionPlanContract $service, SubscriptionFeatureContract $featureService)
    {
        $this->service = $service;
        $this->featureService = $featureService;
    }

    public function index()
    {
        return Inertia::render('master/subscription-plan/index');
    }

    public function fetch()
    {
        $data = $this->service->all(
            allowedFilters: [],
            allowedSorts: [],
            withPaginate: true,
            relation: ['features'],
            perPage: request()->get('per_page', 10),
            orderColumn: 'sort_order',
        );

        if (isset($data['items'])) {
            foreach ($data['items'] as &$item) {
                $item->subscribers_count = Subscription::where('plan_id', $item->id)
                    ->withoutExpired()
                    ->count();
            }
        }

        return response()->json($data);
    }

    public function create()
    {
        $features = $this->featureService->all(
            allowedFilters: [],
            allowedSorts: [],
            withPaginate: false,
        );

        return Inertia::render('master/subscription-plan/form', [
            'features' => $features,
        ]);
    }

    public function store(SubscriptionPlanRequest $request)
    {
        $validated = $request->validated();
        $featureData = $validated['features'] ?? [];
        unset($validated['features']);

        $result = $this->service->create($validated);

        if (!($result instanceof \Exception) && !empty($featureData)) {
            $syncData = [];
            foreach ($featureData as $feature) {
                $syncData[$feature['id']] = ['charges' => $feature['charges'] ?? null];
            }
            $result->features()->sync($syncData);
        }

        return WebResponse::response($result, 'backoffice.master.subscription-plan.index');
    }

    public function show($id)
    {
        $data = $this->service->find($id, ['features']);

        $features = $this->featureService->all(
            allowedFilters: [],
            allowedSorts: [],
            withPaginate: false,
        );

        $subscribersCount = Subscription::where('plan_id', $id)
            ->withoutExpired()
            ->count();

        return Inertia::render('master/subscription-plan/form', [
            'plan' => $data,
            'features' => $features,
            'analytics' => [
                'subscribers_count' => $subscribersCount,
            ],
        ]);
    }

    public function update(SubscriptionPlanRequest $request, $id)
    {
        $validated = $request->validated();
        $featureData = $validated['features'] ?? [];
        unset($validated['features']);

        $result = $this->service->update($id, $validated);

        if (!($result instanceof \Exception)) {
            $syncData = [];
            foreach ($featureData as $feature) {
                $syncData[$feature['id']] = ['charges' => $feature['charges'] ?? null];
            }
            $result->features()->sync($syncData);
        }

        return WebResponse::response($result, 'backoffice.master.subscription-plan.index');
    }

    public function destroy($id)
    {
        $data = $this->service->destroy($id);
        return WebResponse::response($data, 'backoffice.master.subscription-plan.index');
    }

    public function destroy_bulk(Request $request)
    {
        $data = $this->service->bulkDeleteByIds($request->ids ?? []);
        return WebResponse::response($data, 'backoffice.master.subscription-plan.index');
    }
}
