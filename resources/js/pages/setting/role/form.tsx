import { router, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { Fragment } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { FormResponse } from '@/lib/constant';
import { index, store, update } from '@/routes/backoffice/setting/role';
import type { Role } from '@/types/role';

type PermissionItem = {
    id: number;
    name: string;
};

type PermissionGroup = {
    module: string;
    permissions: PermissionItem[];
};

type Props = {
    role?: Role;
    permissions?: PermissionGroup[];
};

const ACTIONS = ['view', 'create', 'update', 'delete'] as const;

const MODULE_LABELS: Record<string, string> = {
    dashboard: 'Dashboard',
    calendar: 'Calendar',
    event: 'Event',
    catalog: 'Catalog',
    addon: 'Addon',
    speaker: 'Speaker',
    venue: 'Venue',
    voucher: 'Voucher',
    event_template: 'Templates',
    article: 'Article',
    faq: 'FAQ',
    subscription_plan: 'Subscription Plans',
    subscription_feature: 'Sub. Features',
    order: 'Order',
    customer: 'Customer',
    check_in: 'Check In',
    testimonial: 'Testimonial',
    survey: 'Survey',
    subscription_order: 'Sub. Orders',
    landing_page: 'Landing Page',
    setting: 'Settings',
    user: 'User',
    role: 'Role',
    page: 'Pages',
};

const CATEGORIES: { label: string; modules: string[] }[] = [
    { label: 'Menu', modules: ['dashboard', 'calendar'] },
    {
        label: 'Master',
        modules: [
            'event', 'catalog', 'addon', 'speaker', 'venue', 'voucher',
            'event_template', 'article', 'faq', 'subscription_plan', 'subscription_feature',
        ],
    },
    {
        label: 'Operational',
        modules: [
            'order', 'customer', 'check_in', 'testimonial', 'survey',
            'subscription_order',
        ],
    },
    {
        label: 'Setting',
        modules: ['landing_page', 'setting', 'user', 'role', 'page'],
    },
];

export default function RoleForm({ role, permissions = [] }: Props) {
    const initialPermissions = role?.permissions?.map((p) => p.id) ?? [];

    const { data, setData, post, put, errors, processing } = useForm({
        name: role?.name ?? '',
        permissions: initialPermissions,
    });

    const allPermissionIds = permissions.flatMap((g) => g.permissions.map((p) => p.id));
    const allSelected = allPermissionIds.length > 0 && allPermissionIds.every((id) => data.permissions.includes(id));
    const someSelected = !allSelected && allPermissionIds.some((id) => data.permissions.includes(id));

    const permissionMap = new Map<string, PermissionItem>();
    for (const group of permissions) {
        for (const perm of group.permissions) {
            permissionMap.set(perm.name, perm);
        }
    }

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (role) {
            put(update(role.id).url, FormResponse);
        } else {
            post(store().url, FormResponse);
        }
    };

    const togglePermission = (id: number) => {
        setData(
            'permissions',
            data.permissions.includes(id)
                ? data.permissions.filter((p) => p !== id)
                : [...data.permissions, id],
        );
    };

    const toggleModule = (moduleName: string) => {
        const modulePerms = ACTIONS
            .map((action) => permissionMap.get(`${moduleName}.${action}`))
            .filter((p): p is PermissionItem => p !== undefined);
        const moduleIds = modulePerms.map((p) => p.id);
        const allChecked = moduleIds.every((id) => data.permissions.includes(id));

        if (allChecked) {
            setData('permissions', data.permissions.filter((id) => !moduleIds.includes(id)));
        } else {
            const merged = new Set([...data.permissions, ...moduleIds]);
            setData('permissions', Array.from(merged));
        }
    };

    const toggleAll = () => {
        if (allSelected) {
            setData('permissions', []);
        } else {
            setData('permissions', allPermissionIds);
        }
    };

    const toggleCategory = (modules: string[]) => {
        const categoryIds = modules.flatMap((mod) =>
            ACTIONS
                .map((action) => permissionMap.get(`${mod}.${action}`))
                .filter((p): p is PermissionItem => p !== undefined)
                .map((p) => p.id),
        );
        const allChecked = categoryIds.every((id) => data.permissions.includes(id));

        if (allChecked) {
            setData('permissions', data.permissions.filter((id) => !categoryIds.includes(id)));
        } else {
            const merged = new Set([...data.permissions, ...categoryIds]);
            setData('permissions', Array.from(merged));
        }
    };

    return (
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
            <h1 className="text-xl font-semibold">
                {role ? 'Edit Role' : 'New Role'}
            </h1>
            <form onSubmit={onSubmit} className="space-y-6">
                <div className="flex max-w-sm flex-col gap-1.5">
                    <Label>Name</Label>
                    <Input
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                    />
                    <InputError message={errors?.name} />
                </div>

                {permissions.length > 0 && (
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <Label>Permissions</Label>
                            <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                                <Checkbox
                                    checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                                    onCheckedChange={toggleAll}
                                />
                                Select all
                            </label>
                        </div>
                        <InputError message={errors?.permissions} />

                        <div className="overflow-hidden rounded-lg border">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                            Module
                                        </th>
                                        {ACTIONS.map((action) => (
                                            <th
                                                key={action}
                                                className="w-20 px-3 py-2.5 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground"
                                            >
                                                {action}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {CATEGORIES.map((category, catIdx) => {
                                        const categoryIds = category.modules.flatMap((mod) =>
                                            ACTIONS
                                                .map((action) => permissionMap.get(`${mod}.${action}`))
                                                .filter((p): p is PermissionItem => p !== undefined)
                                                .map((p) => p.id),
                                        );
                                        const catAllSelected = categoryIds.length > 0 && categoryIds.every((id) => data.permissions.includes(id));
                                        const catSomeSelected = !catAllSelected && categoryIds.some((id) => data.permissions.includes(id));

                                        return (
                                            <Fragment key={category.label}>
                                                <tr className="border-b bg-muted/30">
                                                    <td colSpan={ACTIONS.length + 1} className="px-4 py-2">
                                                        <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
                                                            <Checkbox
                                                                checked={catAllSelected ? true : catSomeSelected ? 'indeterminate' : false}
                                                                onCheckedChange={() => toggleCategory(category.modules)}
                                                            />
                                                            {category.label}
                                                        </label>
                                                    </td>
                                                </tr>
                                                {category.modules.map((moduleName) => {
                                                    const modulePerms = ACTIONS
                                                        .map((action) => permissionMap.get(`${moduleName}.${action}`))
                                                        .filter((p): p is PermissionItem => p !== undefined);

                                                    if (modulePerms.length === 0) return null;

                                                    const moduleIds = modulePerms.map((p) => p.id);
                                                    const modAllSelected = moduleIds.every((id) => data.permissions.includes(id));
                                                    const modSomeSelected = !modAllSelected && moduleIds.some((id) => data.permissions.includes(id));

                                                    return (
                                                        <tr key={moduleName} className="border-b last:border-b-0">
                                                            <td className="px-4 py-2.5">
                                                                <label className="flex cursor-pointer items-center gap-2 text-sm">
                                                                    <Checkbox
                                                                        checked={modAllSelected ? true : modSomeSelected ? 'indeterminate' : false}
                                                                        onCheckedChange={() => toggleModule(moduleName)}
                                                                    />
                                                                    {MODULE_LABELS[moduleName] ?? moduleName}
                                                                </label>
                                                            </td>
                                                            {ACTIONS.map((action) => {
                                                                const perm = permissionMap.get(`${moduleName}.${action}`);
                                                                if (!perm) {
                                                                    return <td key={action} className="px-3 py-2.5 text-center">-</td>;
                                                                }
                                                                return (
                                                                    <td key={action} className="px-3 py-2.5 text-center">
                                                                        <Checkbox
                                                                            checked={data.permissions.includes(perm.id)}
                                                                            onCheckedChange={() => togglePermission(perm.id)}
                                                                        />
                                                                    </td>
                                                                );
                                                            })}
                                                        </tr>
                                                    );
                                                })}
                                            </Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <Separator />

                <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.visit(index().url)}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={processing}>
                        {processing && (
                            <LoaderCircle className="size-4 animate-spin" />
                        )}
                        Save
                    </Button>
                </div>
            </form>
        </div>
    );
}

RoleForm.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
