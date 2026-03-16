import { useEffect, useRef, useState } from 'react';
import { CheckCircle, ScanLine, XCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';

type ScanResult = {
    success: boolean;
    message: string;
    order?: {
        order_code: string;
        customer?: { name: string; email: string; avatar: string | null };
        event?: { name: string };
        catalog?: { name: string };
    };
};

export default function CheckInScanner() {
    const [manualCode, setManualCode] = useState('');
    const [scanning, setScanning] = useState(false);
    const [result, setResult] = useState<ScanResult | null>(null);
    const [cameraActive, setCameraActive] = useState(false);
    const scannerRef = useRef<any>(null);

    const handleScan = async (orderCode: string) => {
        if (scanning || !orderCode.trim()) return;
        setScanning(true);
        setResult(null);

        try {
            const csrfToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;
            const res = await fetch('/operational/check-in/scan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ order_code: orderCode.trim() }),
            });

            const data = await res.json();
            setResult(data);
        } catch {
            setResult({ success: false, message: 'Network error. Please try again.' });
        } finally {
            setScanning(false);
        }
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleScan(manualCode);
        setManualCode('');
    };

    const startCamera = async () => {
        try {
            const { Html5Qrcode } = await import('html5-qrcode');
            const scanner = new Html5Qrcode('qr-reader');
            scannerRef.current = scanner;

            await scanner.start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                (decodedText) => {
                    handleScan(decodedText);
                },
                () => {},
            );
            setCameraActive(true);
        } catch {
            setResult({ success: false, message: 'Could not access camera. Use manual entry instead.' });
        }
    };

    const stopCamera = async () => {
        if (scannerRef.current) {
            try {
                await scannerRef.current.stop();
                scannerRef.current.clear();
            } catch {
                // ignore
            }
            scannerRef.current = null;
        }
        setCameraActive(false);
    };

    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                scannerRef.current.stop().catch(() => {});
            }
        };
    }, []);

    return (
        <div className="mx-auto max-w-lg space-y-6">
            <div>
                <h1 className="text-xl font-semibold">Check-in Scanner</h1>
                <p className="text-sm text-muted-foreground">Scan QR codes or enter order codes to check in attendees</p>
            </div>

            {/* Camera scanner */}
            <div className="rounded-lg border bg-card p-5">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold">QR Scanner</h2>
                    <Button
                        variant={cameraActive ? 'destructive' : 'default'}
                        size="sm"
                        onClick={cameraActive ? stopCamera : startCamera}
                        className="gap-2"
                    >
                        <ScanLine className="size-4" />
                        {cameraActive ? 'Stop Camera' : 'Start Camera'}
                    </Button>
                </div>
                <div id="qr-reader" className="overflow-hidden rounded-md" />
            </div>

            {/* Manual entry */}
            <div className="rounded-lg border bg-card p-5">
                <h2 className="mb-3 text-sm font-semibold">Manual Entry</h2>
                <form onSubmit={handleManualSubmit} className="flex gap-2">
                    <Input
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                        placeholder="e.g. ORD-20260316-A1B2"
                        className="font-mono"
                    />
                    <Button type="submit" disabled={scanning || !manualCode.trim()}>
                        {scanning ? 'Checking...' : 'Check In'}
                    </Button>
                </form>
            </div>

            {/* Result */}
            {result && (
                <div className={`rounded-lg border p-5 ${
                    result.success
                        ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950'
                        : 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950'
                }`}>
                    <div className="flex items-start gap-3">
                        {result.success ? (
                            <CheckCircle className="mt-0.5 size-5 shrink-0 text-green-600 dark:text-green-400" />
                        ) : (
                            <XCircle className="mt-0.5 size-5 shrink-0 text-red-600 dark:text-red-400" />
                        )}
                        <div className="flex-1">
                            <p className={`text-sm font-medium ${
                                result.success
                                    ? 'text-green-800 dark:text-green-200'
                                    : 'text-red-800 dark:text-red-200'
                            }`}>
                                {result.message}
                            </p>
                            {result.order && (
                                <div className="mt-2 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="font-mono">{result.order.order_code}</Badge>
                                    </div>
                                    {result.order.customer && (
                                        <div className="flex items-center gap-2">
                                            {result.order.customer.avatar ? (
                                                <img src={result.order.customer.avatar} alt="" className="size-6 rounded-full" />
                                            ) : (
                                                <div className="flex size-6 items-center justify-center rounded-full bg-white/50 text-xs font-medium">
                                                    {result.order.customer.name.charAt(0)}
                                                </div>
                                            )}
                                            <span className="text-sm font-medium">{result.order.customer.name}</span>
                                        </div>
                                    )}
                                    {result.order.event && (
                                        <p className="text-xs text-muted-foreground">{result.order.event.name}</p>
                                    )}
                                    {result.order.catalog && (
                                        <p className="text-xs text-muted-foreground">Session: {result.order.catalog.name}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

CheckInScanner.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
