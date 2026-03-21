import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Calendar, CheckCircle, Clock, Download, ExternalLink, File, FileText, Link2, MessageSquare, Play, QrCode, Star, Upload, Video, XCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useRef } from 'react';
import { logout } from '@/actions/App/Http/Controllers/Auth/CustomerAuthController';
import { cancel, certificate, index, pay, redirectToPayment } from '@/actions/App/Http/Controllers/Customer/OrderController';
import { store as storeTestimonial } from '@/actions/App/Http/Controllers/Customer/TestimonialController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { SharedData } from '@/types';
import type { EventMaterial } from '@/types/event-material';
import type { Order, OrderStatus } from '@/types/order';
import type { Testimonial } from '@/types/testimonial';

function formatPrice(price: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
}

function formatDate(date: string) {
    return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function getVideoEmbedUrl(url: string): string | null {
    // YouTube: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
    const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;

    // Vimeo: vimeo.com/ID
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

    return null;
}

const statusConfig: Record<OrderStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    pending_payment: { label: 'Pending Payment', variant: 'outline' },
    waiting_confirmation: { label: 'Waiting Confirmation', variant: 'secondary' },
    confirmed: { label: 'Confirmed', variant: 'default' },
    rejected: { label: 'Rejected', variant: 'destructive' },
    cancelled: { label: 'Cancelled', variant: 'outline' },
    refunded: { label: 'Refunded', variant: 'secondary' },
};

type Props = {
    order: Order;
    paymentInstruction: string | null;
    materials?: EventMaterial[];
    logoUrl?: string | null;
    testimonial?: Testimonial | null;
    canSubmitTestimonial?: boolean;
};

export default function CustomerOrderShow({ order, paymentInstruction, materials = [], logoUrl, testimonial, canSubmitTestimonial }: Props) {
    const { auth, name } = usePage<SharedData>().props;
    const customer = auth.customer!;
    const appName = (name as string) || 'Acara';
    const config = statusConfig[order.status];
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { data, setData, post, processing, errors } = useForm<{ payment_proof: File | null }>({
        payment_proof: null,
    });

    const handleUpload = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.payment_proof) return;
        post(pay.url({ order: order.id }), {
            forceFormData: true,
        });
    };

    const handleCancel = () => {
        if (!confirm('Are you sure you want to cancel this order?')) return;
        router.post(cancel.url({ order: order.id }));
    };

    return (
        <>
            <Head>
                <title>{`Order ${order.order_code} - ${appName}`}</title>
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
                    <div className="mx-auto max-w-3xl">
                        <Link href={index.url()} className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
                            <ArrowLeft className="size-3.5" />
                            Back to My Orders
                        </Link>

                        {/* Order header */}
                        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <span className="text-xs font-mono text-muted-foreground">{order.order_code}</span>
                                <h1 className="text-2xl font-bold tracking-tight text-foreground">Order Detail</h1>
                            </div>
                            <Badge variant={config.variant} className="self-start sm:self-auto">{config.label}</Badge>
                        </div>

                        {/* Status message */}
                        <StatusMessage order={order} />

                        {/* QR Code + Actions for confirmed orders */}
                        {order.status === 'confirmed' && (
                            <div className="mt-4 rounded-lg border bg-card p-5">
                                <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                                    <div className="flex flex-col items-center gap-2">
                                        <QRCodeSVG value={order.order_code} size={120} />
                                        <span className="text-xs text-muted-foreground">Show this QR at check-in</span>
                                    </div>
                                    <div className="flex flex-1 flex-col gap-2 text-center sm:text-left">
                                        {order.checked_in_at ? (
                                            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                                <CheckCircle className="size-4" />
                                                <span className="text-sm font-medium">Checked In</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDate(order.checked_in_at)}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <QrCode className="size-4" />
                                                <span className="text-sm">Not checked in yet</span>
                                            </div>
                                        )}
                                        <a
                                            href={`/customer/orders/${order.id}/invoice`}
                                            className="inline-flex items-center gap-2 text-sm font-medium text-foreground underline underline-offset-2 hover:no-underline"
                                        >
                                            <Download className="size-4" />
                                            Download Invoice
                                        </a>
                                        {order.checked_in_at && (
                                            <a
                                                href={certificate.url({ order: order.id })}
                                                className="inline-flex items-center gap-2 text-sm font-medium text-foreground underline underline-offset-2 hover:no-underline"
                                            >
                                                <Download className="size-4" />
                                                Download Certificate
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Event & Session */}
                        <div className="mt-6 rounded-lg border bg-card p-5">
                            <h2 className="mb-3 text-sm font-semibold text-foreground">Event & Session</h2>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Event</span>
                                    <span className="text-sm font-medium text-foreground">{order.event?.name}</span>
                                </div>
                                {order.event && (
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Date</span>
                                        <div className="flex items-center gap-1.5 text-sm text-foreground">
                                            <Calendar className="size-3.5" />
                                            <span>{formatDate(order.event.start_date)}</span>
                                        </div>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Session</span>
                                    <span className="text-sm font-medium text-foreground">{order.catalog?.name}</span>
                                </div>
                            </div>
                        </div>

                        {/* Pricing breakdown */}
                        <div className="mt-4 rounded-lg border bg-card p-5">
                            <h2 className="mb-3 text-sm font-semibold text-foreground">Pricing</h2>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">{order.catalog?.name}</span>
                                    <span className="text-sm text-foreground">{formatPrice(order.catalog_price)}</span>
                                </div>
                                {order.addons && order.addons.length > 0 && (
                                    <>
                                        {order.addons.map((addon) => (
                                            <div key={addon.id} className="flex justify-between">
                                                <span className="text-sm text-muted-foreground">{addon.pivot?.addon_name || addon.name}</span>
                                                <span className="text-sm text-foreground">{formatPrice(addon.pivot?.addon_price || addon.price)}</span>
                                            </div>
                                        ))}
                                    </>
                                )}
                                {order.voucher_discount > 0 && (
                                    <div className="flex justify-between text-green-600 dark:text-green-400">
                                        <span className="text-sm">Promo discount</span>
                                        <span className="text-sm">-{formatPrice(order.voucher_discount)}</span>
                                    </div>
                                )}
                                {order.referral_discount > 0 && (
                                    <div className="flex justify-between text-green-600 dark:text-green-400">
                                        <span className="text-sm">Referral discount</span>
                                        <span className="text-sm">-{formatPrice(order.referral_discount)}</span>
                                    </div>
                                )}
                                {order.balance_used > 0 && (
                                    <div className="flex justify-between text-green-600 dark:text-green-400">
                                        <span className="text-sm">Balance used</span>
                                        <span className="text-sm">-{formatPrice(order.balance_used)}</span>
                                    </div>
                                )}
                                <div className="border-t pt-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm font-semibold text-foreground">Total</span>
                                        <span className="text-lg font-bold text-foreground">{formatPrice(order.total_amount)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Materials */}
                        {materials.length > 0 && (
                            <div className="mt-4 rounded-lg border bg-card p-5">
                                <h2 className="mb-3 text-sm font-semibold text-foreground">Materials</h2>
                                <div className="space-y-2">
                                    {materials.map((material) => {
                                        const icons = { file: File, link: Link2, note: FileText, video: Video };
                                        const Icon = icons[material.type];
                                        const embedUrl = material.type === 'video' && material.content ? getVideoEmbedUrl(material.content) : null;
                                        return (
                                            <div key={material.id} className="flex flex-col gap-2 rounded-md border p-3">
                                                <div className="flex items-start gap-3">
                                                    <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-foreground">{material.title}</p>
                                                        {material.type === 'link' && material.content && (
                                                            <a
                                                                href={material.content}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="mt-0.5 inline-flex items-center gap-1 text-xs text-foreground underline underline-offset-2 hover:no-underline"
                                                            >
                                                                Open Link
                                                                <ExternalLink className="size-3" />
                                                            </a>
                                                        )}
                                                        {material.type === 'note' && material.content && (
                                                            <p className="mt-0.5 whitespace-pre-wrap text-xs text-muted-foreground">{material.content}</p>
                                                        )}
                                                        {material.type === 'file' && material.media?.[0] && (
                                                            <a
                                                                href={material.media[0].original_url}
                                                                download
                                                                className="mt-0.5 inline-flex items-center gap-1 text-xs text-foreground underline underline-offset-2 hover:no-underline"
                                                            >
                                                                <Download className="size-3" />
                                                                {material.media[0].file_name}
                                                            </a>
                                                        )}
                                                        {material.type === 'video' && material.content && !embedUrl && (
                                                            <a
                                                                href={material.content}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="mt-0.5 inline-flex items-center gap-1 text-xs text-foreground underline underline-offset-2 hover:no-underline"
                                                            >
                                                                <Play className="size-3" />
                                                                Watch Video
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                                {embedUrl && (
                                                    <div className="aspect-video w-full overflow-hidden rounded-md">
                                                        <iframe
                                                            src={embedUrl}
                                                            className="size-full"
                                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                            allowFullScreen
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Payment section */}
                        {(order.status === 'pending_payment' || order.status === 'rejected') && (
                            <div className="mt-4 rounded-lg border bg-card p-5">
                                <h2 className="mb-3 text-sm font-semibold text-foreground">Payment</h2>

                                {order.payment_gateway === 'manual' ? (
                                    <>
                                        {paymentInstruction && (
                                            <div className="mb-4 rounded-md bg-accent/50 p-4">
                                                <p className="text-xs font-medium text-muted-foreground mb-2">Payment Instructions:</p>
                                                <p className="text-sm whitespace-pre-wrap text-foreground">{paymentInstruction}</p>
                                            </div>
                                        )}

                                        <form onSubmit={handleUpload} className="space-y-3">
                                            <div>
                                                <label className="text-sm font-medium text-foreground">Upload Payment Proof</label>
                                                <p className="text-xs text-muted-foreground mt-0.5">Upload a screenshot or photo of your transfer receipt (max 2MB)</p>
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    className="mt-2 block w-full text-sm file:mr-3 file:rounded-md file:border file:border-border file:bg-background file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-foreground hover:file:bg-accent"
                                                    onChange={(e) => setData('payment_proof', e.target.files?.[0] || null)}
                                                />
                                                {errors.payment_proof && (
                                                    <p className="mt-1 text-xs text-destructive">{errors.payment_proof}</p>
                                                )}
                                            </div>
                                            <Button type="submit" disabled={processing || !data.payment_proof} className="gap-2">
                                                <Upload className="size-4" />
                                                {processing ? 'Uploading...' : 'Submit Payment Proof'}
                                            </Button>
                                        </form>
                                    </>
                                ) : (
                                    <div className="space-y-3">
                                        <p className="text-sm text-muted-foreground">
                                            Complete your payment via <span className="font-medium capitalize text-foreground">{order.payment_gateway}</span> to confirm your registration.
                                        </p>
                                        <Button
                                            onClick={() => router.post(redirectToPayment.url({ order: order.id }))}
                                            className="gap-2"
                                        >
                                            <ExternalLink className="size-4" />
                                            Pay Now
                                        </Button>
                                        {order.latest_transaction?.expires_at && (
                                            <p className="text-xs text-muted-foreground">
                                                Payment link expires on {formatDate(order.latest_transaction.expires_at)}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Payment proof preview for waiting_confirmation (manual only) */}
                        {order.status === 'waiting_confirmation' && order.payment_gateway === 'manual' && order.payment_proof && (
                            <div className="mt-4 rounded-lg border bg-card p-5">
                                <h2 className="mb-3 text-sm font-semibold text-foreground">Payment Proof</h2>
                                <img
                                    src={`/storage/${order.payment_proof}`}
                                    alt="Payment proof"
                                    className="max-h-64 rounded-md border"
                                />
                                {order.paid_at && (
                                    <p className="mt-2 text-xs text-muted-foreground">Submitted {formatDate(order.paid_at)}</p>
                                )}
                            </div>
                        )}

                        {/* Testimonial - already submitted */}
                        {testimonial && (
                            <div className="mt-4 rounded-lg border bg-card p-5">
                                <h2 className="mb-3 text-sm font-semibold text-foreground">Your Feedback</h2>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`size-4 ${i < testimonial.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
                                        />
                                    ))}
                                </div>
                                {testimonial.body && (
                                    <p className="mt-2 text-sm text-muted-foreground">{testimonial.body}</p>
                                )}
                                <p className="mt-2 text-xs text-muted-foreground">Submitted on {formatDate(testimonial.created_at)}</p>
                            </div>
                        )}

                        {/* Testimonial - submit form */}
                        {canSubmitTestimonial && <TestimonialForm orderId={order.id} />}

                        {/* Actions */}
                        {!['confirmed', 'cancelled', 'refunded'].includes(order.status) && (
                            <div className="mt-6">
                                <Button variant="outline" size="sm" onClick={handleCancel} className="text-destructive hover:text-destructive">
                                    Cancel Order
                                </Button>
                            </div>
                        )}

                        {/* Timestamps */}
                        <div className="mt-6 text-xs text-muted-foreground">
                            <p>Ordered on {formatDate(order.created_at)}</p>
                            {order.confirmed_at && <p>Confirmed on {formatDate(order.confirmed_at)}</p>}
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}

function TestimonialForm({ orderId }: { orderId: number }) {
    const { data, setData, post, processing, errors } = useForm({
        order_id: orderId,
        rating: 0,
        body: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (data.rating === 0) return;
        post(storeTestimonial.url());
    };

    return (
        <div className="mt-4 rounded-lg border bg-card p-5">
            <div className="mb-3 flex items-center gap-2">
                <MessageSquare className="size-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground">How was your experience?</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-foreground">Rating</label>
                    <div className="mt-1.5 flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => setData('rating', i + 1)}
                                className="rounded p-0.5 transition-colors hover:bg-accent"
                            >
                                <Star
                                    className={`size-6 ${i < data.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
                                />
                            </button>
                        ))}
                    </div>
                    {errors.rating && <p className="mt-1 text-xs text-destructive">{errors.rating}</p>}
                </div>
                <div>
                    <label className="text-sm font-medium text-foreground">Feedback (optional)</label>
                    <Textarea
                        className="mt-1.5"
                        placeholder="Tell us about your experience..."
                        value={data.body}
                        onChange={(e) => setData('body', e.target.value)}
                        rows={3}
                    />
                    {errors.body && <p className="mt-1 text-xs text-destructive">{errors.body}</p>}
                </div>
                <Button type="submit" disabled={processing || data.rating === 0} className="gap-2">
                    <Star className="size-4" />
                    {processing ? 'Submitting...' : 'Submit Feedback'}
                </Button>
            </form>
        </div>
    );
}

function StatusMessage({ order }: { order: Order }) {
    switch (order.status) {
        case 'pending_payment':
            return (
                <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
                    <Clock className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
                    <div>
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Payment Required</p>
                        <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-300">
                            {order.payment_gateway === 'manual'
                                ? 'Please complete your payment and upload the proof below.'
                                : 'Please complete your payment by clicking the Pay Now button below.'}
                        </p>
                    </div>
                </div>
            );
        case 'waiting_confirmation':
            return (
                <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
                    <Clock className="mt-0.5 size-5 shrink-0 text-blue-600 dark:text-blue-400" />
                    <div>
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Payment Under Review</p>
                        <p className="mt-0.5 text-xs text-blue-700 dark:text-blue-300">We're reviewing your payment proof. You'll be notified once it's confirmed.</p>
                    </div>
                </div>
            );
        case 'confirmed':
            return (
                <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
                    <CheckCircle className="mt-0.5 size-5 shrink-0 text-green-600 dark:text-green-400" />
                    <div>
                        <p className="text-sm font-medium text-green-800 dark:text-green-200">Registration Confirmed</p>
                        <p className="mt-0.5 text-xs text-green-700 dark:text-green-300">Your registration has been confirmed. See you at the event!</p>
                    </div>
                </div>
            );
        case 'rejected':
            return (
                <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
                    <XCircle className="mt-0.5 size-5 shrink-0 text-red-600 dark:text-red-400" />
                    <div>
                        <p className="text-sm font-medium text-red-800 dark:text-red-200">Payment Rejected</p>
                        <p className="mt-0.5 text-xs text-red-700 dark:text-red-300">
                            {order.rejection_reason || 'Your payment proof was rejected. Please re-upload a valid proof.'}
                        </p>
                    </div>
                </div>
            );
        case 'cancelled':
            return (
                <div className="flex items-start gap-3 rounded-lg border bg-muted/50 p-4">
                    <XCircle className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Order Cancelled</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">This order has been cancelled.</p>
                    </div>
                </div>
            );
        case 'refunded':
            return (
                <div className="flex items-start gap-3 rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-900 dark:bg-purple-950">
                    <XCircle className="mt-0.5 size-5 shrink-0 text-purple-600 dark:text-purple-400" />
                    <div>
                        <p className="text-sm font-medium text-purple-800 dark:text-purple-200">Order Refunded</p>
                        <p className="mt-0.5 text-xs text-purple-700 dark:text-purple-300">
                            {order.refund_reason || 'This order has been refunded.'}
                        </p>
                    </div>
                </div>
            );
    }
}
