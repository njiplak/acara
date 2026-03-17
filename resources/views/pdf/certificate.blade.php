<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Certificate {{ $certificateId }}</title>
    <style>
        @page { margin: 0; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Helvetica', 'Arial', sans-serif; color: #1a1a1a; }
        .certificate {
            width: 100%;
            height: 100%;
            padding: 60px 80px;
            position: relative;
            overflow: hidden;
        }
        .border-frame {
            position: absolute;
            top: 20px;
            left: 20px;
            right: 20px;
            bottom: 20px;
            border: 3px solid #1a1a1a;
        }
        .border-frame-inner {
            position: absolute;
            top: 28px;
            left: 28px;
            right: 28px;
            bottom: 28px;
            border: 1px solid #999;
        }
        .content {
            position: relative;
            z-index: 1;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
        }
        .label {
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 4px;
            color: #999;
            margin-bottom: 12px;
        }
        .title {
            font-size: 36px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 6px;
            color: #1a1a1a;
            margin-bottom: 32px;
        }
        .subtitle {
            font-size: 14px;
            color: #666;
            margin-bottom: 8px;
        }
        .attendee-name {
            font-size: 32px;
            font-weight: 700;
            color: #1a1a1a;
            border-bottom: 2px solid #1a1a1a;
            padding-bottom: 8px;
            margin-bottom: 32px;
            display: inline-block;
        }
        .description {
            font-size: 14px;
            color: #666;
            line-height: 1.6;
            max-width: 500px;
            margin-bottom: 40px;
        }
        .event-name {
            font-weight: 700;
            color: #1a1a1a;
        }
        .details {
            margin-bottom: 24px;
        }
        .details-item {
            font-size: 12px;
            color: #666;
            margin-bottom: 4px;
        }
        .footer {
            position: absolute;
            bottom: 48px;
            left: 80px;
            right: 80px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
        }
        .footer-left {
            text-align: left;
        }
        .footer-right {
            text-align: right;
        }
        .footer-label {
            font-size: 10px;
            color: #999;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .footer-value {
            font-size: 11px;
            color: #666;
            margin-top: 2px;
        }
    </style>
</head>
<body>
    <div class="certificate">
        <div class="border-frame"></div>
        <div class="border-frame-inner"></div>

        <div class="content">
            <div class="label">This is to certify that</div>
            <h1 class="title">Certificate of Attendance</h1>

            <p class="subtitle">is proudly presented to</p>
            <div class="attendee-name">{{ $order->customer->name }}</div>

            <p class="description">
                For attending <span class="event-name">{{ $order->event->name }}</span>
                @if($order->catalog)
                    — {{ $order->catalog->name }}
                @endif
            </p>

            <div class="details">
                <p class="details-item">
                    {{ \Carbon\Carbon::parse($order->event->start_date)->format('d M Y') }}
                    @if($order->event->start_date !== $order->event->end_date)
                        — {{ \Carbon\Carbon::parse($order->event->end_date)->format('d M Y') }}
                    @endif
                </p>
            </div>
        </div>

        <table style="width: 100%; position: absolute; bottom: 48px; left: 80px; right: 80px; width: calc(100% - 160px);">
            <tr>
                <td style="text-align: left; vertical-align: bottom;">
                    <div class="footer-label">Certificate ID</div>
                    <div class="footer-value">{{ $certificateId }}</div>
                </td>
                <td style="text-align: right; vertical-align: bottom;">
                    <div class="footer-label">Issued By</div>
                    <div class="footer-value">{{ $settings->business_name ?? 'Acara' }}</div>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
