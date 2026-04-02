<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AddonRequest extends FormRequest
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
            'status' => ['required', 'string', 'in:draft,published'],
            'is_standalone' => ['nullable', 'boolean'],
            'payment_gateway' => ['required', 'string', 'in:manual,xendit,stripe,midtrans'],
            'currency' => ['required', 'string', 'size:3', 'in:IDR,USD,SGD,EUR'],
        ];
    }
}
