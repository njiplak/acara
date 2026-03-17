# Vertical Value Chain — Event Management Platform

## Current Stance (as of 2026-03-17)

```
 PLAN ──── MARKET ──── SELL ──── DELIVER ──── FOLLOW-UP ──── RETAIN
 ██████    ███░░░     █████     ████░░       ███░░░░░       ██░░░░
 90%       45%        95%       80%          40%            30%
```

---

## 1. PLAN — 90%

Plan, configure, and evaluate events before they go live.

| Feature | Status | Notes |
|---|---|---|
| Event CRUD | Done | Full lifecycle: draft, published |
| Catalog/session management | Done | Multi-session per event, addons |
| Dynamic pricing (date/quantity tiers) | Done | Fixed, date-based, quantity-based |
| Venue management | Done | Name, address, city, capacity, maps |
| Speaker management | Done | Profile, bio, photo, catalog assignment |
| Dashboard analytics + trends | Done | KPIs, 30-day trends, revenue chart, order breakdown |
| Needs Attention alerts | Done | Waiting orders, low-fill events, drafts |
| Top referrers + voucher performance | Done | Dashboard leaderboard and stats |
| Calendar view | Done | Monthly grid, color-coded events, fill rate |
| Event templates | Done | Save/reuse event configs, create from template |
| Event economics (per-event P&L) | Done | Revenue, fill rate, check-in rate, discounts, charts |
| Resource conflict detection | Done | Venue and speaker overlap warnings on event form |
| Recurring class schedules | Not started | Auto-generate instances from weekly template |

### What to develop next in PLAN
- **Recurring class schedules** — Define weekly templates, auto-generate events for a date range. Only needed if platform targets studios/gyms with repeating classes.

---

## 2. MARKET — 45%

Attract attendees and drive registrations.

| Feature | Status | Notes |
|---|---|---|
| Landing page + SEO settings | Done | Hero, CTA, meta tags, analytics IDs, social links |
| Custom head scripts | Done | GTM, pixel injection |
| Email/WA notifications | Not started | Order confirmation, payment reminder, event reminder (D-3, D-1) |
| Blast/campaign to past attendees | Not started | Announce new events to previous customers by segment |
| Testimonial display on public pages | Done | Highlighted testimonials on landing page (global) and event detail (per-event) |
| Waitlist for sold-out events | Not started | Sign up when session full, auto-promote on cancellation |
| Social sharing tools | Done | Share button (WhatsApp, X, Facebook, copy link), referral-enhanced URLs with ?ref= prefill |
| Early bird countdown/urgency | Done | Live countdown for date-based tiers, "X spots left" for quantity-based tiers |

### What to develop next in MARKET
1. **Email/WA notifications** — Order confirmation + event reminders. Reduces no-shows by 20-40%. Highest ROI feature in the entire platform.
2. **Waitlist management** — Capture demand for sold-out sessions. Auto-notify when spot opens.
3. **Blast/campaign system** — Re-engage past attendees when new events are published. Segment by event history.

---

## 3. SELL — 95%

Registration, payment, and discount handling.

| Feature | Status | Notes |
|---|---|---|
| Customer registration (Google OAuth) | Done | Auto-profile creation, referral code generation |
| Order placement flow | Done | Catalog + addon selection, notes |
| Payment proof upload | Done | Manual bank transfer flow |
| QRIS payment | Done | QR-based payment option |
| Invoice PDF generation | Done | Downloadable for customers and admin |
| Voucher/promo code system | Done | Fixed/percentage, date range, usage limits, stackability |
| Referral discount system | Done | Referee discount + referrer credit on confirmation |
| Referral balance usage | Done | Apply earned balance to future orders |
| Order lifecycle management | Done | Pending, waiting, confirmed, rejected, cancelled, refunded |
| Reject with reason | Done | Admin provides rejection reason |
| Refund with credit reversal | Done | Reverses referrer credit and restores balance |
| Payment gateway integration | Not started | Midtrans/Xendit for auto-confirmation |

### What to develop next in SELL
1. **Payment gateway integration** — Auto-confirm payments via Midtrans or Xendit. Eliminates the biggest operational bottleneck (manual payment review).

---

## 4. DELIVER — 80%

Event-day execution and content delivery.

| Feature | Status | Notes |
|---|---|---|
| QR code check-in | Done | Scan order code, mark checked_in_at |
| Undo check-in | Done | Reverse accidental check-ins |
| Event materials distribution | Done | Files, links, notes per event/catalog |
| Check-in gated materials | Done | Require check-in before accessing materials |
| Per-session attendance tracking | Not started | Track attendance per catalog, not just event-level |
| Certificate generation | Not started | Auto-generate PDF certificates with attendee name, event, date |
| Live announcements | Not started | Push schedule changes or room updates to checked-in attendees |

### What to develop next in DELIVER
1. **Certificate generation** — Auto-generate attendance/completion certificates (PDF). Huge perceived value for workshops, training, seminars.
2. **Per-session attendance** — Track check-in per catalog/session for multi-session events.

---

## 5. FOLLOW-UP — 40%

Post-event actions that close the loop.

| Feature | Status | Notes |
|---|---|---|
| Testimonial/feedback collection | Done | Rating + body text per order, highlight feature |
| Testimonial admin management | Done | List, highlight, manage in backoffice |
| Post-event survey (NPS, detailed) | Not started | Multi-question surveys per event or catalog |
| Certificate distribution | Not started | Auto-send certificates after event ends |
| Post-event email (thank you, recap) | Not started | Automated email with event summary, feedback link, next events |
| Recording/replay access | Done | Video embed (YouTube/Vimeo) as material type, availability window gating |
| Financial reports (exportable) | Not started | Export event economics to Excel/PDF |

### What to develop next in FOLLOW-UP
1. **Post-event email** — Auto-send thank you + feedback link + next event promo after event ends.
2. **Certificate distribution** — Auto-email certificates to checked-in attendees.
3. **Exportable financial reports** — Excel/PDF export of event economics for bookkeeping.

---

## 6. RETAIN — 30%

Turn one-time attendees into repeat customers.

| Feature | Status | Notes |
|---|---|---|
| Referral system (earn balance) | Done | Referrer gets credit when referee's order is confirmed |
| Customer order history | Done | Customers can view all past orders |
| Customer list + details (admin) | Done | View customers, their orders, delete |
| Customer segmentation/tags | Done | Auto-computed tags: frequency (new/returning/loyal), recency (active/lapsed/inactive), behavior (no-show/big-spender/referrer). Filterable on customer list. |
| Repeat attendee tracking | Done | Derived from computed tags — order count, total spend, recency, check-in rate tracked via SQL subqueries on customer list |
| Loyalty/points program | Not started | Earn points per attendance, redeem for discounts |
| Re-engagement campaigns | Not started | Targeted emails to lapsed or inactive customers |
| Customer profile (self-service) | Not started | Customers edit profile, view history, manage preferences |

### What to develop next in RETAIN
1. **Loyalty/points program** — Builds on existing referral infrastructure. Points per order, redeemable as balance.
2. **Re-engagement campaigns** — Targeted emails to lapsed or inactive customers. Now possible with tag-based filtering.
3. **Customer profile (self-service)** — Customers edit profile, view history, manage preferences.

---

## Priority Matrix

Features ranked by **impact vs effort** across all stages.

| Priority | Feature | Stage | Impact | Effort |
|---|---|---|---|---|
| 1 | Email/WA notifications | MARKET | Very High | Medium |
| 2 | Certificate generation | DELIVER | High | Medium |
| 3 | Payment gateway (Midtrans/Xendit) | SELL | High | Medium-High |
| 4 | Post-event email automation | FOLLOW-UP | High | Medium |
| ~~5~~ | ~~Customer segmentation/tags~~ | ~~RETAIN~~ | ~~Done~~ | |
| 5 | Waitlist management | MARKET | Medium | Low-Medium |
| 6 | Exportable financial reports | FOLLOW-UP | Medium | Low |
| ~~7~~ | ~~Repeat attendee tracking~~ | ~~RETAIN~~ | ~~Done~~ | |
| 7 | Blast/campaign system | MARKET | High | Medium-High |
| 8 | Per-session attendance | DELIVER | Medium | Low |
| 9 | Loyalty/points program | RETAIN | Medium | Medium |
| 10 | Recurring class schedules | PLAN | Niche | High |
| 11 | Live announcements | DELIVER | Low | Medium |
| 12 | Post-event surveys (NPS) | FOLLOW-UP | Medium | Medium |
| ~~13~~ | ~~Recording/replay access~~ | ~~FOLLOW-UP~~ | ~~Done~~ | |

---

## Overall Progress

| Stage | Progress | Feature Count | Done | Remaining |
|---|---|---|---|---|
| PLAN | 90% | 13 | 12 | 1 |
| MARKET | 45% | 8 | 5 | 3 |
| SELL | 95% | 12 | 11 | 1 |
| DELIVER | 80% | 7 | 4 | 3 |
| FOLLOW-UP | 40% | 7 | 3 | 4 |
| RETAIN | 30% | 8 | 5 | 3 |
| **TOTAL** | **~65%** | **55** | **40** | **15** |
