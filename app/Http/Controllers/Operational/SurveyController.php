<?php

namespace App\Http\Controllers\Operational;

use App\Contract\Operational\SurveyContract;
use App\Http\Controllers\Controller;
use App\Http\Requests\SurveyRequest;
use App\Models\Event;
use App\Models\Survey;
use App\Utils\WebResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SurveyController extends Controller
{
    protected SurveyContract $service;

    public function __construct(SurveyContract $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        return Inertia::render('operational/survey/index');
    }

    public function fetch()
    {
        $data = $this->service->all(
            allowedFilters: ['title'],
            allowedSorts: ['title', 'created_at'],
            withPaginate: true,
            relation: ['event', 'responses'],
            perPage: request()->get('per_page', 10),
            orderColumn: 'id',
            orderPosition: 'desc',
        );

        return response()->json($data);
    }

    public function create()
    {
        $usedEventIds = Survey::pluck('event_id');
        $events = Event::whereNotIn('id', $usedEventIds)
            ->where('status', 'published')
            ->orderByDesc('start_date')
            ->get(['id', 'name', 'start_date', 'end_date']);

        return Inertia::render('operational/survey/form', [
            'events' => $events,
        ]);
    }

    public function store(SurveyRequest $request)
    {
        $data = $this->service->create($request->validated());
        return WebResponse::response($data, 'backoffice.operational.survey.index');
    }

    public function show($id)
    {
        $survey = $this->service->find($id, ['event']);

        $usedEventIds = Survey::where('id', '!=', $id)->pluck('event_id');
        $events = Event::whereNotIn('id', $usedEventIds)
            ->where('status', 'published')
            ->orderByDesc('start_date')
            ->get(['id', 'name', 'start_date', 'end_date']);

        return Inertia::render('operational/survey/form', [
            'survey' => $survey,
            'events' => $events,
        ]);
    }

    public function update(SurveyRequest $request, $id)
    {
        $data = $this->service->update($id, $request->validated());
        return WebResponse::response($data, 'backoffice.operational.survey.index');
    }

    public function destroy($id)
    {
        $data = $this->service->destroy($id);
        return WebResponse::response($data, 'backoffice.operational.survey.index');
    }

    public function destroy_bulk(Request $request)
    {
        $data = $this->service->bulkDeleteByIds($request->ids ?? []);
        return WebResponse::response($data, 'backoffice.operational.survey.index');
    }

    public function results($id)
    {
        $results = $this->service->getResults($id);

        return Inertia::render('operational/survey/results', [
            'results' => $results,
        ]);
    }
}
