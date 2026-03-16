<?php

namespace Database\Seeders;

use App\Models\MailTemplate;
use Illuminate\Database\Seeder;

class MailTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $templates = [
            [
                'slug' => 'otp-verification',
                'name' => 'OTP Verification',
                'subject' => 'Your Verification Code',
                'body' => '<h2>Verification Code</h2><p>Hi {{customer_name}},</p><p>Your OTP code is: <strong>{{otp_code}}</strong></p><p>This code will expire in {{expiry_minutes}} minutes. Do not share this code with anyone.</p>',
                'variables' => ['customer_name', 'otp_code', 'expiry_minutes'],
                'is_active' => true,
            ],
            [
                'slug' => 'order-placed',
                'name' => 'Order Placed',
                'subject' => 'Order #{{order_number}} Confirmed',
                'body' => '<h2>Order Confirmation</h2><p>Hi {{customer_name}},</p><p>Thank you for your order! Here are the details:</p><p><strong>Order Number:</strong> {{order_number}}<br><strong>Event:</strong> {{event_name}}<br><strong>Total:</strong> {{total_amount}}</p><p>We will notify you once your payment is confirmed.</p>',
                'variables' => ['customer_name', 'order_number', 'event_name', 'total_amount'],
                'is_active' => true,
            ],
            [
                'slug' => 'payment-confirmed',
                'name' => 'Payment Confirmed',
                'subject' => 'Payment Confirmed for Order #{{order_number}}',
                'body' => '<h2>Payment Confirmed</h2><p>Hi {{customer_name}},</p><p>Your payment for order <strong>#{{order_number}}</strong> has been confirmed.</p><p><strong>Event:</strong> {{event_name}}<br><strong>Amount Paid:</strong> {{total_amount}}</p><p>We look forward to seeing you at the event!</p>',
                'variables' => ['customer_name', 'order_number', 'event_name', 'total_amount'],
                'is_active' => true,
            ],
            [
                'slug' => 'order-rejected',
                'name' => 'Order Rejected',
                'subject' => 'Order #{{order_number}} Update',
                'body' => '<h2>Order Update</h2><p>Hi {{customer_name}},</p><p>Unfortunately, your order <strong>#{{order_number}}</strong> could not be processed.</p><p><strong>Reason:</strong> {{rejection_reason}}</p><p>If you have any questions, please contact our support team.</p>',
                'variables' => ['customer_name', 'order_number', 'rejection_reason'],
                'is_active' => true,
            ],
            [
                'slug' => 'order-reminder',
                'name' => 'Event Reminder',
                'subject' => 'Reminder: {{event_name}} is Coming Up!',
                'body' => '<h2>Event Reminder</h2><p>Hi {{customer_name}},</p><p>This is a friendly reminder that <strong>{{event_name}}</strong> is happening on <strong>{{event_date}}</strong>.</p><p><strong>Venue:</strong> {{venue_name}}</p><p>We look forward to seeing you there!</p>',
                'variables' => ['customer_name', 'event_name', 'event_date', 'venue_name'],
                'is_active' => true,
            ],
        ];

        foreach ($templates as $template) {
            MailTemplate::updateOrCreate(
                ['slug' => $template['slug']],
                $template,
            );
        }
    }
}
