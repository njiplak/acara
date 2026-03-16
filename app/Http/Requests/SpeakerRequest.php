<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SpeakerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'title' => ['nullable', 'string', 'max:255'],
            'bio' => ['nullable', 'string'],
            'catalog_ids' => ['nullable', 'array'],
            'catalog_ids.*' => ['exists:catalogs,id'],
            'photo' => ['nullable', 'image', 'max:2048'],
        ];
    }
}
