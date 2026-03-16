import { useEffect, useRef, useState } from 'react';

type ConflictEvent = {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
};

type SpeakerConflict = ConflictEvent & {
    conflicting_speakers: string[];
};

type ConflictResult = {
    venue?: ConflictEvent[];
    speakers?: SpeakerConflict[];
};

type ConflictCheckParams = {
    eventId?: number;
    startDate: string;
    endDate: string;
    venueId?: number | string;
    speakerIds: number[];
};

export function useConflictCheck(params: ConflictCheckParams) {
    const [loading, setLoading] = useState(false);
    const [conflicts, setConflicts] = useState<ConflictResult>({});
    const abortRef = useRef<AbortController | null>(null);

    useEffect(() => {
        const { startDate, endDate, venueId, speakerIds } = params;

        if (!startDate || !endDate) {
            setConflicts({});
            return;
        }

        const hasVenue = venueId && venueId !== '' && venueId !== 'none';
        const hasSpeakers = speakerIds.length > 0;

        if (!hasVenue && !hasSpeakers) {
            setConflicts({});
            return;
        }

        const timer = setTimeout(async () => {
            if (abortRef.current) abortRef.current.abort();
            const controller = new AbortController();
            abortRef.current = controller;

            setLoading(true);
            try {
                const csrfToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;
                const res = await fetch('/backoffice/master/event/check-conflicts', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
                    },
                    body: JSON.stringify({
                        event_id: params.eventId || null,
                        start_date: startDate,
                        end_date: endDate,
                        venue_id: hasVenue ? Number(venueId) : null,
                        speaker_ids: hasSpeakers ? speakerIds : null,
                    }),
                    signal: controller.signal,
                });

                if (res.ok) {
                    const data = await res.json();
                    setConflicts(data.conflicts || {});
                }
            } catch (e: any) {
                if (e.name !== 'AbortError') {
                    setConflicts({});
                }
            } finally {
                setLoading(false);
            }
        }, 500);

        return () => {
            clearTimeout(timer);
            if (abortRef.current) abortRef.current.abort();
        };
    }, [params.eventId, params.startDate, params.endDate, params.venueId, JSON.stringify(params.speakerIds)]);

    return { loading, conflicts };
}
