<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class OperationalSettingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'certificate_template' => ['nullable', 'file', 'mimes:docx', 'max:5120'],
            'payment_instruction' => ['nullable', 'string'],
        ];
    }
}
