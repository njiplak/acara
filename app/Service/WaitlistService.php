<?php

namespace App\Service;

use App\Models\Order;
use App\Models\Waitlist;

class WaitlistService
{
    /**
     * Notify all waitlisted customers when a spot opens up.
     * Called after cancel/refund frees a spot.
     */
    public static function notifyIfSpotAvailable(int $eventId, int $catalogId): void
    {
        $event = \App\Models\Event::with('catalogs')->find($eventId);
        if (!$event) return;

        $catalog = $event->catalogs->firstWhere('id', $catalogId);
        if (!$catalog) return;

        $maxParticipant = $catalog->pivot->max_participant;
        if (!$maxParticipant) return;

        $activeCount = Order::where('event_id', $eventId)
            ->where('catalog_id', $catalogId)
            ->whereNotIn('status', ['cancelled', 'rejected', 'refunded'])
            ->count();

        // Only notify if there's actually a spot now
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

            MailService::send(
                slug: 'waitlist-spot-available',
                to: $entry->customer->email,
                data: [
                    'customer_name' => $entry->customer->name,
                    'event_name' => $event->name,
                    'catalog_name' => $catalog->name,
                    'event_url' => $eventUrl,
                ],
                orderId: null,
                eventId: $eventId,
            );

            $entry->update(['notified_at' => now()]);
        }
    }
}
