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
            [
                'slug' => 'post-event-thank-you',
                'name' => 'Post-Event Thank You',
                'subject' => 'Thank You for Attending {{event_name}}!',
                'body' => '<h2>Thank You!</h2><p>Hi {{customer_name}},</p><p>Thank you for attending <strong>{{event_name}}</strong>. We hope you had a great experience!</p><p>We\'d love to hear your feedback — your thoughts help us make future events even better.</p><p>See you at the next event!</p>',
                'variables' => ['customer_name', 'event_name'],
                'is_active' => true,
            ],
            [
                'slug' => 'post-event-survey',
                'name' => 'Post-Event Survey',
                'subject' => 'Share Your Feedback for {{event_name}}',
                'body' => '<h2>We Value Your Feedback!</h2><p>Hi {{customer_name}},</p><p>Thank you for attending <strong>{{event_name}}</strong>. We\'d love to hear about your experience!</p><p>Please take a moment to fill out our survey:</p><p><a href="{{survey_url}}">Take the Survey</a></p><p>Your feedback helps us improve future events.</p>',
                'variables' => ['customer_name', 'event_name', 'survey_url'],
                'is_active' => true,
            ],
            [
                'slug' => 'event-announcement',
                'name' => 'Event Announcement',
                'subject' => '{{subject}}',
                'body' => '<h2>{{subject}}</h2><p>Hi {{customer_name}},</p><p>{{message}}</p><p>Regarding event: <strong>{{event_name}}</strong></p>',
                'variables' => ['customer_name', 'event_name', 'subject', 'message'],
                'is_active' => true,
            ],
            [
                'slug' => 'waitlist-spot-available',
                'name' => 'Waitlist Spot Available',
                'subject' => 'A spot just opened up for {{event_name}}!',
                'body' => '<h2>Good News!</h2><p>Hi {{customer_name}},</p><p>A spot has opened up for <strong>{{event_name}}</strong> — {{catalog_name}}.</p><p>Register now before it fills up again:</p><p><a href="{{event_url}}">Register Now</a></p><p>First come, first served!</p>',
                'variables' => ['customer_name', 'event_name', 'catalog_name', 'event_url'],
                'is_active' => true,
            ],
            [
                'slug' => 'birthday-voucher',
                'name' => 'Birthday Voucher',
                'subject' => 'Happy Birthday, {{customer_name}}!',
                'body' => '<h2>Happy Birthday!</h2><p>Hi {{customer_name}},</p><p>Wishing you a wonderful birthday! As a special gift, here is a discount code just for you:</p><p style="text-align:center;font-size:24px;font-weight:bold;letter-spacing:2px;padding:16px;background:#f5f5f5;border-radius:8px;">{{voucher_code}}</p><p><strong>Discount:</strong> {{voucher_value}}<br><strong>Valid until:</strong> {{valid_until}}</p><p>Use this code on your next order. Enjoy your special day!</p>',
                'variables' => ['customer_name', 'voucher_code', 'voucher_value', 'valid_until'],
                'is_active' => true,
            ],
            [
                'slug' => 'certificate-distribution',
                'name' => 'Certificate Distribution',
                'subject' => 'Your Certificate for {{event_name}}',
                'body' => '<h2>Your Certificate is Ready!</h2><p>Hi {{customer_name}},</p><p>Thank you for attending <strong>{{event_name}}</strong>. Your certificate of attendance is now available for download.</p><p><a href="{{certificate_url}}">Download Your Certificate</a></p><p>We hope to see you at future events!</p>',
                'variables' => ['customer_name', 'event_name', 'certificate_url'],
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
