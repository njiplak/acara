import type { Catalog } from './catalog';
import type { MediaItem } from './media';
import type { Model } from './model';

export type Speaker = Model & {
    name: string;
    title: string | null;
    bio: string | null;
    media?: MediaItem[];
    catalogs?: Catalog[];
};
