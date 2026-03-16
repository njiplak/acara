<?php

namespace App\Http\Controllers\Master;

use App\Contract\Master\EventContract;
use App\Contract\Master\EventMaterialContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\EventMaterialRequest;
use App\Utils\WebResponse;
use Inertia\Inertia;

class EventMaterialController extends Controller
{
    protected EventMaterialContract $service;
    protected EventContract $eventService;

    public function __construct(EventMaterialContract $service, EventContract $eventService)
    {
        $this->service = $service;
        $this->eventService = $eventService;
    }

    public function index($eventId)
    {
        $event = $this->eventService->find($eventId, ['catalogs']);

        $materials = $this->service->all(
            allowedFilters: [],
            allowedSorts: [],
            withPaginate: false,
            relation: ['media', 'catalog'],
            conditions: [['event_id', $eventId]],
        );

        return Inertia::render('master/event/materials/index', [
            'event' => $event,
            'materials' => $materials,
        ]);
    }

    public function create($eventId)
    {
        $event = $this->eventService->find($eventId, ['catalogs']);

        return Inertia::render('master/event/materials/form', [
            'event' => $event,
        ]);
    }

    public function store(EventMaterialRequest $request)
    {
        $data = $this->service->create($request->validated());

        return WebResponse::response($data, ['backoffice.master.event.materials.index', ['eventId' => $request->event_id]]);
    }

    public function show($eventId, $id)
    {
        $event = $this->eventService->find($eventId, ['catalogs']);
        $material = $this->service->find($id, ['media', 'catalog']);

        return Inertia::render('master/event/materials/form', [
            'event' => $event,
            'material' => $material,
        ]);
    }

    public function update(EventMaterialRequest $request, $eventId, $id)
    {
        $data = $this->service->update($id, $request->validated());

        return WebResponse::response($data, ['backoffice.master.event.materials.index', ['eventId' => $eventId]]);
    }

    public function destroy($eventId, $id)
    {
        $data = $this->service->destroy($id);

        return WebResponse::response($data, ['backoffice.master.event.materials.index', ['eventId' => $eventId]]);
    }
}
