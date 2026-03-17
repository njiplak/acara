<?php

namespace App\Exports\Sheets;

use App\Models\Order;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class EventOrdersSheet implements FromCollection, WithTitle, WithHeadings, WithMapping, WithStyles
{
    public function __construct(
        protected int $eventId,
    ) {}

    public function title(): string
    {
        return 'Orders';
    }

    public function collection(): Collection
    {
        return Order::where('event_id', $this->eventId)
            ->whereNotIn('status', ['cancelled'])
            ->with(['customer', 'catalog'])
            ->orderByDesc('created_at')
            ->get();
    }

    public function headings(): array
    {
        return [
            'Order Code',
            'Customer Name',
            'Customer Email',
            'Session',
            'Catalog Price',
            'Addons Total',
            'Voucher Discount',
            'Referral Discount',
            'Balance Used',
            'Total Amount',
            'Status',
            'Created At',
            'Confirmed At',
            'Checked In',
        ];
    }

    public function map($order): array
    {
        return [
            $order->order_code,
            $order->customer?->name ?? '-',
            $order->customer?->email ?? '-',
            $order->catalog?->name ?? '-',
            $order->catalog_price,
            $order->addons_total,
            $order->voucher_discount,
            $order->referral_discount,
            $order->balance_used,
            $order->total_amount,
            ucfirst(str_replace('_', ' ', $order->status)),
            $order->created_at?->format('Y-m-d H:i'),
            $order->confirmed_at?->format('Y-m-d H:i') ?? '-',
            $order->checked_in_at ? 'Yes' : 'No',
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        $sheet->getColumnDimension('A')->setWidth(20);
        $sheet->getColumnDimension('B')->setWidth(25);
        $sheet->getColumnDimension('C')->setWidth(30);
        $sheet->getColumnDimension('D')->setWidth(20);
        $sheet->getColumnDimension('K')->setWidth(20);
        $sheet->getColumnDimension('L')->setWidth(18);
        $sheet->getColumnDimension('M')->setWidth(18);

        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
