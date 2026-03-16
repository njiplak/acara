<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice {{ $order->order_code }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 13px; color: #1a1a1a; line-height: 1.5; }
        .container { padding: 40px; }
        .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
        .brand { font-size: 20px; font-weight: 700; }
        .brand-info { font-size: 11px; color: #666; margin-top: 4px; }
        .invoice-title { text-align: right; }
        .invoice-title h1 { font-size: 28px; font-weight: 700; color: #1a1a1a; text-transform: uppercase; letter-spacing: 2px; }
        .invoice-title .meta { font-size: 11px; color: #666; margin-top: 4px; }
        .section { margin-bottom: 24px; }
        .section-title { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #999; margin-bottom: 8px; }
        .info-grid { width: 100%; }
        .info-grid td { vertical-align: top; padding: 2px 0; }
        .info-grid .label { color: #666; width: 140px; }
        .info-grid .value { font-weight: 500; }
        table.items { width: 100%; border-collapse: collapse; margin-top: 8px; }
        table.items th { text-align: left; padding: 10px 12px; background: #f5f5f5; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #666; border-bottom: 1px solid #e0e0e0; }
        table.items th:last-child { text-align: right; }
        table.items td { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; }
        table.items td:last-child { text-align: right; }
        .discount td { color: #16a34a; }
        .total-row td { border-top: 2px solid #1a1a1a; font-weight: 700; font-size: 15px; padding-top: 12px; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 11px; color: #999; }
    </style>
</head>
<body>
    <div class="container">
        {{-- Header --}}
        <table style="width:100%; margin-bottom: 40px;">
            <tr>
                <td style="vertical-align: top;">
                    <div class="brand">{{ $settings->business_name ?? 'Acara' }}</div>
                    @if($settings->business_address)
                        <div class="brand-info">{{ $settings->business_address }}</div>
                    @endif
                    @if($settings->business_phone)
                        <div class="brand-info">{{ $settings->business_phone }}</div>
                    @endif
                    @if($settings->business_email)
                        <div class="brand-info">{{ $settings->business_email }}</div>
                    @endif
                </td>
                <td style="text-align: right; vertical-align: top;">
                    <div class="invoice-title">
                        <h1>Invoice</h1>
                        <div class="meta">{{ $order->order_code }}</div>
                        <div class="meta">{{ $order->confirmed_at?->format('d M Y') ?? $order->created_at->format('d M Y') }}</div>
                    </div>
                </td>
            </tr>
        </table>

        {{-- Customer --}}
        <div class="section">
            <div class="section-title">Bill To</div>
            <table class="info-grid">
                <tr>
                    <td class="label">Name</td>
                    <td class="value">{{ $order->customer->name }}</td>
                </tr>
                <tr>
                    <td class="label">Email</td>
                    <td class="value">{{ $order->customer->email }}</td>
                </tr>
            </table>
        </div>

        {{-- Event --}}
        <div class="section">
            <div class="section-title">Event Details</div>
            <table class="info-grid">
                <tr>
                    <td class="label">Event</td>
                    <td class="value">{{ $order->event->name }}</td>
                </tr>
                <tr>
                    <td class="label">Date</td>
                    <td class="value">{{ \Carbon\Carbon::parse($order->event->start_date)->format('d M Y') }} - {{ \Carbon\Carbon::parse($order->event->end_date)->format('d M Y') }}</td>
                </tr>
                @if($order->event->venue)
                <tr>
                    <td class="label">Venue</td>
                    <td class="value">{{ $order->event->venue->name }}, {{ $order->event->venue->city }}</td>
                </tr>
                @endif
                <tr>
                    <td class="label">Session</td>
                    <td class="value">{{ $order->catalog->name }}</td>
                </tr>
            </table>
        </div>

        {{-- Line Items --}}
        <div class="section">
            <div class="section-title">Items</div>
            <table class="items">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{{ $order->catalog->name }}</td>
                        <td>Rp {{ number_format($order->catalog_price, 0, ',', '.') }}</td>
                    </tr>
                    @foreach($order->addons as $addon)
                    <tr>
                        <td>{{ $addon->pivot->addon_name }}</td>
                        <td>Rp {{ number_format($addon->pivot->addon_price, 0, ',', '.') }}</td>
                    </tr>
                    @endforeach
                    @if($order->referral_discount > 0)
                    <tr class="discount">
                        <td>Referral Discount</td>
                        <td>-Rp {{ number_format($order->referral_discount, 0, ',', '.') }}</td>
                    </tr>
                    @endif
                    @if($order->balance_used > 0)
                    <tr class="discount">
                        <td>Balance Used</td>
                        <td>-Rp {{ number_format($order->balance_used, 0, ',', '.') }}</td>
                    </tr>
                    @endif
                    <tr class="total-row">
                        <td>Total</td>
                        <td>Rp {{ number_format($order->total_amount, 0, ',', '.') }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        {{-- Footer --}}
        <div class="footer">
            <p>Thank you for your registration.</p>
            <p style="margin-top: 4px;">{{ $settings->business_name ?? 'Acara' }}</p>
        </div>
    </div>
</body>
</html>
