<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SurveyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $surveyId = $this->route('id');

        return [
            'event_id' => ['required', 'integer', 'exists:events,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'slug' => ['required', 'string', 'max:255', 'unique:surveys,slug,' . $surveyId],
            'questions' => ['required', 'array', 'min:1'],
            'questions.*.type' => ['required', 'string', 'in:nps,rating,multiple_choice,text'],
            'questions.*.label' => ['required', 'string', 'max:500'],
            'questions.*.options' => ['nullable', 'array'],
            'questions.*.required' => ['boolean'],
            'is_active' => ['boolean'],
        ];
    }
}
