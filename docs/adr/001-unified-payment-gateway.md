# ADR-001: Unified Payment Gateway Integration

**Status:** Proposed
**Date:** 2026-03-17
**Deciders:** Engineering team
**Context area:** SELL — Payment processing

---

## Context

The platform currently supports only **manual payment** (bank transfer + admin reviews uploaded proof). This creates an operational bottleneck — every order requires human review before confirmation. As the platform scales across events, manual review becomes unsustainable.

Additionally, the platform needs to serve both **Indonesian customers** (who expect local methods like VA, QRIS, e-wallets, convenience store) and **international customers** (who expect card payments, Apple Pay, Google Pay). No single gateway covers all needs optimally, so we need a **unified abstraction** that supports multiple providers.

### Current payment flow

```
Customer places order → uploads bank transfer proof → admin reviews image → confirm/reject
```

### Desired payment flow

```
Customer places order → selects payment method → redirected to gateway / shown payment instructions
→ gateway sends webhook on payment → system auto-confirms order → customer notified
```

### Constraints

- Must coexist with the existing manual payment flow (not all events will use gateways)
- Must fit the existing Service-Contract pattern (`app/Contract/` + `app/Service/`)
- Payment gateway is configured **per-event** (event organizer chooses)
- Must handle IDR (no decimals) and foreign currencies (with decimals)
- Must be auditable — every payment attempt and webhook must be logged

---

## Decision

### Gateway Strategy: Adapter Pattern with a Unified Contract

Implement a `PaymentGatewayContract` interface with provider-specific adapters. Each adapter wraps a single payment provider's SDK. A `PaymentGatewayManager` (factory) resolves the correct adapter based on event configuration.

```
PaymentGatewayContract (interface)
├── MidtransGateway    — Indonesian market (VA, QRIS, GoPay, ShopeePay, Indomaret)
├── XenditGateway      — Indonesian market (VA, QRIS, e-wallets, cards)
├── StripeGateway      — International (cards, Apple Pay, Google Pay, SEPA, iDEAL)
└── ManualGateway      — Existing flow (bank transfer + proof upload)
```

### Provider Selection Rationale

| Provider | Market | Why |
|----------|--------|-----|
| **Midtrans** | Indonesia | Widest local method coverage, Tokopedia/GoTo ecosystem, competitive fees for VA/QRIS |
| **Xendit** | Indonesia + SEA | Strong API/DX, good for cards + disbursements, growing SEA presence |
| **Stripe** | International | Global standard, 135+ currencies, best international card coverage, rich ecosystem |
| **Manual** | Fallback | Retain existing flow for organizers who prefer bank transfer |

> **Start with one Indonesian gateway (Midtrans or Xendit) + Stripe.** Adding the second Indonesian provider later is trivial with the adapter pattern. Recommend starting with **Xendit + Stripe** — Xendit has a cleaner API, better developer experience, and covers both local methods and cards for Indonesia.

### Architecture

#### 1. New Database Tables

**`payment_transactions`** — Immutable log of every payment attempt/event.

| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | PK |
| `order_id` | bigint FK | Related order |
| `gateway` | enum | `xendit`, `midtrans`, `stripe`, `manual` |
| `gateway_transaction_id` | string nullable | Provider's transaction/charge ID |
| `gateway_reference` | string nullable | External reference (VA number, payment link, etc.) |
| `method` | string nullable | `virtual_account`, `qris`, `ewallet`, `card`, `bank_transfer`, etc. |
| `currency` | char(3) | ISO 4217 (`IDR`, `USD`, `SGD`, etc.) |
| `amount` | bigint unsigned | Amount in smallest unit (cents/rupiah) |
| `gateway_fee` | int unsigned nullable | Fee charged by provider |
| `status` | enum | `pending`, `paid`, `failed`, `expired`, `refunded`, `partial_refund` |
| `raw_payload` | json nullable | Full webhook/response payload for audit |
| `paid_at` | timestamp nullable | When payment was confirmed by gateway |
| `expires_at` | timestamp nullable | Payment link/VA expiry |
| `metadata` | json nullable | Flexible key-value (e.g., VA bank, ewallet type) |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

**`payment_refunds`** — Track refund requests separately (a transaction can have multiple partial refunds).

| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | PK |
| `payment_transaction_id` | bigint FK | Parent transaction |
| `gateway_refund_id` | string nullable | Provider's refund ID |
| `amount` | bigint unsigned | Refund amount |
| `reason` | string nullable | |
| `status` | enum | `pending`, `completed`, `failed` |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

#### 2. Event Configuration

Extend the `events` table:

```php
$table->enum('payment_gateway', ['manual', 'xendit', 'midtrans', 'stripe'])->default('manual');
$table->string('currency', 3)->default('IDR');
```

The existing `payment_method` enum (`manual`, `qris`) will be **replaced** by the richer `payment_gateway` column. The specific payment methods (VA, QRIS, cards) are determined by the gateway, not the event config.

#### 3. Contract Interface

```php
namespace App\Contract\Payment;

interface PaymentGatewayContract
{
    /**
     * Create a payment charge/transaction for the given order.
     * Returns a PaymentResult with redirect URL or payment instructions.
     */
    public function createCharge(Order $order, array $options = []): PaymentResult;

    /**
     * Verify and process an incoming webhook payload.
     * Returns parsed WebhookResult with status and transaction details.
     */
    public function handleWebhook(Request $request): WebhookResult;

    /**
     * Issue a full or partial refund for a completed transaction.
     */
    public function refund(PaymentTransaction $transaction, int $amount, ?string $reason = null): RefundResult;

    /**
     * Check the current status of a transaction directly with the gateway.
     * Used for reconciliation and status polling fallback.
     */
    public function getStatus(PaymentTransaction $transaction): TransactionStatus;

    /**
     * Get the list of payment methods available for this gateway.
     */
    public function availableMethods(): array;
}
```

#### 4. Value Objects

```php
class PaymentResult {
    public string $gatewayTransactionId;
    public string $status;             // 'pending', 'paid', 'failed'
    public ?string $redirectUrl;       // For hosted checkout (Stripe Checkout, Xendit Invoice)
    public ?string $paymentReference;  // VA number, QR code URL, etc.
    public ?Carbon $expiresAt;
    public array $rawPayload;
}

class WebhookResult {
    public string $gatewayTransactionId;
    public string $status;             // 'paid', 'failed', 'expired'
    public ?int $amount;
    public ?string $method;
    public array $rawPayload;
}

class RefundResult {
    public string $gatewayRefundId;
    public string $status;             // 'pending', 'completed', 'failed'
    public int $amount;
}

class TransactionStatus {
    public string $status;
    public ?Carbon $paidAt;
    public ?string $method;
    public array $rawPayload;
}
```

#### 5. Gateway Manager (Factory)

```php
namespace App\Service\Payment;

class PaymentGatewayManager
{
    public function resolve(string $gateway): PaymentGatewayContract
    {
        return match ($gateway) {
            'xendit'   => app(XenditGateway::class),
            'midtrans' => app(MidtransGateway::class),
            'stripe'   => app(StripeGateway::class),
            'manual'   => app(ManualGateway::class),
            default    => throw new \InvalidArgumentException("Unknown gateway: {$gateway}"),
        };
    }

    public function for(Event $event): PaymentGatewayContract
    {
        return $this->resolve($event->payment_gateway);
    }
}
```

#### 6. Webhook Handling

Each gateway gets a dedicated webhook route:

```php
// routes/web/webhook.php (no auth middleware, but signature verification)
Route::post('/webhooks/xendit', [WebhookController::class, 'xendit']);
Route::post('/webhooks/midtrans', [WebhookController::class, 'midtrans']);
Route::post('/webhooks/stripe', [WebhookController::class, 'stripe']);
```

Webhook processing:

1. **Verify signature** — Each gateway adapter verifies the webhook authenticity (Xendit callback token, Midtrans signature key, Stripe webhook secret).
2. **Parse payload** — Extract transaction ID, status, amount.
3. **Idempotency** — Check if transaction already processed (by `gateway_transaction_id`). Skip if already in terminal state.
4. **Update transaction** — Write to `payment_transactions`.
5. **Update order** — If payment is successful, auto-confirm the order (reuse existing `OrderService::confirmOrder()` logic).
6. **Log raw payload** — Store full webhook body in `raw_payload` for debugging/auditing.

**Webhook security:**
- Verify signatures using provider-specific methods
- Return 200 OK quickly (process asynchronously via queued job if needed)
- Idempotent — safe to receive the same webhook multiple times
- IP allowlisting optional but recommended for production

#### 7. Updated Order Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ CUSTOMER PLACES ORDER                                           │
│ OrderService::placeOrder()                                      │
│ → Order created with status: pending_payment                    │
└──────────────────────────┬──────────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
         Manual Gateway            Auto Gateway (Xendit/Midtrans/Stripe)
              │                         │
              ▼                         ▼
    Show bank details         PaymentGateway::createCharge()
    Upload proof flow         → Create PaymentTransaction (pending)
              │               → Redirect to checkout / show VA / show QR
              ▼                         │
    Admin confirms                      ▼
              │               Gateway webhook received
              ▼               → Verify signature
    Order: confirmed          → Update PaymentTransaction (paid)
                              → Auto-confirm order
                              → Send confirmation email
                                        │
                                        ▼
                              Order: confirmed
```

#### 8. Environment Configuration

```env
# Xendit
XENDIT_SECRET_KEY=
XENDIT_PUBLIC_KEY=
XENDIT_WEBHOOK_TOKEN=

# Midtrans
MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
MIDTRANS_IS_PRODUCTION=false

# Stripe
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# General
PAYMENT_DEFAULT_GATEWAY=manual
PAYMENT_EXPIRY_HOURS=24
```

```php
// config/payment.php
return [
    'default' => env('PAYMENT_DEFAULT_GATEWAY', 'manual'),
    'expiry_hours' => env('PAYMENT_EXPIRY_HOURS', 24),

    'xendit' => [
        'secret_key' => env('XENDIT_SECRET_KEY'),
        'public_key' => env('XENDIT_PUBLIC_KEY'),
        'webhook_token' => env('XENDIT_WEBHOOK_TOKEN'),
    ],

    'midtrans' => [
        'server_key' => env('MIDTRANS_SERVER_KEY'),
        'client_key' => env('MIDTRANS_CLIENT_KEY'),
        'is_production' => env('MIDTRANS_IS_PRODUCTION', false),
    ],

    'stripe' => [
        'secret_key' => env('STRIPE_SECRET_KEY'),
        'publishable_key' => env('STRIPE_PUBLISHABLE_KEY'),
        'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
    ],
];
```

#### 9. Directory Structure

```
app/
├── Contract/
│   └── Payment/
│       └── PaymentGatewayContract.php
├── Service/
│   └── Payment/
│       ├── PaymentGatewayManager.php
│       ├── PaymentService.php          # Orchestrates charge, webhook, refund
│       ├── Gateway/
│       │   ├── ManualGateway.php
│       │   ├── XenditGateway.php
│       │   ├── MidtransGateway.php
│       │   └── StripeGateway.php
│       └── DTO/
│           ├── PaymentResult.php
│           ├── WebhookResult.php
│           ├── RefundResult.php
│           └── TransactionStatus.php
├── Models/
│   ├── PaymentTransaction.php
│   └── PaymentRefund.php
├── Http/
│   └── Controllers/
│       └── Webhook/
│           └── PaymentWebhookController.php
├── Jobs/
│   └── ProcessPaymentWebhook.php       # Queued webhook processing
└── Events/
    ├── PaymentReceived.php
    └── PaymentFailed.php
```

---

## Consequences

### Positive

- **Eliminates manual bottleneck** — Orders auto-confirm on successful payment, no admin intervention needed.
- **Provider-agnostic** — Adding a new gateway means implementing one interface. No changes to order logic.
- **Coexists with manual flow** — `ManualGateway` adapter wraps the existing proof-upload flow, so nothing breaks.
- **Audit trail** — Every payment attempt, webhook, and refund is logged with raw payloads.
- **Multi-currency ready** — `currency` column + amount-in-smallest-unit convention supports IDR (no decimals) and USD/SGD/EUR (cents).
- **Refund via gateway** — Can issue refunds programmatically instead of manual bank transfer.

### Negative

- **Operational complexity** — Must monitor webhook delivery, handle retries, reconcile failed webhooks.
- **Provider fees** — Each gateway charges per-transaction fees (Xendit ~0.7–4%, Stripe 2.9%+30¢ intl). Must account for this in event pricing.
- **Credential management** — Multiple API keys per environment. Need secure secrets management.
- **Testing complexity** — Need sandbox/test environments for each provider. Webhook testing requires tunneling (ngrok) in local dev.

### Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Webhook delivery failure | Implement status polling fallback (`getStatus()`). Run reconciliation job every 15 min for pending transactions older than configured threshold. |
| Double-processing webhooks | Idempotent handler — check transaction status before processing. Use database unique constraint on `gateway_transaction_id`. |
| Gateway downtime | Show manual payment as fallback. Alert on repeated gateway errors. |
| Currency mismatch | Validate currency matches event config before creating charge. |
| Partial payments | Not supported in v1. Full amount only. Can revisit if needed. |

---

## Implementation Plan

### Phase 1 — Foundation (Week 1–2)

1. Create `payment_transactions` and `payment_refunds` migrations
2. Create models: `PaymentTransaction`, `PaymentRefund`
3. Define `PaymentGatewayContract` interface and DTOs
4. Implement `PaymentGatewayManager` factory
5. Implement `ManualGateway` adapter (wraps existing flow)
6. Add `payment_gateway` and `currency` columns to events table
7. Refactor `OrderService` to use `PaymentGatewayManager` instead of hardcoded manual logic
8. Update admin event form to select payment gateway

### Phase 2 — First Gateway: Xendit (Week 3–4)

1. Install Xendit PHP SDK
2. Implement `XenditGateway` adapter (Invoice API for multi-method checkout)
3. Build webhook endpoint with signature verification
4. Implement `ProcessPaymentWebhook` job
5. Build customer-facing payment page (redirect to Xendit Invoice or display VA/QR)
6. Auto-confirm order on successful webhook
7. Implement Xendit refund via API
8. Test with sandbox environment

### Phase 3 — Stripe (Week 5–6)

1. Install Stripe PHP SDK
2. Implement `StripeGateway` adapter (Checkout Sessions API)
3. Build Stripe webhook endpoint with signature verification
4. Handle Stripe-specific flows (3D Secure, SCA)
5. Multi-currency support (event currency → Stripe charge currency)
6. Implement Stripe refund via API
7. Test with Stripe test mode

### Phase 4 — Hardening (Week 7)

1. Reconciliation job — poll gateway for stale pending transactions
2. Admin payment dashboard — transaction logs, gateway status, fee tracking
3. Payment expiry handling — auto-cancel orders with expired payments
4. Retry/error handling for transient gateway failures
5. Customer-facing payment status page (real-time status polling)
6. E2E testing with sandbox environments

### Phase 5 — Optional: Midtrans (Later)

1. Implement `MidtransGateway` adapter (Snap API)
2. Webhook endpoint with signature verification
3. Testing with Midtrans sandbox

---

## Alternatives Considered

### 1. Single gateway only (just Xendit or just Stripe)

**Rejected.** Xendit alone doesn't cover international cards well. Stripe alone has limited Indonesian local payment method coverage and higher fees for IDR transactions. A unified abstraction costs minimal extra effort and future-proofs the system.

### 2. Payment aggregator (e.g., Durianpay, Payrequest)

**Rejected.** Adds another intermediary layer with additional fees. The adapter pattern gives us direct provider relationships, better fee negotiation, and full control over the checkout experience.

### 3. Laravel Cashier

**Rejected.** Laravel Cashier is designed for subscription billing (SaaS). Our use case is one-time event ticket payments with varying amounts, multiple payment methods, and multi-gateway support. Cashier would be a poor fit.

### 4. Build webhook-less (polling only)

**Rejected.** Polling introduces delays (orders stay pending until next poll cycle) and wastes API quota. Webhooks provide real-time confirmation. We use polling only as a fallback for missed webhooks.

---

## References

- [Xendit API Docs](https://developers.xendit.co/)
- [Midtrans API Docs](https://docs.midtrans.com/)
- [Stripe API Docs](https://docs.stripe.com/)
- Current order flow: `app/Service/Operational/OrderService.php`
- Current order model: `app/Models/Order.php`
