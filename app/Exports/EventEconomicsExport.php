<?php

namespace App\Exports;

use App\Exports\Sheets\EventOrdersSheet;
use App\Exports\Sheets\EventSummarySheet;
use App\Models\Event;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class EventEconomicsExport implements WithMultipleSheets
{
    public function __construct(
        protected Event $event,
    ) {}

    public function sheets(): array
    {
        return [
            new EventSummarySheet($this->event),
            new EventOrdersSheet($this->event->id),
        ];
    }
}
