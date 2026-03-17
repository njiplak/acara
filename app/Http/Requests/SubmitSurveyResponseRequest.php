<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SubmitSurveyResponseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'survey_id' => ['required', 'integer', 'exists:surveys,id'],
            'order_id' => ['required', 'integer', 'exists:orders,id'],
            'answers' => ['required', 'array'],
        ];
    }
}
