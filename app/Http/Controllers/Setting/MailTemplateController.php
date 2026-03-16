<?php

namespace App\Http\Controllers\Setting;

use App\Contract\Setting\MailTemplateContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\MailTemplateRequest;
use App\Utils\WebResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MailTemplateController extends Controller
{
    protected MailTemplateContract $service;

    public function __construct(MailTemplateContract $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        return Inertia::render('setting/mail-template/index');
    }

    public function fetch()
    {
        $data = $this->service->all(
            allowedFilters: ['name', 'slug'],
            allowedSorts: ['name', 'slug', 'created_at'],
            withPaginate: true,
            perPage: request()->get('per_page', 10),
        );
        return response()->json($data);
    }

    public function create()
    {
        return Inertia::render('setting/mail-template/form');
    }

    public function store(MailTemplateRequest $request)
    {
        $data = $this->service->create($request->validated());
        return WebResponse::response($data, 'backoffice.setting.mail-template.index');
    }

    public function show($id)
    {
        $data = $this->service->find($id);
        return Inertia::render('setting/mail-template/form', [
            'mail_template' => $data,
        ]);
    }

    public function update(MailTemplateRequest $request, $id)
    {
        $data = $this->service->update($id, $request->validated());
        return WebResponse::response($data, 'backoffice.setting.mail-template.index');
    }

    public function destroy($id)
    {
        $data = $this->service->destroy($id);
        return WebResponse::response($data, 'backoffice.setting.mail-template.index');
    }

    public function destroy_bulk(Request $request)
    {
        $data = $this->service->bulkDeleteByIds($request->ids ?? []);
        return WebResponse::response($data, 'backoffice.setting.mail-template.index');
    }
}
