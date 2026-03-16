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
            'type' => ['required', 'string', 'in:file,link,note,video'],
            'content' => ['nullable', 'required_if:type,link', 'required_if:type,note', 'required_if:type,video', 'string'],
            'attachment' => ['nullable', 'file', 'max:10240'],
            'available_from' => ['nullable', 'date'],
            'available_until' => ['nullable', 'date', 'after:available_from'],
        ];
    }
}
