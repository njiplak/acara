<?php

namespace App\Exports;

use App\Models\Order;
use Illuminate\Contracts\Database\Eloquent\Builder;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class OrderExport implements FromQuery, WithHeadings, WithMapping, WithStyles
{
    public function __construct(
        protected ?int $eventId = null,
    ) {}

    public function query(): Builder
    {
        $query = Order::with(['customer', 'event', 'catalog'])
            ->orderByDesc('created_at');

        if ($this->eventId) {
            $query->where('event_id', $this->eventId);
        }

        return $query;
    }

    public function headings(): array
    {
        return [
            'Order Code',
            'Customer Name',
            'Customer Email',
            'Event',
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
            'Checked In At',
        ];
    }

    public function map($order): array
    {
        return [
            $order->order_code,
            $order->customer?->name ?? '-',
            $order->customer?->email ?? '-',
            $order->event?->name ?? '-',
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
            $order->checked_in_at?->format('Y-m-d H:i') ?? '-',
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        $sheet->getColumnDimension('A')->setWidth(20);
        $sheet->getColumnDimension('B')->setWidth(25);
        $sheet->getColumnDimension('C')->setWidth(30);
        $sheet->getColumnDimension('D')->setWidth(25);
        $sheet->getColumnDimension('E')->setWidth(20);
        $sheet->getColumnDimension('L')->setWidth(20);
        $sheet->getColumnDimension('M')->setWidth(18);
        $sheet->getColumnDimension('N')->setWidth(18);
        $sheet->getColumnDimension('O')->setWidth(18);

        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
