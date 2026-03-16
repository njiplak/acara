<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>{{ config('app.name') }}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #f4f4f7;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #333333;
            line-height: 1.6;
        }

        .email-wrapper {
            width: 100%;
            background-color: #f4f4f7;
            padding: 32px 0;
        }

        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        }

        .email-header {
            background-color: #18181b;
            padding: 24px 32px;
            text-align: center;
        }

        .email-header h1 {
            margin: 0;
            color: #ffffff;
            font-size: 20px;
            font-weight: 600;
            letter-spacing: -0.025em;
        }

        .email-body {
            padding: 32px;
        }

        .email-body h1, .email-body h2, .email-body h3 {
            color: #18181b;
            margin-top: 0;
        }

        .email-body p {
            margin: 0 0 16px;
            color: #3f3f46;
        }

        .email-body a {
            color: #2563eb;
        }

        .email-footer {
            padding: 24px 32px;
            text-align: center;
            border-top: 1px solid #e4e4e7;
        }

        .email-footer p {
            margin: 0;
            color: #a1a1aa;
            font-size: 13px;
        }

        @media only screen and (max-width: 640px) {
            .email-body, .email-header, .email-footer {
                padding-left: 20px !important;
                padding-right: 20px !important;
            }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="email-container">
            <div class="email-header">
                <h1>{{ config('app.name') }}</h1>
            </div>
            <div class="email-body">
                {!! $body !!}
            </div>
            <div class="email-footer">
                <p>&copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>
