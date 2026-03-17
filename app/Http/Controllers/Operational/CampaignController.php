<?php

namespace App\Http\Controllers\Operational;

use App\Contract\Operational\CampaignContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCampaignRequest;
use App\Models\Campaign;
use App\Models\Customer;
use App\Models\MailTemplate;
use App\Utils\WebResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CampaignController extends Controller
{
    protected CampaignContract $service;

    public function __construct(CampaignContract $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        return Inertia::render('operational/campaign/index');
    }

    public function fetch()
    {
        $data = $this->service->all(
            allowedFilters: ['name'],
            allowedSorts: ['name', 'sent_at', 'created_at'],
            withPaginate: true,
            relation: ['mailTemplate'],
            perPage: request()->get('per_page', 10),
            orderColumn: 'id',
            orderPosition: 'desc',
        );

        return response()->json($data);
    }

    public function create()
    {
        $mailTemplates = MailTemplate::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'subject']);

        return Inertia::render('operational/campaign/form', [
            'mailTemplates' => $mailTemplates,
        ]);
    }

    public function store(StoreCampaignRequest $request)
    {
        $data = $this->service->create($request->validated());
        return WebResponse::response($data, 'backoffice.operational.campaign.index');
    }

    public function show($id)
    {
        $campaign = $this->service->find($id, ['mailTemplate']);

        $mailTemplates = MailTemplate::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'subject']);

        return Inertia::render('operational/campaign/form', [
            'campaign' => $campaign,
            'mailTemplates' => $mailTemplates,
        ]);
    }

    public function previewCount(Request $request)
    {
        $tags = $request->input('tags', []);

        if (empty($tags)) {
            return response()->json(['count' => 0]);
        }

        $count = $this->service->previewCount($tags);

        return response()->json(['count' => $count]);
    }

    public function send($id)
    {
        $result = $this->service->sendCampaign($id);
        return WebResponse::response($result, 'backoffice.operational.campaign.index');
    }

    public function destroy($id)
    {
        $campaign = Campaign::findOrFail($id);
        abort_if($campaign->isSent(), 422, 'Cannot delete a sent campaign.');

        $data = $this->service->destroy($id);
        return WebResponse::response($data, 'backoffice.operational.campaign.index');
    }

    public function destroy_bulk(Request $request)
    {
        $ids = $request->ids ?? [];
        $sentCount = Campaign::whereIn('id', $ids)->whereNotNull('sent_at')->count();
        abort_if($sentCount > 0, 422, 'Cannot delete sent campaigns.');

        $data = $this->service->bulkDeleteByIds($ids);
        return WebResponse::response($data, 'backoffice.operational.campaign.index');
    }
}
