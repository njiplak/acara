<?php

namespace App\Service;

use App\Mail\WaitlistSpotAvailableMail;
use App\Models\Event;
use App\Models\Order;
use App\Models\Waitlist;
use Illuminate\Support\Facades\Mail;

class WaitlistService
{
    /**
     * Notify all waitlisted customers when a spot opens up.
     * Called after cancel/refund frees a spot.
     */
    public static function notifyIfSpotAvailable(int $eventId, int $catalogId): void
    {
        $event = Event::with('catalogs')->find($eventId);
        if (!$event) return;

        $catalog = $event->catalogs->firstWhere('id', $catalogId);
        if (!$catalog) return;

        $maxParticipant = $catalog->pivot->max_participant;
        if (!$maxParticipant) return;

        $activeCount = Order::where('event_id', $eventId)
            ->where('catalog_id', $catalogId)
            ->whereNotIn('status', ['cancelled', 'rejected', 'refunded'])
            ->count();

        if ($activeCount >= $maxParticipant) return;

        $waitlisted = Waitlist::where('event_id', $eventId)
            ->where('catalog_id', $catalogId)
            ->whereNull('notified_at')
            ->orderBy('position')
            ->get();

        if ($waitlisted->isEmpty()) return;

        $eventUrl = url("/events/{$eventId}");

        foreach ($waitlisted as $entry) {
            $entry->loadMissing('customer');

            Mail::to($entry->customer->email)->queue(new WaitlistSpotAvailableMail(
                customerName: $entry->customer->name,
                eventName: $event->name,
                catalogName: $catalog->name,
                eventUrl: $eventUrl,
            ));

            $entry->update(['notified_at' => now()]);
        }
    }
}
