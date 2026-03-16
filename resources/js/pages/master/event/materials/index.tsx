import { Link, router } from '@inertiajs/react';
import { ArrowLeft, ExternalLink, File, FileText, Link2, Trash2, Video } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { create, destroy } from '@/routes/backoffice/master/event/materials';
import { index as eventIndex } from '@/routes/backoffice/master/event';
import type { Event } from '@/types/event';
import type { EventMaterial } from '@/types/event-material';

const typeIcons = { file: File, link: Link2, note: FileText, video: Video };
const typeLabels = { file: 'File', link: 'Link', note: 'Note', video: 'Video' };

type Props = {
    event: Event;
    materials: EventMaterial[];
};

export default function MaterialsIndex({ event, materials }: Props) {
    const handleDelete = (id: number) => {
        if (!confirm('Delete this material?')) return;
        router.delete(destroy(event.id, id).url);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <Link
                        href={eventIndex().url}
                        className="mb-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="size-3.5" />
                        Back to Events
                    </Link>
                    <h1 className="text-xl font-semibold">{event.name} — Materials</h1>
                </div>
                <Button asChild>
                    <Link href={create(event.id).url}>Add Material</Link>
                </Button>
            </div>

            {materials.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
                    <FileText className="mb-3 size-8 text-muted-foreground/50" />
                    <p className="text-sm font-medium text-muted-foreground">No materials yet</p>
                    <p className="mt-1 text-xs text-muted-foreground/70">Add files, links, or notes for attendees</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {materials.map((material) => {
                        const Icon = typeIcons[material.type];
                        return (
                            <div key={material.id} className="flex items-center justify-between rounded-lg border bg-card p-4">
                                <div className="flex items-center gap-3">
                                    <Icon className="size-5 text-muted-foreground" />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{material.title}</span>
                                            <Badge variant="outline">{typeLabels[material.type]}</Badge>
                                            {material.catalog && (
                                                <Badge variant="secondary">{material.catalog.name}</Badge>
                                            )}
                                        </div>
                                        {material.type === 'link' && material.content && (
                                            <a
                                                href={material.content}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                                            >
                                                {material.content}
                                                <ExternalLink className="size-3" />
                                            </a>
                                        )}
                                        {material.type === 'note' && material.content && (
                                            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{material.content}</p>
                                        )}
                                        {material.type === 'file' && material.media?.[0] && (
                                            <p className="mt-0.5 text-xs text-muted-foreground">{material.media[0].file_name}</p>
                                        )}
                                        {material.type === 'video' && material.content && (
                                            <a
                                                href={material.content}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                                            >
                                                {material.content}
                                                <ExternalLink className="size-3" />
                                            </a>
                                        )}
                                        {(material.available_from || material.available_until) && (
                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                {material.available_from && `From: ${new Date(material.available_from).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`}
                                                {material.available_from && material.available_until && ' · '}
                                                {material.available_until && `Until: ${new Date(material.available_until).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-500 hover:text-red-600"
                                    onClick={() => handleDelete(material.id)}
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

MaterialsIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
