<?php

namespace App\Service;

use App\Models\LandingPageSetting;
use App\Models\OperationalSetting;
use App\Models\Order;
use PhpOffice\PhpWord\TemplateProcessor;
use Barryvdh\DomPDF\Facade\Pdf;

class CertificateService
{
    /**
     * Generate a certificate PDF for an order.
     *
     * Uses a .docx template if uploaded, otherwise falls back to a blade template.
     * Supported placeholders in .docx:
     * ${attendee_name}, ${event_name}, ${catalog_name}, ${event_date},
     * ${certificate_id}, ${business_name}, ${checked_in_date}
     */
    public static function generate(Order $order): ?string
    {
        $order->loadMissing(['event', 'catalog', 'customer']);
        $settings = LandingPageSetting::instance();
        $operationalSetting = OperationalSetting::instance();

        $certificateId = 'CERT-' . $order->id . '-' . strtoupper(substr(md5($order->id . $order->order_code), 0, 6));

        $templateMedia = $operationalSetting->getFirstMedia('certificate_template');

        if ($templateMedia) {
            return static::generateFromDocx($order, $settings, $certificateId, $templateMedia->getPath());
        }

        return static::generateFromBlade($order, $settings, $certificateId);
    }

    /**
     * Generate certificate from .docx template → PDF.
     */
    protected static function generateFromDocx(Order $order, LandingPageSetting $settings, string $certificateId, string $templatePath): string
    {
        $processor = new TemplateProcessor($templatePath);

        $eventDate = \Carbon\Carbon::parse($order->event->start_date)->format('d M Y');
        if ($order->event->start_date !== $order->event->end_date) {
            $eventDate .= ' - ' . \Carbon\Carbon::parse($order->event->end_date)->format('d M Y');
        }

        $processor->setValue('attendee_name', $order->customer->name);
        $processor->setValue('event_name', $order->event->name);
        $processor->setValue('catalog_name', $order->catalog?->name ?? '-');
        $processor->setValue('event_date', $eventDate);
        $processor->setValue('certificate_id', $certificateId);
        $processor->setValue('business_name', $settings->business_name ?? 'Acara');
        $processor->setValue('checked_in_date', $order->checked_in_at?->format('d M Y') ?? '-');

        // Save processed docx to temp file
        $tempDocx = tempnam(sys_get_temp_dir(), 'cert_') . '.docx';
        $processor->saveAs($tempDocx);

        // Convert docx to PDF via PhpWord + DomPDF
        $phpWord = \PhpOffice\PhpWord\IOFactory::load($tempDocx);
        $htmlWriter = \PhpOffice\PhpWord\IOFactory::createWriter($phpWord, 'HTML');

        $tempHtml = tempnam(sys_get_temp_dir(), 'cert_') . '.html';
        $htmlWriter->save($tempHtml);

        $html = file_get_contents($tempHtml);

        // Clean up temp files
        @unlink($tempDocx);
        @unlink($tempHtml);

        $tempPdf = tempnam(sys_get_temp_dir(), 'cert_') . '.pdf';
        Pdf::loadHTML($html)
            ->setPaper('a4', 'landscape')
            ->save($tempPdf);

        return $tempPdf;
    }

    /**
     * Fallback: generate from Blade template.
     */
    protected static function generateFromBlade(Order $order, LandingPageSetting $settings, string $certificateId): string
    {
        $tempPdf = tempnam(sys_get_temp_dir(), 'cert_') . '.pdf';

        Pdf::loadView('pdf.certificate', [
            'order' => $order,
            'settings' => $settings,
            'certificateId' => $certificateId,
        ])->setPaper('a4', 'landscape')
          ->save($tempPdf);

        return $tempPdf;
    }
}
