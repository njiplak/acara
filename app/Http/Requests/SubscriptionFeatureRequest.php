<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SubscriptionFeatureRequest extends FormRequest
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
            'consumable' => ['boolean'],
            'quota' => ['boolean'],
            'periodicity' => ['nullable', 'integer', 'min:1'],
            'periodicity_type' => ['nullable', 'string', 'in:Month,Year,Week,Day'],
        ];
    }
}
