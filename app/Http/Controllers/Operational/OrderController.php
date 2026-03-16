<?php

namespace App\Http\Controllers\Operational;

use App\Contract\Operational\OrderContract;
use App\Http\Controllers\Controller;
use App\Models\LandingPageSetting;
use App\Models\Order;
use App\Utils\WebResponse;
use Barryvdh\DomPDF\Facade\Pdf;
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
        $data = $this->service->find($id, ['customer', 'event', 'catalog', 'addons', 'confirmedByUser', 'referrer']);

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

    public function invoice($id)
    {
        $order = $this->service->find($id, ['customer', 'event.venue', 'catalog', 'addons']);
        abort_if($order->status !== 'confirmed', 422, 'Invoice only available for confirmed orders.');

        $settings = LandingPageSetting::instance();
        $pdf = Pdf::loadView('pdf.invoice', ['order' => $order, 'settings' => $settings]);

        return $pdf->download("invoice-{$order->order_code}.pdf");
    }

    public function checkIn($id)
    {
        $result = $this->service->checkIn($id);

        return WebResponse::response($result);
    }

    public function undoCheckIn($id)
    {
        $result = $this->service->undoCheckIn($id);

        return WebResponse::response($result);
    }

    public function scannerPage()
    {
        return Inertia::render('operational/check-in/scanner');
    }

    public function scanCheckIn(Request $request)
    {
        $request->validate([
            'order_code' => ['required', 'string'],
        ]);

        $order = Order::where('order_code', $request->order_code)->first();

        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Order not found.'], 404);
        }

        $result = $this->service->checkIn($order->id);

        if ($result instanceof \Exception) {
            return response()->json(['success' => false, 'message' => $result->getMessage()], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Check-in successful!',
            'order' => $result->load(['customer', 'event', 'catalog']),
        ]);
    }
}
