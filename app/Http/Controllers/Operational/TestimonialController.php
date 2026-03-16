<?php

namespace App\Http\Controllers\Operational;

use App\Contract\Operational\TestimonialContract;
use App\Http\Controllers\Controller;
use App\Utils\WebResponse;
use Inertia\Inertia;

class TestimonialController extends Controller
{
    protected TestimonialContract $service;

    public function __construct(TestimonialContract $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        return Inertia::render('operational/testimonial/index');
    }

    public function fetch()
    {
        $data = $this->service->all(
            allowedFilters: [],
            allowedSorts: [],
            withPaginate: true,
            relation: ['customer', 'event', 'catalog'],
            perPage: request()->get('per_page', 10),
            orderColumn: 'id',
            orderPosition: 'desc',
        );

        return response()->json($data);
    }

    public function toggleHighlight($id)
    {
        $result = $this->service->toggleHighlight($id);

        return WebResponse::response($result);
    }
}
