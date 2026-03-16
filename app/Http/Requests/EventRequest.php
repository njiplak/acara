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
        ];
    }
}
