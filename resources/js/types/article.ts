import type { MediaItem } from './media';
import type { Model } from './model';

export type Article = Model & {
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    is_published: boolean;
    published_at: string | null;
    user_id: number;
    author?: { id: number; name: string };
    media?: MediaItem[];
};
