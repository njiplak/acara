import { Badge } from '@/components/ui/badge';
import type { FilterProps } from '@/types/base';
import type { CustomerTag } from '@/types/customer';

const tagGroups: { label: string; tags: CustomerTag[] }[] = [
    { label: 'Frequency', tags: ['new', 'returning', 'loyal'] },
    { label: 'Recency', tags: ['active', 'lapsed', 'inactive'] },
    { label: 'Behavior', tags: ['no-show', 'big-spender', 'referrer'] },
];

const tagLabels: Record<CustomerTag, string> = {
    new: 'New',
    returning: 'Returning',
    loyal: 'Loyal',
    active: 'Active',
    lapsed: 'Lapsed',
    inactive: 'Inactive',
    'no-show': 'No-show',
    'big-spender': 'Big Spender',
    referrer: 'Referrer',
};

export default function CustomerTagFilter({ updateParams, currentParams }: FilterProps) {
    const selectedTags: string[] = currentParams?.['filter[tags]']
        ? String(currentParams['filter[tags]']).split(',')
        : [];

    const toggleTag = (tag: string) => {
        const next = selectedTags.includes(tag)
            ? selectedTags.filter((t) => t !== tag)
            : [...selectedTags, tag];
        updateParams?.({ 'filter[tags]': next.length > 0 ? next.join(',') : undefined });
    };

    return (
        <div className="flex flex-col gap-4">
            {tagGroups.map((group) => (
                <div key={group.label} className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-muted-foreground">{group.label}</span>
                    <div className="flex flex-wrap gap-1.5">
                        {group.tags.map((tag) => {
                            const isSelected = selectedTags.includes(tag);
                            return (
                                <button key={tag} type="button" onClick={() => toggleTag(tag)}>
                                    <Badge variant={isSelected ? 'default' : 'outline'}>
                                        {tagLabels[tag]}
                                    </Badge>
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
