<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EventMaterialRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'event_id' => ['required', 'exists:events,id'],
            'catalog_id' => ['nullable', 'exists:catalogs,id'],
            'title' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'in:file,link,note'],
            'content' => ['nullable', 'required_if:type,link', 'required_if:type,note', 'string'],
            'attachment' => ['nullable', 'file', 'max:10240'],
        ];
    }
}
