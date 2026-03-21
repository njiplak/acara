<?php

namespace App\Http\Controllers\Operational;

use App\Contract\Operational\OrderContract;
use App\Exports\OrderExport;
use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\LandingPageSetting;
use App\Models\Order;
use App\Utils\WebResponse;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

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
        $data = $this->service->find($id, ['customer', 'event', 'catalog', 'addons', 'confirmedByUser', 'referrer', 'voucher', 'paymentTransactions']);

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

    public function export(Request $request)
    {
        $eventId = $request->query('event_id') ? (int) $request->query('event_id') : null;
        $date = now()->format('Y-m-d');

        if ($eventId) {
            $event = Event::find($eventId);
            $slug = $event ? Str::slug($event->name) : $eventId;
            $filename = "orders-{$slug}-{$date}.xlsx";
        } else {
            $filename = "orders-{$date}.xlsx";
        }

        return Excel::download(new OrderExport($eventId), $filename);
    }

    public function scannerPage()
    {
        $events = Event::where('status', 'published')
            ->whereNotNull('schedule')
            ->orderByDesc('start_date')
            ->get(['id', 'name', 'schedule', 'start_date']);

        return Inertia::render('operational/check-in/scanner', [
            'events' => $events,
        ]);
    }

    public function scanCheckIn(Request $request)
    {
        $request->validate([
            'order_code' => ['required', 'string'],
            'session_index' => ['nullable', 'integer', 'min:0'],
        ]);

        $order = Order::where('order_code', $request->order_code)->first();

        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Order not found.'], 404);
        }

        // If session_index is provided, do per-session check-in
        if ($request->has('session_index') && $request->session_index !== null) {
            $result = $this->service->sessionCheckIn($order->id, (int) $request->session_index);
        } else {
            $result = $this->service->checkIn($order->id);
        }

        if ($result instanceof \Exception) {
            return response()->json(['success' => false, 'message' => $result->getMessage()], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Check-in successful!',
            'order' => $result->load(['customer', 'event', 'catalog', 'sessionAttendances']),
        ]);
    }

    public function sessionCheckIn(Request $request, $id)
    {
        $request->validate(['session_index' => ['required', 'integer', 'min:0']]);

        $result = $this->service->sessionCheckIn($id, (int) $request->session_index);

        return WebResponse::response($result);
    }

    public function undoSessionCheckIn(Request $request, $id)
    {
        $request->validate(['session_index' => ['required', 'integer', 'min:0']]);

        $result = $this->service->undoSessionCheckIn($id, (int) $request->session_index);

        return WebResponse::response($result);
    }
}
