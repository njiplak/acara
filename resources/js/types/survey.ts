import type { Customer } from './customer';
import type { Event } from './event';
import type { Model } from './model';
import type { Order } from './order';

export type QuestionType = 'nps' | 'rating' | 'multiple_choice' | 'text';

export type SurveyQuestion = {
    type: QuestionType;
    label: string;
    options?: string[];
    required?: boolean;
};

export type Survey = Model & {
    event_id: number;
    title: string;
    description: string | null;
    slug: string;
    questions: SurveyQuestion[];
    is_active: boolean;
    event?: Event;
    responses?: SurveyResponseItem[];
    responses_count?: number;
};

export type SurveyResponseItem = Model & {
    survey_id: number;
    order_id: number;
    customer_id: number;
    answers: Record<number, any>;
    nps_score: number | null;
    submitted_at: string;
    customer?: Customer;
    order?: Order;
};

export type SurveyResults = {
    survey: Survey;
    total_responses: number;
    nps: {
        score: number;
        promoters: number;
        passives: number;
        detractors: number;
        total: number;
    } | null;
    question_stats: Array<{
        index: number;
        question: SurveyQuestion;
        stats: any;
    }>;
};
