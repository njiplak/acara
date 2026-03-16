<?php

namespace App\Http\Controllers\Master;

use App\Contract\Master\CatalogContract;
use App\Contract\Master\EventContract;
use App\Contract\Master\VenueContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\EventRequest;
use App\Models\Order;
use App\Utils\WebResponse;
use Illuminate\Support\Facades\Request;
use Inertia\Inertia;

class EventController extends Controller
{
    protected EventContract $service;
    protected CatalogContract $catalogService;
    protected VenueContract $venueService;

    public function __construct(EventContract $service, CatalogContract $catalogService, VenueContract $venueService)
    {
        $this->service = $service;
        $this->catalogService = $catalogService;
        $this->venueService = $venueService;
    }

    public function index()
    {
        return Inertia::render('master/event/index');
    }

    public function fetch()
    {
        $data = $this->service->all(
            allowedFilters: [],
            allowedSorts: [],
            withPaginate: true,
            relation: ['catalogs'],
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

        $venues = $this->venueService->all(
            allowedFilters: [],
            allowedSorts: [],
            withPaginate: false,
        );

        return Inertia::render('master/event/form', [
            'catalogs' => $catalogs,
            'venues' => $venues,
        ]);
    }

    public function store(EventRequest $request)
    {
        $data = $this->service->create($request->validated());
        return WebResponse::response($data, 'backoffice.master.event.index');
    }

    public function show($id)
    {
        $data = $this->service->find($id, ['catalogs']);
        $catalogs = $this->catalogService->all(
            allowedFilters: [],
            allowedSorts: [],
            withPaginate: false,
        );

        $venues = $this->venueService->all(
            allowedFilters: [],
            allowedSorts: [],
            withPaginate: false,
        );

        return Inertia::render('master/event/form', [
            'event' => $data,
            'catalogs' => $catalogs,
            'venues' => $venues,
        ]);
    }

    public function update(EventRequest $request, $id)
    {
        $data = $this->service->update($id, $request->validated());
        return WebResponse::response($data, 'backoffice.master.event.index');
    }

    public function destroy($id)
    {
        $data = $this->service->destroy($id);
        return WebResponse::response($data, 'backoffice.master.event.index');
    }

    public function registrants($id)
    {
        $event = $this->service->find($id, ['catalogs']);

        $orders = Order::where('event_id', $id)
            ->whereNotIn('status', ['cancelled'])
            ->with(['customer', 'catalog', 'addons'])
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('master/event/registrants', [
            'event' => $event,
            'orders' => $orders,
        ]);
    }

    public function destroy_bulk(Request $request)
    {
        $data = $this->service->bulkDeleteByIds($request->ids ?? []);
        return WebResponse::response($data, 'backoffice.master.event.index');
    }
}
