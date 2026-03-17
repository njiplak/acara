import { Link } from '@inertiajs/react';
import { ArrowLeft, Star, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { index } from '@/routes/backoffice/operational/survey';
import type { SurveyResults } from '@/types/survey';

type Props = {
    results: SurveyResults;
};

function NpsGauge({ nps }: { nps: NonNullable<SurveyResults['nps']> }) {
    const getColor = (score: number) => {
        if (score >= 50) return 'text-green-600 dark:text-green-400';
        if (score >= 0) return 'text-amber-600 dark:text-amber-400';
        return 'text-red-600 dark:text-red-400';
    };

    const total = nps.total;
    const pPct = total > 0 ? Math.round((nps.promoters / total) * 100) : 0;
    const paPct = total > 0 ? Math.round((nps.passives / total) * 100) : 0;
    const dPct = total > 0 ? Math.round((nps.detractors / total) * 100) : 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm">Net Promoter Score</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-6">
                    <div className="text-center">
                        <div className={`text-4xl font-bold ${getColor(nps.score)}`}>
                            {nps.score}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">NPS Score</div>
                    </div>
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <div className="size-2.5 rounded-full bg-green-500" />
                                <span>Promoters (9-10)</span>
                            </div>
                            <span className="font-medium">{nps.promoters} ({pPct}%)</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <div className="size-2.5 rounded-full bg-amber-500" />
                                <span>Passives (7-8)</span>
                            </div>
                            <span className="font-medium">{nps.passives} ({paPct}%)</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <div className="size-2.5 rounded-full bg-red-500" />
                                <span>Detractors (0-6)</span>
                            </div>
                            <span className="font-medium">{nps.detractors} ({dPct}%)</span>
                        </div>
                        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
                            {pPct > 0 && <div className="bg-green-500" style={{ width: `${pPct}%` }} />}
                            {paPct > 0 && <div className="bg-amber-500" style={{ width: `${paPct}%` }} />}
                            {dPct > 0 && <div className="bg-red-500" style={{ width: `${dPct}%` }} />}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function RatingStats({ stats, question }: { stats: any; question: any }) {
    const max = 5;
    const distribution = stats.distribution || {};

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-3">
                <div className="text-3xl font-bold">{stats.average ?? '-'}</div>
                <div className="flex items-center gap-0.5">
                    {Array.from({ length: max }).map((_, i) => (
                        <Star
                            key={i}
                            className={`size-4 ${i < Math.round(stats.average || 0) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
                        />
                    ))}
                </div>
                <span className="text-sm text-muted-foreground">({stats.count} responses)</span>
            </div>
            <div className="space-y-1.5">
                {Array.from({ length: max }).map((_, i) => {
                    const rating = max - i;
                    const count = distribution[rating] || 0;
                    const pct = stats.count > 0 ? Math.round((count / stats.count) * 100) : 0;
                    return (
                        <div key={rating} className="flex items-center gap-2 text-sm">
                            <span className="w-4 text-right text-muted-foreground">{rating}</span>
                            <Star className="size-3.5 fill-amber-400 text-amber-400" />
                            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="w-8 text-right text-muted-foreground">{count}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function MultipleChoiceStats({ stats }: { stats: any }) {
    const distribution: Record<string, number> = stats.distribution || {};
    const entries = Object.entries(distribution);
    const maxCount = Math.max(...entries.map(([, v]) => v as number), 1);

    return (
        <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{stats.count} responses</p>
            {entries.map(([option, count]) => {
                const pct = stats.count > 0 ? Math.round(((count as number) / stats.count) * 100) : 0;
                return (
                    <div key={option} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                            <span>{option}</span>
                            <span className="text-muted-foreground">{count as number} ({pct}%)</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                            <div className="h-full rounded-full bg-foreground/20" style={{ width: `${pct}%` }} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function TextResponses({ stats }: { stats: any }) {
    const responses: string[] = stats.responses || [];

    return (
        <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{stats.count} responses</p>
            {responses.length === 0 ? (
                <p className="text-sm text-muted-foreground">No text responses yet.</p>
            ) : (
                <div className="max-h-64 space-y-2 overflow-y-auto">
                    {responses.map((response, i) => (
                        <div key={i} className="rounded-md border p-3">
                            <p className="text-sm">{response}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function SurveyResultsPage({ results }: Props) {
    const { survey, total_responses, nps, question_stats } = results;

    return (
        <div className="space-y-6">
            <div>
                <Link
                    href={index().url}
                    className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ArrowLeft className="size-3.5" />
                    Back to Surveys
                </Link>

                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">{survey.title}</h2>
                        <p className="text-sm text-muted-foreground">{survey.event?.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline">
                            <Users className="mr-1 size-3.5" />
                            {total_responses} responses
                        </Badge>
                    </div>
                </div>
            </div>

            {nps && <NpsGauge nps={nps} />}

            {question_stats.map(({ index: qIndex, question, stats }) => (
                <Card key={qIndex}>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground">Q{qIndex + 1}</span>
                            <CardTitle className="text-sm">{question.label}</CardTitle>
                            <Badge variant="outline" className="ml-auto text-xs">
                                {question.type === 'nps' ? 'NPS' : question.type === 'rating' ? 'Rating' : question.type === 'multiple_choice' ? 'Multiple Choice' : 'Text'}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {question.type === 'nps' && (
                            <div className="space-y-1">
                                <div className="text-3xl font-bold">{stats.average ?? '-'}</div>
                                <p className="text-sm text-muted-foreground">Average score ({stats.count} responses)</p>
                            </div>
                        )}
                        {question.type === 'rating' && <RatingStats stats={stats} question={question} />}
                        {question.type === 'multiple_choice' && <MultipleChoiceStats stats={stats} />}
                        {question.type === 'text' && <TextResponses stats={stats} />}
                    </CardContent>
                </Card>
            ))}

            {question_stats.length === 0 && (
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground">No responses yet.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

SurveyResultsPage.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
