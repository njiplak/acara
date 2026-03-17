import type { CustomerTag } from './customer';
import type { MailTemplate } from './mail-template';
import type { Model } from './model';

export type Campaign = Model & {
    name: string;
    target_tags: CustomerTag[];
    mail_template_id: number;
    sent_count: number;
    sent_at: string | null;
    mail_template?: MailTemplate;
};
