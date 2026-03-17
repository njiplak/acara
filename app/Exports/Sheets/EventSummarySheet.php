<?php

namespace App\Exports\Sheets;

use App\Models\Event;
use App\Models\Order;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class EventSummarySheet implements FromCollection, WithTitle, WithStyles
{
    public function __construct(
        protected Event $event,
    ) {}

    public function title(): string
    {
        return 'Summary';
    }

    public function collection(): Collection
    {
        $event = $this->event;
        $now = CarbonImmutable::now();

        $totalCapacity = $event->catalogs->sum(fn($c) => $c->pivot?->max_participant ?? 0);

        $baseQuery = Order::where('event_id', $event->id);
        $confirmedQuery = fn() => (clone $baseQuery)->where('status', 'confirmed');
        $activeQuery = fn() => (clone $baseQuery)->whereNotIn('status', ['cancelled', 'rejected', 'refunded']);

        $totalRegistrations = $activeQuery()->count();
        $confirmedCount = $confirmedQuery()->count();
        $checkedInCount = $confirmedQuery()->whereNotNull('checked_in_at')->count();
        $actualRevenue = (int) $confirmedQuery()->sum('total_amount');
        $potentialRevenue = (int) $activeQuery()->sum('total_amount');
        $referralDiscount = (int) $confirmedQuery()->sum('referral_discount');
        $voucherDiscount = (int) $confirmedQuery()->sum('voucher_discount');
        $balanceUsed = (int) $confirmedQuery()->sum('balance_used');
        $addonRevenue = (int) $confirmedQuery()->sum('addons_total');
        $isEventEnded = $event->end_date < $now->toDateString();

        $fillRate = $totalCapacity > 0 ? round(($totalRegistrations / $totalCapacity) * 100, 1) : null;
        $checkInRate = $confirmedCount > 0 ? round(($checkedInCount / $confirmedCount) * 100, 1) : 0;
        $noShowCount = $isEventEnded ? ($confirmedCount - $checkedInCount) : null;
        $totalDiscount = $voucherDiscount + $referralDiscount + $balanceUsed;

        $revenueByCatalog = Order::where('event_id', $event->id)
            ->where('status', 'confirmed')
            ->select('catalog_id', DB::raw('COUNT(*) as count'), DB::raw('SUM(total_amount) as revenue'))
            ->groupBy('catalog_id')
            ->with('catalog:id,name')
            ->get();

        $rows = collect([
            ['Event Report'],
            [],
            ['Event Details'],
            ['Name', $event->name],
            ['Start Date', $event->start_date],
            ['End Date', $event->end_date],
            ['Venue', $event->venue?->name ?? '-'],
            ['Status', ucfirst($event->status)],
            [],
            ['Attendance'],
            ['Total Capacity', $totalCapacity],
            ['Total Registrations', $totalRegistrations],
            ['Fill Rate', $fillRate !== null ? "{$fillRate}%" : 'N/A'],
            ['Confirmed', $confirmedCount],
            ['Checked In', $checkedInCount],
            ['Check-in Rate', "{$checkInRate}%"],
        ]);

        if ($noShowCount !== null) {
            $rows->push(['No-shows', $noShowCount]);
        }

        $rows->push([]);
        $rows->push(['Revenue']);
        $rows->push(['Actual Revenue', $actualRevenue]);
        $rows->push(['Potential Revenue', $potentialRevenue]);
        $rows->push(['Addon Revenue', $addonRevenue]);
        $rows->push([]);
        $rows->push(['Discounts']);
        $rows->push(['Voucher Discounts', $voucherDiscount]);
        $rows->push(['Referral Discounts', $referralDiscount]);
        $rows->push(['Balance Used', $balanceUsed]);
        $rows->push(['Total Discounts', $totalDiscount]);

        if ($revenueByCatalog->isNotEmpty()) {
            $rows->push([]);
            $rows->push(['Revenue by Session']);
            $rows->push(['Session', 'Orders', 'Revenue']);
            foreach ($revenueByCatalog as $item) {
                $rows->push([
                    $item->catalog?->name ?? "Catalog #{$item->catalog_id}",
                    $item->count,
                    $item->revenue,
                ]);
            }
        }

        return $rows;
    }

    public function styles(Worksheet $sheet): array
    {
        $sheet->getColumnDimension('A')->setWidth(25);
        $sheet->getColumnDimension('B')->setWidth(30);
        $sheet->getColumnDimension('C')->setWidth(20);

        return [
            1 => ['font' => ['bold' => true, 'size' => 14]],
            3 => ['font' => ['bold' => true, 'size' => 12]],
            10 => ['font' => ['bold' => true, 'size' => 12]],
        ];
    }
}
