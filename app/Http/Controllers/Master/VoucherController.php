<?php

namespace App\Http\Controllers\Master;

use App\Contract\Master\EventContract;
use App\Contract\Master\VoucherContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\VoucherRequest;
use App\Models\Catalog;
use App\Models\Order;
use App\Utils\WebResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class VoucherController extends Controller
{
    protected VoucherContract $service;
    protected EventContract $eventService;

    public function __construct(VoucherContract $service, EventContract $eventService)
    {
        $this->service = $service;
        $this->eventService = $eventService;
    }

    public function index()
    {
        return Inertia::render('master/voucher/index');
    }

    public function fetch()
    {
        $data = $this->service->all(
            allowedFilters: [],
            allowedSorts: [],
            withPaginate: true,
            relation: ['event', 'catalog'],
            perPage: request()->get('per_page', 10),
        );

        // Append used_count to each voucher
        if (isset($data['items'])) {
            foreach ($data['items'] as &$item) {
                $item->used_count = Order::where('voucher_id', $item->id)
                    ->whereNotIn('status', ['cancelled', 'rejected', 'refunded'])
                    ->count();
            }
        }

        return response()->json($data);
    }

    public function create()
    {
        $events = $this->eventService->all(
            allowedFilters: [],
            allowedSorts: [],
            withPaginate: false,
        );
        $catalogs = Catalog::all();

        return Inertia::render('master/voucher/form', [
            'events' => $events,
            'catalogs' => $catalogs,
        ]);
    }

    public function store(VoucherRequest $request)
    {
        $data = $this->service->create($request->validated());
        return WebResponse::response($data, 'backoffice.master.voucher.index');
    }

    public function show($id)
    {
        $data = $this->service->find($id, ['event', 'catalog']);

        $events = $this->eventService->all(
            allowedFilters: [],
            allowedSorts: [],
            withPaginate: false,
        );
        $catalogs = Catalog::all();

        // Analytics
        $orderQuery = Order::where('voucher_id', $id)
            ->whereNotIn('status', ['cancelled', 'rejected', 'refunded']);

        $analytics = [
            'used_count' => $orderQuery->count(),
            'total_revenue' => (clone $orderQuery)->sum('total_amount'),
            'total_discount_given' => (clone $orderQuery)->sum('voucher_discount'),
        ];

        $recentOrders = Order::with(['customer', 'event', 'catalog'])
            ->where('voucher_id', $id)
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        return Inertia::render('master/voucher/form', [
            'voucher' => $data,
            'events' => $events,
            'catalogs' => $catalogs,
            'analytics' => $analytics,
            'recentOrders' => $recentOrders,
        ]);
    }

    public function update(VoucherRequest $request, $id)
    {
        $data = $this->service->update($id, $request->validated());
        return WebResponse::response($data, 'backoffice.master.voucher.index');
    }

    public function destroy($id)
    {
        $data = $this->service->destroy($id);
        return WebResponse::response($data, 'backoffice.master.voucher.index');
    }

    public function destroy_bulk(Request $request)
    {
        $data = $this->service->bulkDeleteByIds($request->ids ?? []);
        return WebResponse::response($data, 'backoffice.master.voucher.index');
    }
}
