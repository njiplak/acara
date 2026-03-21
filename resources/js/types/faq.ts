import type { Model } from './model';

export type Faq = Model & {
    question: string;
    answer: string;
    sort_order: number;
    is_active: boolean;
};
