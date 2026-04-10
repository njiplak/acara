import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { logout } from '@/actions/App/Http/Controllers/Auth/CustomerAuthController';
import { completeStore } from '@/actions/App/Http/Controllers/Customer/ProfileController';
import { PhoneInput } from '@/components/phone-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { SharedData } from '@/types';

type Props = {
    logoUrl?: string | null;
};

export default function CompleteProfile({ logoUrl }: Props) {
    const { auth, name } = usePage<SharedData>().props;
    const customer = auth.customer!;
    const appName = (name as string) || 'Acara';

    const { data, setData, post, processing, errors } = useForm({
        name: customer.name,
        phone: '',
        date_of_birth: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(completeStore.url());
    };

    return (
        <>
            <Head>
                <title>{`Complete Your Profile - ${appName}`}</title>
            </Head>

            <div className="relative flex min-h-svh flex-col bg-background">
                <div className="h-px w-full bg-border" />

                {/* Header */}
                <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:px-12">
                    <Link href="/" className="flex items-center gap-2.5">
                        {logoUrl ? (
                            <img src={logoUrl} alt={appName} className="h-8 w-auto object-contain" />
                        ) : (
                            <div className="flex size-8 items-center justify-center rounded-md bg-foreground">
                                <span className="text-sm font-bold tracking-tight text-background">{appName.charAt(0)}</span>
                            </div>
                        )}
                        <span className="text-lg font-semibold tracking-tight text-foreground">{appName}</span>
                    </Link>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.post(logout.url())}
                    >
                        Logout
                    </Button>
                </header>

                {/* Content */}
                <main className="flex flex-1 items-start justify-center px-6 py-12 lg:py-20">
                    <div className="w-full max-w-md">
                        <div className="mb-8 text-center">
                            {customer.avatar ? (
                                <img src={customer.avatar} alt={customer.name} className="mx-auto mb-4 size-16 rounded-full" />
                            ) : (
                                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted text-xl font-semibold">
                                    {customer.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">Complete Your Profile</h1>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Just a few more details so we can personalize your experience.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="rounded-lg border bg-card p-6">
                            <div className="space-y-4">
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                    />
                                    {errors.name && (
                                        <p className="text-xs text-destructive">{errors.name}</p>
                                    )}
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <PhoneInput
                                        defaultCountry="ID"
                                        value={data.phone}
                                        onChange={(value) => setData('phone', value)}
                                    />
                                    {errors.phone && (
                                        <p className="text-xs text-destructive">{errors.phone}</p>
                                    )}
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                                    <Input
                                        id="date_of_birth"
                                        type="date"
                                        value={data.date_of_birth}
                                        onChange={(e) => setData('date_of_birth', e.target.value)}
                                    />
                                    {errors.date_of_birth && (
                                        <p className="text-xs text-destructive">{errors.date_of_birth}</p>
                                    )}
                                </div>
                            </div>

                            <Button type="submit" className="mt-6 w-full" disabled={processing}>
                                {processing ? 'Saving...' : 'Continue'}
                            </Button>
                        </form>
                    </div>
                </main>
            </div>
        </>
    );
}
