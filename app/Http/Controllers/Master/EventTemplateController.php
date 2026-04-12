<?php

namespace App\Http\Controllers\Master;

use App\Contract\Master\CatalogContract;
use App\Contract\Master\EventContract;
use App\Contract\Master\EventTemplateContract;
use App\Contract\Master\VenueContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\EventTemplateRequest;
use App\Utils\WebResponse;
use Carbon\Carbon;
use Illuminate\Http\Request as HttpRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Request;
use Inertia\Inertia;

class EventTemplateController extends Controller
{
    protected EventTemplateContract $service;
    protected CatalogContract $catalogService;
    protected VenueContract $venueService;

    public function __construct(
        EventTemplateContract $service,
        CatalogContract $catalogService,
        VenueContract $venueService,
    ) {
        $this->service = $service;
        $this->catalogService = $catalogService;
        $this->venueService = $venueService;
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
        return Inertia::render('master/event-template/form', [
            'catalogs' => $this->catalogService->all(
                allowedFilters: [],
                allowedSorts: [],
                withPaginate: false,
                relation: ['speakers', 'addons'],
            ),
            'venues' => $this->venueService->all(
                allowedFilters: [],
                allowedSorts: [],
                withPaginate: false,
            ),
        ]);
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
            'catalogs' => $this->catalogService->all(
                allowedFilters: [],
                allowedSorts: [],
                withPaginate: false,
                relation: ['speakers', 'addons'],
            ),
            'venues' => $this->venueService->all(
                allowedFilters: [],
                allowedSorts: [],
                withPaginate: false,
            ),
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

    public function generateForm($id)
    {
        $template = $this->service->find($id);

        $venues = $this->venueService->all(
            allowedFilters: [],
            allowedSorts: [],
            withPaginate: false,
        );

        return Inertia::render('master/event-template/generate', [
            'template' => $template,
            'venues' => $venues,
        ]);
    }

    public function generate(HttpRequest $request, $id, EventContract $eventService)
    {
        $request->validate([
            'days' => ['required', 'array', 'min:1'],
            'days.*' => ['required', 'integer', 'between:0,6'],
            'start_date' => ['required', 'date', 'after_or_equal:today'],
            'end_date' => ['required', 'date', 'after:start_date'],
            'event_time' => ['required', 'string'],
            'venue_id' => ['nullable', 'integer', 'exists:venues,id'],
        ]);

        $template = $this->service->find($id);
        $td = $template->template_data;

        $days = $request->input('days');
        $startDate = Carbon::parse($request->input('start_date'));
        $endDate = Carbon::parse($request->input('end_date'));
        $eventTime = $request->input('event_time');
        $venueId = $request->input('venue_id');

        $created = 0;

        try {
            DB::beginTransaction();

            $current = $startDate->copy();
            while ($current->lte($endDate)) {
                if (in_array($current->dayOfWeek, $days)) {
                    $dateSuffix = $current->format('D j M');
                    $eventName = $template->name . ' — ' . $dateSuffix;
                    $dateString = $current->toDateString();

                    $eventData = [
                        'name' => $eventName,
                        'description' => $td['description'] ?? null,
                        'start_date' => $dateString,
                        'end_date' => $dateString,
                        'status' => 'draft',
                        'payment_gateway' => $td['payment_gateway'] ?? 'manual',
                        'currency' => $td['currency'] ?? 'IDR',
                        'material_require_checkin' => $td['material_require_checkin'] ?? true,
                        'venue_id' => $venueId,
                        'schedule' => $td['schedule'] ?? null,
                        'catalogs' => collect($td['catalogs'] ?? [])->map(fn($c) => [
                            'catalog_id' => $c['catalog_id'],
                            'max_participant' => $c['max_participant'] ?? null,
                            'pricing_type' => $c['pricing_type'] ?? 'fixed',
                            'pricing_tiers' => $c['pricing_tiers'] ?? [],
                        ])->toArray(),
                    ];

                    $result = $eventService->create($eventData);
                    if (!($result instanceof \Exception)) {
                        $created++;
                    }
                }

                $current->addDay();
            }

            DB::commit();

            return redirect()
                ->route('backoffice.master.event.index')
                ->with('success', "Generated {$created} events from template.");
        } catch (\Exception $e) {
            DB::rollBack();
            return WebResponse::response($e, 'backoffice.master.event-template.index');
        }
    }
}
