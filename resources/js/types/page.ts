import type { Model } from './model';

export type Page = Model & {
    title: string;
    slug: string;
    content: string | null;
    status: 'draft' | 'published';
    is_system: boolean;
    meta_description: string | null;
};
