import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, ClipboardCheck, Star } from 'lucide-react';
import { useState } from 'react';
import { logout } from '@/actions/App/Http/Controllers/Auth/CustomerAuthController';
import { store as storeSurvey } from '@/actions/App/Http/Controllers/Customer/SurveyController';
import { index as ordersIndex } from '@/actions/App/Http/Controllers/Customer/OrderController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { SharedData } from '@/types';
import type { Order } from '@/types/order';
import type { Survey, SurveyQuestion } from '@/types/survey';

type Props = {
    survey: Survey;
    eligibleOrders: Order[];
    logoUrl?: string | null;
};

function NpsInput({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
    return (
        <div className="space-y-2">
            <div className="flex gap-1.5">
                {Array.from({ length: 11 }).map((_, i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={() => onChange(i)}
                        className={`flex size-9 items-center justify-center rounded-md border text-sm font-medium transition-colors ${
                            value === i
                                ? i <= 6
                                    ? 'border-red-500 bg-red-500 text-white'
                                    : i <= 8
                                      ? 'border-amber-500 bg-amber-500 text-white'
                                      : 'border-green-500 bg-green-500 text-white'
                                : 'border-border bg-background hover:bg-accent'
                        }`}
                    >
                        {i}
                    </button>
                ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
                <span>Not at all likely</span>
                <span>Extremely likely</span>
            </div>
        </div>
    );
}

function RatingInput({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
    return (
        <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
                <button
                    key={i}
                    type="button"
                    onClick={() => onChange(i + 1)}
                    className="rounded p-0.5 transition-colors hover:bg-accent"
                >
                    <Star
                        className={`size-7 ${(value ?? 0) > i ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
                    />
                </button>
            ))}
        </div>
    );
}

function MultipleChoiceInput({
    options,
    value,
    onChange,
}: {
    options: string[];
    value: string | null;
    onChange: (v: string) => void;
}) {
    return (
        <div className="space-y-2">
            {options.map((option) => (
                <button
                    key={option}
                    type="button"
                    onClick={() => onChange(option)}
                    className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left text-sm transition-colors ${
                        value === option
                            ? 'border-foreground bg-accent'
                            : 'border-border hover:bg-accent/50'
                    }`}
                >
                    <div
                        className={`flex size-4 shrink-0 items-center justify-center rounded-full border ${
                            value === option ? 'border-foreground bg-foreground' : 'border-muted-foreground/40'
                        }`}
                    >
                        {value === option && <div className="size-1.5 rounded-full bg-background" />}
                    </div>
                    {option}
                </button>
            ))}
        </div>
    );
}

export default function CustomerSurveyShow({ survey, eligibleOrders, logoUrl }: Props) {
    const { auth, name } = usePage<SharedData>().props;
    const customer = auth.customer!;
    const appName = (name as string) || 'Acara';
    const [submitted, setSubmitted] = useState(false);

    const selectedOrder = eligibleOrders[0];

    const { data, setData, post, processing, errors } = useForm<{
        survey_id: number;
        order_id: number;
        answers: Record<number, any>;
    }>({
        survey_id: survey.id,
        order_id: selectedOrder?.id ?? 0,
        answers: {},
    });

    const setAnswer = (index: number, value: any) => {
        setData('answers', { ...data.answers, [index]: value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(storeSurvey.url(), {
            onSuccess: () => setSubmitted(true),
            onError: (err) => {
                // handled by form errors
            },
        });
    };

    const hasNoEligible = eligibleOrders.length === 0;

    return (
        <>
            <Head>
                <title>{`${survey.title} - ${appName}`}</title>
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
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            {customer.avatar ? (
                                <img src={customer.avatar} alt={customer.name} className="size-7 rounded-full" />
                            ) : (
                                <div className="flex size-7 items-center justify-center rounded-full bg-muted text-xs font-medium">
                                    {customer.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <span className="hidden text-sm font-medium sm:inline">{customer.name}</span>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.post(logout.url())}
                        >
                            Logout
                        </Button>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 px-6 py-8 lg:px-12 lg:py-12">
                    <div className="mx-auto max-w-2xl">
                        <Link href={ordersIndex.url()} className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
                            <ArrowLeft className="size-3.5" />
                            Back to My Orders
                        </Link>

                        {submitted ? (
                            <div className="rounded-lg border bg-card p-8 text-center">
                                <CheckCircle className="mx-auto size-12 text-green-500" />
                                <h2 className="mt-4 text-xl font-bold">Thank you!</h2>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Your feedback has been submitted. We appreciate you taking the time to share your thoughts.
                                </p>
                                <Button asChild className="mt-6">
                                    <Link href={ordersIndex.url()}>Back to My Orders</Link>
                                </Button>
                            </div>
                        ) : hasNoEligible ? (
                            <div className="rounded-lg border bg-card p-8 text-center">
                                <ClipboardCheck className="mx-auto size-12 text-muted-foreground" />
                                <h2 className="mt-4 text-xl font-bold">Survey Unavailable</h2>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    You have either already completed this survey or don't have an eligible order for this event.
                                </p>
                                <Button asChild variant="outline" className="mt-6">
                                    <Link href={ordersIndex.url()}>Back to My Orders</Link>
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                {/* Survey header */}
                                <div className="mb-6">
                                    <h1 className="text-2xl font-bold tracking-tight">{survey.title}</h1>
                                    {survey.event && (
                                        <p className="mt-1 text-sm text-muted-foreground">{survey.event.name}</p>
                                    )}
                                    {survey.description && (
                                        <p className="mt-3 text-sm text-muted-foreground">{survey.description}</p>
                                    )}
                                </div>

                                {/* Order selector for multiple eligible orders */}
                                {eligibleOrders.length > 1 && (
                                    <div className="mb-6 rounded-lg border bg-card p-4">
                                        <Label className="mb-2 block">Responding for order:</Label>
                                        <div className="space-y-2">
                                            {eligibleOrders.map((order) => (
                                                <button
                                                    key={order.id}
                                                    type="button"
                                                    onClick={() => setData('order_id', order.id)}
                                                    className={`flex w-full items-center justify-between rounded-md border p-3 text-left text-sm transition-colors ${
                                                        data.order_id === order.id
                                                            ? 'border-foreground bg-accent'
                                                            : 'border-border hover:bg-accent/50'
                                                    }`}
                                                >
                                                    <span className="font-mono text-xs">{order.order_code}</span>
                                                    <span>{order.catalog?.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Questions */}
                                <div className="space-y-6">
                                    {survey.questions.map((question, qIndex) => (
                                        <div key={qIndex} className="rounded-lg border bg-card p-5">
                                            <div className="mb-3 flex items-start gap-2">
                                                <span className="mt-0.5 text-sm font-medium text-muted-foreground">
                                                    {qIndex + 1}.
                                                </span>
                                                <div>
                                                    <Label className="text-sm font-medium">
                                                        {question.label}
                                                    </Label>
                                                    {question.required && (
                                                        <span className="ml-1 text-destructive">*</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="ml-5">
                                                {question.type === 'nps' && (
                                                    <NpsInput
                                                        value={data.answers[qIndex] ?? null}
                                                        onChange={(v) => setAnswer(qIndex, v)}
                                                    />
                                                )}
                                                {question.type === 'rating' && (
                                                    <RatingInput
                                                        value={data.answers[qIndex] ?? null}
                                                        onChange={(v) => setAnswer(qIndex, v)}
                                                    />
                                                )}
                                                {question.type === 'multiple_choice' && (
                                                    <MultipleChoiceInput
                                                        options={question.options || []}
                                                        value={data.answers[qIndex] ?? null}
                                                        onChange={(v) => setAnswer(qIndex, v)}
                                                    />
                                                )}
                                                {question.type === 'text' && (
                                                    <Textarea
                                                        rows={3}
                                                        value={data.answers[qIndex] ?? ''}
                                                        onChange={(e) => setAnswer(qIndex, e.target.value)}
                                                        placeholder="Type your answer here..."
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {errors.answers && (
                                    <p className="mt-2 text-sm text-destructive">{errors.answers}</p>
                                )}

                                <div className="mt-8">
                                    <Button type="submit" disabled={processing} className="gap-2">
                                        <ClipboardCheck className="size-4" />
                                        {processing ? 'Submitting...' : 'Submit Survey'}
                                    </Button>
                                </div>
                            </form>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
}
