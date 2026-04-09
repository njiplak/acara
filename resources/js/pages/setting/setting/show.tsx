import { router } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { index } from '@/routes/backoffice/setting/setting';
import type { Setting } from '@/types/setting';

type Props = {
    setting: Setting;
};

export default function SettingShow({ setting }: Props) {
    return (
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
            <h1 className="text-xl font-semibold">Setting Detail</h1>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-muted-foreground">Key</span>
                    <span className="font-mono text-sm">{setting.key}</span>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-muted-foreground">Value</span>
                    <span className="text-sm">{setting.value || '-'}</span>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-muted-foreground">Created At</span>
                    <span className="text-sm">
                        {new Date(setting.created_at).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                        })}
                    </span>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-muted-foreground">Updated At</span>
                    <span className="text-sm">
                        {new Date(setting.updated_at).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                        })}
                    </span>
                </div>
            </div>

            <div>
                <Button variant="outline" onClick={() => router.visit(index().url)}>
                    Back
                </Button>
            </div>
        </div>
    );
}

SettingShow.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
