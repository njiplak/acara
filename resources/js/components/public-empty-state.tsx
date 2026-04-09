import type { LucideIcon } from 'lucide-react';

type Props = {
    icon: LucideIcon;
    title: string;
    description?: string;
};

export function PublicEmptyState({ icon: Icon, title, description }: Props) {
    return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
            <Icon className="mb-3 size-8 text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {description && (
                <p className="mt-1 text-xs text-muted-foreground/70">{description}</p>
            )}
        </div>
    );
}
