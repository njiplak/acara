<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'status' => ['required', 'string', 'in:draft,published'],
            'payment_method' => ['required', 'string', 'in:manual,qris'],
            'venue_id' => ['nullable', 'exists:venues,id'],
            'material_require_checkin' => ['nullable', 'boolean'],
            'schedule' => ['nullable', 'array'],
            'schedule.*.time' => ['required', 'string', 'max:10'],
            'schedule.*.end_time' => ['nullable', 'string', 'max:10'],
            'schedule.*.title' => ['required', 'string', 'max:255'],
            'schedule.*.description' => ['nullable', 'string'],
            'catalogs' => ['nullable', 'array'],
            'catalogs.*.catalog_id' => ['required', 'exists:catalogs,id'],
            'catalogs.*.max_participant' => ['nullable', 'integer', 'min:1'],
            'catalogs.*.pricing_type' => ['required', 'string', 'in:fixed,date,quantity'],
            'catalogs.*.pricing_tiers' => ['nullable', 'array'],
            'catalogs.*.pricing_tiers.*.label' => ['required', 'string', 'max:100'],
            'catalogs.*.pricing_tiers.*.price' => ['required', 'numeric', 'min:0'],
            'catalogs.*.pricing_tiers.*.end_date' => ['nullable', 'date'],
            'catalogs.*.pricing_tiers.*.max_seats' => ['nullable', 'integer', 'min:1'],
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $catalogs = $this->input('catalogs', []);
            foreach ($catalogs as $idx => $catalog) {
                $type = $catalog['pricing_type'] ?? 'fixed';
                $tiers = $catalog['pricing_tiers'] ?? [];

                if ($type === 'fixed') continue;

                if (count($tiers) < 2) {
                    $validator->errors()->add(
                        "catalogs.{$idx}.pricing_tiers",
                        'Tiered pricing requires at least 2 tiers.'
                    );
                    continue;
                }

                $lastTier = end($tiers);
                if ($type === 'date' && !empty($lastTier['end_date'])) {
                    $validator->errors()->add(
                        "catalogs.{$idx}.pricing_tiers",
                        'The last date tier must have no end date (catch-all).'
                    );
                }
                if ($type === 'quantity' && !empty($lastTier['max_seats'])) {
                    $validator->errors()->add(
                        "catalogs.{$idx}.pricing_tiers",
                        'The last quantity tier must have no max seats (catch-all).'
                    );
                }
            }
        });
    }
}
