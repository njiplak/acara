<?php

namespace App\Http\Controllers\Operational;

use App\Contract\Operational\CustomerContract;
use App\Filters\CustomerTagFilter;
use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Voucher;
use App\Mail\BirthdayVoucherMail;
use App\Utils\WebResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Spatie\QueryBuilder\AllowedFilter;

class CustomerController extends Controller
{
    protected CustomerContract $service;

    public function __construct(CustomerContract $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        return Inertia::render(component: 'operational/customer/index');
    }

    public function fetch()
    {
        $data = $this->service->allWithTags(
            allowedFilters: [
                AllowedFilter::custom('tags', new CustomerTagFilter()),
            ],
            allowedSorts: ['name', 'email', 'created_at'],
            withPaginate: true,
            perPage: request()->get('per_page', 10),
        );
        return response()->json($data);
    }

    public function show($id)
    {
        $data = $this->service->findWithTags($id);
        return Inertia::render('operational/customer/show', [
            'customer' => $data,
        ]);
    }

    public function destroy($id)
    {
        $data = $this->service->destroy($id);
        return WebResponse::response($data, 'backoffice.operational.customer.index');
    }

    public function destroy_bulk(Request $request)
    {
        $data = $this->service->bulkDeleteByIds($request->ids ?? []);
        return WebResponse::response($data, 'backoffice.operational.customer.index');
    }

    public function generateBirthdayVoucher(Request $request, $id)
    {
        $request->validate([
            'value' => ['required', 'integer', 'min:1'],
        ]);

        $customer = Customer::findOrFail($id);
        abort_if(!$customer->date_of_birth, 422, 'Customer has no date of birth set.');

        $year = now()->year;
        $exists = Voucher::where('customer_id', $customer->id)
            ->where('code', 'LIKE', "BDAY{$year}%")
            ->exists();
        abort_if($exists, 422, 'Birthday voucher already generated for this customer this year.');

        do {
            $code = 'BDAY' . $year . strtoupper(Str::random(4));
        } while (Voucher::where('code', $code)->exists());

        $voucher = Voucher::create([
            'code' => $code,
            'name' => "Birthday {$year} - {$customer->name}",
            'type' => 'fixed',
            'value' => $request->value,
            'max_uses' => 1,
            'max_uses_per_customer' => 1,
            'customer_id' => $customer->id,
            'valid_from' => now(),
            'valid_until' => now()->addDays(config('service-contract.birthday.voucher_validity_days', 7)),
            'is_active' => true,
            'stackable_with_referral' => true,
        ]);

        Mail::to($customer->email)->queue(new BirthdayVoucherMail(
            customerName: $customer->name,
            voucherCode: $voucher->code,
            voucherValue: 'Rp ' . number_format($voucher->value, 0, ',', '.'),
            validUntil: $voucher->valid_until->format('d M Y'),
        ));

        return WebResponse::response($voucher);
    }
}
