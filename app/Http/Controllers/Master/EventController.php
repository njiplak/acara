<?php

namespace App\Http\Controllers\Master;

use App\Contract\Master\CatalogContract;
use App\Contract\Master\EventContract;
use App\Contract\Master\EventTemplateContract;
use App\Contract\Master\VenueContract;
use App\Exports\EventEconomicsExport;
use App\Http\Controllers\Controller;
use App\Http\Requests\EventRequest;
use App\Models\Event;
use App\Models\EventTemplate;
use App\Models\Order;
use App\Utils\WebResponse;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request as HttpRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class EventController extends Controller
{
    protected EventContract $service;
    protected CatalogContract $catalogService;
    protected VenueContract $venueService;
    protected EventTemplateContract $templateService;

    public function __construct(
        EventContract $service,
        CatalogContract $catalogService,
        VenueContract $venueService,
        EventTemplateContract $templateService,
    ) {
        $this->service = $service;
        $this->catalogService = $catalogService;
        $this->venueService = $venueService;
        $this->templateService = $templateService;
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
            relation: ['speakers'],
        );

        $venues = $this->venueService->all(
            allowedFilters: [],
            allowedSorts: [],
            withPaginate: false,
        );

        $props = [
            'catalogs' => $catalogs,
            'venues' => $venues,
        ];

        // Pre-fill from template if template_id is provided
        $templateId = request()->get('template_id');
        if ($templateId) {
            $template = EventTemplate::find($templateId);
            if ($template) {
                $td = $template->template_data;
                $props['event'] = [
                    'name' => '',
                    'description' => $td['description'] ?? '',
                    'start_date' => '',
                    'end_date' => '',
                    'status' => 'draft',
                    'payment_gateway' => $td['payment_gateway'] ?? 'manual',
                    'currency' => $td['currency'] ?? 'IDR',
                    'venue_id' => $td['venue_id'] ?? null,
                    'material_require_checkin' => $td['material_require_checkin'] ?? true,
                    'schedule' => $td['schedule'] ?? [],
                    'catalogs' => collect($td['catalogs'] ?? [])->map(fn($c) => [
                        'id' => $c['catalog_id'],
                        'pivot' => [
                            'max_participant' => $c['max_participant'] ?? null,
                            'pricing_type' => $c['pricing_type'] ?? 'fixed',
                            'pricing_tiers' => $c['pricing_tiers'] ?? [],
                        ],
                    ])->toArray(),
                ];
                $props['fromTemplate'] = $template->name;
            }
        }

        // Load templates list for "Create from Template" dropdown
        $templates = EventTemplate::select('id', 'name')->orderBy('name')->get();
        $props['templates'] = $templates;

        return Inertia::render('master/event/form', $props);
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
            relation: ['speakers'],
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

    public function saveAsTemplate($id)
    {
        $event = $this->service->find($id, ['catalogs']);

        $templateData = [
            'description' => $event->description,
            'payment_gateway' => $event->payment_gateway,
            'currency' => $event->currency,
            'material_require_checkin' => $event->material_require_checkin,
            'venue_id' => $event->venue_id,
            'schedule' => $event->schedule ?? [],
            'catalogs' => $event->catalogs->map(fn($c) => [
                'catalog_id' => $c->id,
                'max_participant' => $c->pivot?->max_participant,
                'pricing_type' => $c->pivot?->pricing_type ?? 'fixed',
                'pricing_tiers' => $c->pivot?->pricing_tiers ?? [],
            ])->toArray(),
        ];

        $data = EventTemplate::create([
            'name' => $event->name . ' Template',
            'description' => 'Created from event: ' . $event->name,
            'template_data' => $templateData,
        ]);

        return WebResponse::response($data, 'backoffice.master.event-template.index');
    }

    public function economics($id)
    {
        $event = $this->service->find($id, ['catalogs', 'venue']);
        $now = CarbonImmutable::now();

        $totalCapacity = $event->catalogs->sum(fn($c) => $c->pivot?->max_participant ?? 0);

        $baseQuery = Order::where('event_id', $id);
        $confirmedQuery = fn() => (clone $baseQuery)->where('status', 'confirmed');
        $activeQuery = fn() => (clone $baseQuery)->whereNotIn('status', ['cancelled', 'rejected', 'refunded']);

        $totalRegistrations = $activeQuery()->count();
        $confirmedCount = $confirmedQuery()->count();
        $checkedInCount = $confirmedQuery()->whereNotNull('checked_in_at')->count();
        $actualRevenue = (int) $confirmedQuery()->sum('total_amount');
        $potentialRevenue = (int) $activeQuery()->sum('total_amount');
        $referralDiscount = (int) $confirmedQuery()->sum('referral_discount');
        $voucherDiscount = (int) $confirmedQuery()->sum('voucher_discount');
        $balanceUsed = (int) $confirmedQuery()->sum('balance_used');
        $addonRevenue = (int) $confirmedQuery()->sum('addons_total');
        $isEventEnded = $event->end_date < $now->toDateString();

        $fillRate = $totalCapacity > 0 ? round(($totalRegistrations / $totalCapacity) * 100, 1) : null;
        $checkInRate = $confirmedCount > 0 ? round(($checkedInCount / $confirmedCount) * 100, 1) : 0;
        $noShowCount = $isEventEnded ? ($confirmedCount - $checkedInCount) : null;

        $revenueByCatalog = Order::where('event_id', $id)
            ->where('status', 'confirmed')
            ->select('catalog_id', DB::raw('COUNT(*) as count'), DB::raw('SUM(total_amount) as revenue'))
            ->groupBy('catalog_id')
            ->with('catalog:id,name')
            ->get();

        $dailyRevenue = Order::where('event_id', $id)
            ->where('status', 'confirmed')
            ->select(DB::raw('DATE(confirmed_at) as date'), DB::raw('SUM(total_amount) as revenue'), DB::raw('COUNT(*) as orders'))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return Inertia::render('master/event/economics', [
            'event' => $event,
            'economics' => [
                'totalCapacity' => $totalCapacity,
                'totalRegistrations' => $totalRegistrations,
                'confirmedCount' => $confirmedCount,
                'checkedInCount' => $checkedInCount,
                'actualRevenue' => $actualRevenue,
                'potentialRevenue' => $potentialRevenue,
                'referralDiscount' => $referralDiscount,
                'voucherDiscount' => $voucherDiscount,
                'balanceUsed' => $balanceUsed,
                'addonRevenue' => $addonRevenue,
                'fillRate' => $fillRate,
                'checkInRate' => $checkInRate,
                'noShowCount' => $noShowCount,
                'isEventEnded' => $isEventEnded,
                'revenueByCatalog' => $revenueByCatalog,
                'dailyRevenue' => $dailyRevenue,
            ],
        ]);
    }

    public function exportEconomics($id)
    {
        $event = $this->service->find($id, ['catalogs', 'venue']);
        $slug = Str::slug($event->name);
        $date = now()->format('Y-m-d');

        return Excel::download(
            new EventEconomicsExport($event),
            "event-economics-{$slug}-{$date}.xlsx",
        );
    }

    public function checkConflicts(HttpRequest $request)
    {
        $validated = $request->validate([
            'event_id' => 'nullable|integer',
            'start_date' => 'required|date',
            'end_date' => 'required|date',
            'venue_id' => 'nullable|integer',
            'speaker_ids' => 'nullable|array',
            'speaker_ids.*' => 'integer',
        ]);

        $conflicts = [];

        if (!empty($validated['venue_id'])) {
            $venueConflicts = Event::where('venue_id', $validated['venue_id'])
                ->where('start_date', '<=', $validated['end_date'])
                ->where('end_date', '>=', $validated['start_date'])
                ->when($validated['event_id'] ?? null, fn($q, $id) => $q->where('id', '!=', $id))
                ->select('id', 'name', 'start_date', 'end_date')
                ->get();

            if ($venueConflicts->isNotEmpty()) {
                $conflicts['venue'] = $venueConflicts;
            }
        }

        if (!empty($validated['speaker_ids'])) {
            $speakerConflicts = Event::where('start_date', '<=', $validated['end_date'])
                ->where('end_date', '>=', $validated['start_date'])
                ->when($validated['event_id'] ?? null, fn($q, $id) => $q->where('id', '!=', $id))
                ->whereHas('catalogs.speakers', fn($q) => $q->whereIn('speakers.id', $validated['speaker_ids']))
                ->with(['catalogs.speakers' => fn($q) => $q->whereIn('speakers.id', $validated['speaker_ids'])])
                ->select('id', 'name', 'start_date', 'end_date')
                ->get()
                ->map(fn($e) => [
                    'id' => $e->id,
                    'name' => $e->name,
                    'start_date' => $e->start_date,
                    'end_date' => $e->end_date,
                    'conflicting_speakers' => $e->catalogs->flatMap->speakers->pluck('name')->unique()->values(),
                ]);

            if ($speakerConflicts->isNotEmpty()) {
                $conflicts['speakers'] = $speakerConflicts;
            }
        }

        return response()->json([
            'has_conflicts' => !empty($conflicts),
            'conflicts' => $conflicts,
        ]);
    }
}
