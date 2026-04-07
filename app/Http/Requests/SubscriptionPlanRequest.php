<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SubscriptionPlanRequest extends FormRequest
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
            'price' => ['required', 'integer', 'min:0'],
            'periodicity' => ['required', 'integer', 'min:1'],
            'periodicity_type' => ['required', 'string', 'in:Month,Year,Week,Day'],
            'grace_days' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'features' => ['required', 'array', 'min:1'],
            'features.*.id' => ['required_with:features', 'integer', 'exists:features,id'],
            'features.*.charges' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
