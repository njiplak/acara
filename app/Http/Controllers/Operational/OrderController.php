<?php

namespace App\Http\Controllers\Operational;

use App\Contract\Operational\OrderContract;
use App\Http\Controllers\Controller;
use App\Utils\WebResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class OrderController extends Controller
{
    protected OrderContract $service;

    public function __construct(OrderContract $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        return Inertia::render('operational/order/index');
    }

    public function fetch()
    {
        $data = $this->service->all(
            allowedFilters: [],
            allowedSorts: [],
            withPaginate: true,
            relation: ['customer', 'event', 'catalog'],
            perPage: request()->get('per_page', 10),
            orderColumn: 'id',
            orderPosition: 'desc',
        );

        return response()->json($data);
    }

    public function show($id)
    {
        $data = $this->service->find($id, ['customer', 'event', 'catalog', 'addons', 'confirmedByUser']);

        return Inertia::render('operational/order/show', [
            'order' => $data,
        ]);
    }

    public function confirm($id)
    {
        $result = $this->service->confirmOrder($id, Auth::id());

        return WebResponse::response($result);
    }

    public function reject(Request $request, $id)
    {
        $request->validate([
            'rejection_reason' => ['required', 'string', 'max:500'],
        ]);

        $result = $this->service->rejectOrder($id, Auth::id(), $request->rejection_reason);

        return WebResponse::response($result);
    }

    public function refund(Request $request, $id)
    {
        $request->validate([
            'refund_reason' => ['required', 'string', 'max:500'],
        ]);

        $result = $this->service->refundOrder($id, Auth::id(), $request->refund_reason);

        return WebResponse::response($result);
    }
}
