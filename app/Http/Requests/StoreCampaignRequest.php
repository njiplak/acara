<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCampaignRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'target_tags' => ['required', 'array', 'min:1'],
            'target_tags.*' => ['required', 'string', 'in:new,returning,loyal,active,lapsed,inactive,no-show,big-spender,referrer'],
            'mail_template_id' => ['required', 'integer', 'exists:mail_templates,id'],
        ];
    }
}
