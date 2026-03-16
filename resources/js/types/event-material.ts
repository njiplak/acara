import type { Catalog } from './catalog';
import type { MediaItem } from './media';
import type { Model } from './model';

export type EventMaterial = Model & {
    event_id: number;
    catalog_id: number | null;
    title: string;
    type: 'file' | 'link' | 'note';
    content: string | null;
    media?: MediaItem[];
    catalog?: Catalog;
};
