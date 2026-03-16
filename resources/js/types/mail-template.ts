import type { Model } from './model';

export type MailTemplate = Model & {
    slug: string;
    name: string;
    subject: string;
    body: string;
    variables: string[] | null;
    is_active: boolean;
};
