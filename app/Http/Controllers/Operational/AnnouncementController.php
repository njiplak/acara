<?php

namespace App\Http\Controllers\Operational;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventAnnouncement;
use App\Models\Order;
use App\Service\MailService;
use App\Utils\WebResponse;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AnnouncementController extends Controller
{
    public function index()
    {
        return Inertia::render('operational/announcement/index');
    }

    public function fetch()
    {
        $announcements = EventAnnouncement::with('event')
            ->orderByDesc('id')
            ->paginate(request()->get('per_page', 10));

        return response()->json($announcements);
    }

    public function create()
    {
        $events = Event::where('status', 'published')
            ->orderByDesc('start_date')
            ->get(['id', 'name', 'start_date', 'end_date']);

        return Inertia::render('operational/announcement/form', [
            'events' => $events,
        ]);
    }

    public function recipientCount(Request $request)
    {
        $eventId = $request->input('event_id');

        if (!$eventId) {
            return response()->json(['count' => 0]);
        }

        $count = Order::where('event_id', $eventId)
            ->where('status', 'confirmed')
            ->whereNotNull('checked_in_at')
            ->count();

        return response()->json(['count' => $count]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'event_id' => ['required', 'integer', 'exists:events,id'],
            'subject' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string'],
        ]);

        try {
            DB::beginTransaction();

            $event = Event::findOrFail($validated['event_id']);

            $announcement = EventAnnouncement::create([
                'event_id' => $event->id,
                'subject' => $validated['subject'],
                'message' => $validated['message'],
            ]);

            $orders = Order::with('customer')
                ->where('event_id', $event->id)
                ->where('status', 'confirmed')
                ->whereNotNull('checked_in_at')
                ->get();

            $sent = 0;
            foreach ($orders as $order) {
                MailService::send(
                    slug: 'event-announcement',
                    to: $order->customer->email,
                    data: [
                        'customer_name' => $order->customer->name,
                        'event_name' => $event->name,
                        'subject' => $validated['subject'],
                        'message' => nl2br(e($validated['message'])),
                    ],
                    orderId: $order->id,
                    eventId: $event->id,
                );
                $sent++;
            }

            $announcement->update([
                'sent_count' => $sent,
                'sent_at' => now(),
            ]);

            DB::commit();

            return WebResponse::response($announcement, 'backoffice.operational.announcement.index');
        } catch (Exception $e) {
            DB::rollBack();
            return WebResponse::response($e, 'backoffice.operational.announcement.index');
        }
    }
}
