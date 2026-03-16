import { router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { show } from '@/routes/backoffice/master/event';

type CalendarEvent = {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
    status: 'draft' | 'published';
    fill_rate: number | null;
    total_capacity: number;
    total_registrations: number;
    is_sold_out: boolean;
};

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getMonthGrid(year: number, month: number) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    // Monday = 0, Sunday = 6
    let startDow = firstDay.getDay() - 1;
    if (startDow < 0) startDow = 6;

    const days: (Date | null)[] = [];
    for (let i = 0; i < startDow; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
    while (days.length % 7 !== 0) days.push(null);
    return days;
}

function toDateStr(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function isDateInRange(dateStr: string, start: string, end: string) {
    return dateStr >= start && dateStr <= end;
}

function getEventStyle(event: CalendarEvent, today: string) {
    if (event.is_sold_out) return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800';
    if (event.end_date < today) return 'bg-muted/50 text-muted-foreground/60 border-muted';
    if (event.status === 'draft') return 'bg-muted text-muted-foreground border-muted';
    return 'bg-primary/10 text-primary border-primary/20 dark:bg-primary/20';
}

export default function CalendarPage() {
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth());
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchEvents = useCallback(async (y: number, m: number) => {
        setLoading(true);
        try {
            const res = await fetch(`/backoffice/calendar/fetch?month=${m + 1}&year=${y}`);
            if (res.ok) {
                const data = await res.json();
                setEvents(data);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEvents(year, month);
    }, [year, month, fetchEvents]);

    const goToPrev = () => {
        if (month === 0) { setYear(year - 1); setMonth(11); }
        else setMonth(month - 1);
    };

    const goToNext = () => {
        if (month === 11) { setYear(year + 1); setMonth(0); }
        else setMonth(month + 1);
    };

    const goToToday = () => {
        setYear(now.getFullYear());
        setMonth(now.getMonth());
    };

    const days = getMonthGrid(year, month);
    const todayStr = toDateStr(now);
    const monthLabel = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    function getEventsForDate(dateStr: string) {
        return events.filter((e) => isDateInRange(dateStr, e.start_date, e.end_date));
    }

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold">Calendar</h1>
                <p className="text-sm text-muted-foreground">Visual overview of your event schedule</p>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">{monthLabel}</CardTitle>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={goToToday}>
                            Today
                        </Button>
                        <Button variant="outline" size="icon" className="size-8" onClick={goToPrev}>
                            <ChevronLeft className="size-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="size-8" onClick={goToNext}>
                            <ChevronRight className="size-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading && (
                        <div className="mb-2 text-center text-xs text-muted-foreground">Loading...</div>
                    )}
                    <div className="grid grid-cols-7">
                        {/* Day headers */}
                        {DAY_NAMES.map((name) => (
                            <div key={name} className="border-b px-1 py-2 text-center text-xs font-medium text-muted-foreground">
                                {name}
                            </div>
                        ))}

                        {/* Day cells */}
                        {days.map((day, idx) => {
                            if (!day) {
                                return <div key={`empty-${idx}`} className="min-h-24 border-b border-r bg-muted/20 p-1 last:border-r-0" />;
                            }

                            const dateStr = toDateStr(day);
                            const isToday = dateStr === todayStr;
                            const dayEvents = getEventsForDate(dateStr);

                            return (
                                <div
                                    key={dateStr}
                                    className={`min-h-24 border-b border-r p-1 last:border-r-0 ${isToday ? 'bg-primary/5' : ''}`}
                                >
                                    <div className={`mb-0.5 text-right text-xs ${isToday ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
                                        {day.getDate()}
                                    </div>
                                    <div className="space-y-0.5">
                                        {dayEvents.slice(0, 3).map((event) => (
                                            <div
                                                key={event.id}
                                                className={`cursor-pointer truncate rounded border px-1 py-0.5 text-xs leading-tight transition-opacity hover:opacity-80 ${getEventStyle(event, todayStr)}`}
                                                onClick={() => router.visit(show.url(event.id))}
                                                title={`${event.name}${event.fill_rate !== null ? ` (${event.fill_rate}%)` : ''}`}
                                            >
                                                {event.name}
                                            </div>
                                        ))}
                                        {dayEvents.length > 3 && (
                                            <div className="px-1 text-xs text-muted-foreground">
                                                +{dayEvents.length - 3} more
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div className="mt-4 flex flex-wrap gap-4">
                        <div className="flex items-center gap-1.5 text-xs">
                            <div className="size-3 rounded border border-primary/20 bg-primary/10" />
                            <span className="text-muted-foreground">Published</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                            <div className="size-3 rounded border border-muted bg-muted" />
                            <span className="text-muted-foreground">Draft</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                            <div className="size-3 rounded border border-green-200 bg-green-100 dark:border-green-800 dark:bg-green-950" />
                            <span className="text-muted-foreground">Sold Out</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                            <div className="size-3 rounded border border-muted bg-muted/50" />
                            <span className="text-muted-foreground">Ended</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

CalendarPage.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
