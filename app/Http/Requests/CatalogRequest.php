<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CatalogRequest extends FormRequest
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
            'strike_price' => ['nullable', 'numeric', 'min:0'],
            'price' => ['required', 'numeric', 'min:0'],
            'addon_ids' => ['nullable', 'array'],
            'addon_ids.*' => ['exists:addons,id'],
            'speaker_ids' => ['nullable', 'array'],
            'speaker_ids.*' => ['exists:speakers,id'],
        ];
    }
}
