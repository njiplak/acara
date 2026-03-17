<?php

namespace App\Service\Operational;

use App\Contract\Operational\SurveyContract;
use App\Models\Order;
use App\Models\Survey;
use App\Models\SurveyResponse;
use App\Service\BaseService;
use Exception;
use Illuminate\Support\Facades\DB;

class SurveyService extends BaseService implements SurveyContract
{
    protected array $relation = ['event'];

    public function __construct(Survey $model)
    {
        parent::__construct($model);
    }

    public function submitResponse(array $payloads): mixed
    {
        try {
            DB::beginTransaction();

            $survey = Survey::findOrFail($payloads['survey_id']);
            $order = Order::findOrFail($payloads['order_id']);

            abort_if($order->customer_id !== $payloads['customer_id'], 403, 'Unauthorized.');
            abort_if($order->event_id !== $survey->event_id, 422, 'This survey is not for this order\'s event.');
            abort_if($order->status !== 'confirmed', 422, 'Order is not confirmed.');
            abort_if($order->checked_in_at === null, 422, 'You must attend the event before filling the survey.');

            $exists = SurveyResponse::where('order_id', $order->id)->exists();
            abort_if($exists, 422, 'You have already submitted this survey.');

            // Extract NPS score from answers if an NPS question exists
            $npsScore = null;
            $questions = $survey->questions;
            $answers = $payloads['answers'];
            foreach ($questions as $index => $question) {
                if ($question['type'] === 'nps' && isset($answers[$index])) {
                    $npsScore = (int) $answers[$index];
                    break;
                }
            }

            $response = SurveyResponse::create([
                'survey_id' => $survey->id,
                'order_id' => $order->id,
                'customer_id' => $order->customer_id,
                'answers' => $answers,
                'nps_score' => $npsScore,
                'submitted_at' => now(),
            ]);

            DB::commit();

            return $response;
        } catch (Exception $e) {
            DB::rollBack();
            return $e;
        }
    }

    public function getResults(int $surveyId): mixed
    {
        $survey = Survey::with(['event', 'responses.customer', 'responses.order'])->findOrFail($surveyId);
        $responses = $survey->responses;
        $questions = $survey->questions;

        // NPS calculation
        $nps = null;
        $npsResponses = $responses->whereNotNull('nps_score');
        if ($npsResponses->isNotEmpty()) {
            $total = $npsResponses->count();
            $promoters = $npsResponses->where('nps_score', '>=', 9)->count();
            $passives = $npsResponses->whereBetween('nps_score', [7, 8])->count();
            $detractors = $npsResponses->where('nps_score', '<=', 6)->count();

            $nps = [
                'score' => $total > 0 ? round(($promoters - $detractors) / $total * 100) : 0,
                'promoters' => $promoters,
                'passives' => $passives,
                'detractors' => $detractors,
                'total' => $total,
            ];
        }

        // Per-question stats
        $questionStats = [];
        foreach ($questions as $index => $question) {
            $questionAnswers = $responses->pluck("answers.{$index}")->filter(fn($v) => $v !== null);
            $stats = [];

            switch ($question['type']) {
                case 'nps':
                    $numeric = $questionAnswers->map(fn($v) => (int) $v);
                    $stats = [
                        'average' => $numeric->isNotEmpty() ? round($numeric->avg(), 1) : null,
                        'count' => $numeric->count(),
                    ];
                    break;
                case 'rating':
                    $numeric = $questionAnswers->map(fn($v) => (int) $v);
                    $stats = [
                        'average' => $numeric->isNotEmpty() ? round($numeric->avg(), 1) : null,
                        'distribution' => $numeric->countBy()->sortKeys()->all(),
                        'count' => $numeric->count(),
                    ];
                    break;
                case 'multiple_choice':
                    $stats = [
                        'distribution' => $questionAnswers->countBy()->sortByDesc(fn($v) => $v)->all(),
                        'count' => $questionAnswers->count(),
                    ];
                    break;
                case 'text':
                    $stats = [
                        'responses' => $questionAnswers->values()->all(),
                        'count' => $questionAnswers->count(),
                    ];
                    break;
            }

            $questionStats[] = [
                'index' => $index,
                'question' => $question,
                'stats' => $stats,
            ];
        }

        return [
            'survey' => $survey,
            'total_responses' => $responses->count(),
            'nps' => $nps,
            'question_stats' => $questionStats,
        ];
    }
}
