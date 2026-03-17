import { router, useForm } from '@inertiajs/react';
import { GripVertical, LoaderCircle, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';

import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { FormResponse } from '@/lib/constant';
import { index, store, update } from '@/routes/backoffice/operational/survey';
import type { Event } from '@/types/event';
import type { Survey, SurveyQuestion, QuestionType } from '@/types/survey';

type Props = {
    survey?: Survey;
    events: Event[];
};

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

const questionTypeLabels: Record<QuestionType, string> = {
    nps: 'NPS (0-10)',
    rating: 'Rating (1-5)',
    multiple_choice: 'Multiple Choice',
    text: 'Text',
};

export default function SurveyForm({ survey, events }: Props) {
    const { data, setData, post, put, errors, processing } = useForm({
        event_id: survey?.event_id ?? '',
        title: survey?.title ?? '',
        description: survey?.description ?? '',
        slug: survey?.slug ?? '',
        questions: (survey?.questions ?? []) as SurveyQuestion[],
        is_active: survey?.is_active ?? true,
    });

    const [autoSlug, setAutoSlug] = useState(!survey);

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (survey) {
            put(update(survey.id).url, FormResponse);
        } else {
            post(store().url, FormResponse);
        }
    };

    const handleTitleChange = (title: string) => {
        setData('title', title);
        if (autoSlug) {
            setData((prev) => ({ ...prev, title, slug: slugify(title) }));
        }
    };

    const addQuestion = (type: QuestionType) => {
        const question: SurveyQuestion = {
            type,
            label: '',
            required: true,
            ...(type === 'multiple_choice' ? { options: [''] } : {}),
        };
        setData('questions', [...data.questions, question]);
    };

    const updateQuestion = (index: number, field: string, value: any) => {
        const updated = [...data.questions];
        (updated[index] as any)[field] = value;
        setData('questions', updated);
    };

    const removeQuestion = (index: number) => {
        setData('questions', data.questions.filter((_, i) => i !== index));
    };

    const addOption = (qIndex: number) => {
        const updated = [...data.questions];
        const options = updated[qIndex].options || [];
        updated[qIndex].options = [...options, ''];
        setData('questions', updated);
    };

    const updateOption = (qIndex: number, oIndex: number, value: string) => {
        const updated = [...data.questions];
        const options = [...(updated[qIndex].options || [])];
        options[oIndex] = value;
        updated[qIndex].options = options;
        setData('questions', updated);
    };

    const removeOption = (qIndex: number, oIndex: number) => {
        const updated = [...data.questions];
        updated[qIndex].options = (updated[qIndex].options || []).filter((_, i) => i !== oIndex);
        setData('questions', updated);
    };

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{survey ? 'Edit Survey' : 'New Survey'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                        <Label>Event</Label>
                        <Select
                            value={String(data.event_id)}
                            onValueChange={(v) => setData('event_id', Number(v) as any)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select an event" />
                            </SelectTrigger>
                            <SelectContent>
                                {events.map((event) => (
                                    <SelectItem key={event.id} value={String(event.id)}>
                                        {event.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            One survey per event. Only published events without a survey are shown.
                        </p>
                        <InputError message={errors?.event_id} />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label>Title</Label>
                        <Input
                            value={data.title}
                            onChange={(e) => handleTitleChange(e.target.value)}
                        />
                        <InputError message={errors?.title} />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label>Slug</Label>
                        <Input
                            value={data.slug}
                            onChange={(e) => {
                                setAutoSlug(false);
                                setData('slug', e.target.value);
                            }}
                        />
                        <p className="text-xs text-muted-foreground">
                            URL-friendly identifier. Survey URL: /customer/survey/{data.slug || '...'}
                        </p>
                        <InputError message={errors?.slug} />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label>Description</Label>
                        <Textarea
                            rows={3}
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Tell attendees what this survey is about..."
                        />
                        <InputError message={errors?.description} />
                    </div>

                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="is_active"
                            checked={data.is_active}
                            onCheckedChange={(checked) => setData('is_active', !!checked)}
                        />
                        <Label htmlFor="is_active" className="cursor-pointer">Active</Label>
                        <p className="text-xs text-muted-foreground">
                            Inactive surveys cannot be filled by customers
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Questions</CardTitle>
                        <div className="flex gap-2">
                            {(Object.keys(questionTypeLabels) as QuestionType[]).map((type) => (
                                <Button
                                    key={type}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addQuestion(type)}
                                >
                                    <Plus className="size-3.5" />
                                    {questionTypeLabels[type]}
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {data.questions.length === 0 && (
                        <div className="rounded-lg border border-dashed p-8 text-center">
                            <p className="text-sm text-muted-foreground">
                                No questions yet. Add questions using the buttons above.
                            </p>
                        </div>
                    )}

                    {data.questions.map((question, qIndex) => (
                        <div key={qIndex} className="rounded-lg border p-4 space-y-3">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-muted-foreground">
                                        Q{qIndex + 1}
                                    </span>
                                    <Badge variant="outline">
                                        {questionTypeLabels[question.type]}
                                    </Badge>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeQuestion(qIndex)}
                                    className="text-destructive hover:text-destructive"
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label>Question</Label>
                                <Input
                                    value={question.label}
                                    onChange={(e) => updateQuestion(qIndex, 'label', e.target.value)}
                                    placeholder={
                                        question.type === 'nps'
                                            ? 'How likely are you to recommend this event to a friend?'
                                            : question.type === 'rating'
                                              ? 'How would you rate the overall experience?'
                                              : question.type === 'multiple_choice'
                                                ? 'What did you enjoy most about the event?'
                                                : 'Any additional feedback or suggestions?'
                                    }
                                />
                                <InputError message={(errors as any)?.[`questions.${qIndex}.label`]} />
                            </div>

                            {question.type === 'multiple_choice' && (
                                <div className="flex flex-col gap-2">
                                    <Label>Options</Label>
                                    {(question.options || []).map((option, oIndex) => (
                                        <div key={oIndex} className="flex items-center gap-2">
                                            <Input
                                                value={option}
                                                onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                                placeholder={`Option ${oIndex + 1}`}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeOption(qIndex, oIndex)}
                                            >
                                                <X className="size-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => addOption(qIndex)}
                                        className="self-start"
                                    >
                                        <Plus className="size-3.5" />
                                        Add Option
                                    </Button>
                                </div>
                            )}

                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id={`required-${qIndex}`}
                                    checked={question.required ?? true}
                                    onCheckedChange={(checked) => updateQuestion(qIndex, 'required', !!checked)}
                                />
                                <Label htmlFor={`required-${qIndex}`} className="cursor-pointer text-sm">
                                    Required
                                </Label>
                            </div>
                        </div>
                    ))}

                    <InputError message={errors?.questions} />
                </CardContent>
            </Card>

            <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.visit(index().url)}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={processing}>
                    {processing && <LoaderCircle className="size-4 animate-spin" />}
                    Save
                </Button>
            </div>
        </form>
    );
}

SurveyForm.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
