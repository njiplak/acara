<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', Rule::unique('pages')->ignore($this->route('id'))],
            'content' => ['nullable', 'string'],
            'status' => ['required', 'string', Rule::in(['draft', 'published'])],
            'meta_description' => ['nullable', 'string', 'max:500'],
        ];
    }
}
