import type { Catalog } from './catalog';
import type { MediaItem } from './media';
import type { Model } from './model';

export type EventMaterial = Model & {
    event_id: number;
    catalog_id: number | null;
    title: string;
    type: 'file' | 'link' | 'note' | 'video';
    content: string | null;
    available_from: string | null;
    available_until: string | null;
    media?: MediaItem[];
    catalog?: Catalog;
};
