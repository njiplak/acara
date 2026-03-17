# Vertical Value Chain — Event Management Platform

## Current Stance (as of 2026-03-17)

```
 PLAN ──── MARKET ──── SELL ──── DELIVER ──── FOLLOW-UP ──── RETAIN
 ██████    ██████     █████     ██████       ██████         ██████
 100%      100%       95%       100%         100%           100%
```

---

## 1. PLAN — 100%

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
| Recurring class schedules | Done | Generate recurring events from template — pick days of week, date range, venue. Bulk-creates draft events with date suffix in name |

---

## 2. MARKET — 100%

Attract attendees and drive registrations.

| Feature | Status | Notes |
|---|---|---|
| Landing page + SEO settings | Done | Hero, CTA, meta tags, analytics IDs, social links |
| Custom head scripts | Done | GTM, pixel injection |
| Email notifications | Done | Order placed, payment confirmed, order rejected, event reminder (D-3, D-1) via queued mail templates |
| Blast/campaign to past attendees | Done | Tag-based audience targeting, live preview count, mail template selection, send-once with audit trail |
| Testimonial display on public pages | Done | Highlighted testimonials on landing page (global) and event detail (per-event) |
| Waitlist for sold-out events | Done | Join/leave waitlist on event page, auto-notify all waitlisted on cancel/refund (first come first served), waitlist count visible |
| Social sharing tools | Done | Share button (WhatsApp, X, Facebook, copy link), referral-enhanced URLs with ?ref= prefill |
| Early bird countdown/urgency | Done | Live countdown for date-based tiers, "X spots left" for quantity-based tiers |


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

## 4. DELIVER — 100%

Event-day execution and content delivery.

| Feature | Status | Notes |
|---|---|---|
| QR code check-in | Done | Scan order code, mark checked_in_at |
| Undo check-in | Done | Reverse accidental check-ins |
| Event materials distribution | Done | Files, links, notes per event/catalog |
| Check-in gated materials | Done | Require check-in before accessing materials |
| Per-session attendance tracking | Done | Track attendance per schedule item via session_attendances table, scanner supports session selection, auto-sets order checked_in_at on first session |
| Certificate generation | Done | Admin uploads .docx template with placeholders (via PHPWord), auto-converts to landscape A4 PDF. Falls back to default Blade template. Download from order detail (check-in gated) |
| Live announcements | Done | Email-based announcements to checked-in attendees, admin picks event + writes message, live recipient count, audit trail |


---

## 5. FOLLOW-UP — 100%

Post-event actions that close the loop.

| Feature | Status | Notes |
|---|---|---|
| Testimonial/feedback collection | Done | Rating + body text per order, highlight feature |
| Testimonial admin management | Done | List, highlight, manage in backoffice |
| Post-event survey (NPS, detailed) | Done | Flexible question builder (NPS/rating/MCQ/text), customer portal fill, admin results dashboard with NPS gauge, auto-email day after event |
| Certificate distribution | Done | Auto-email certificate download link day after event via scheduled command (daily 11:00) |
| Post-event email (thank you, recap) | Done | Auto-sent to checked-in attendees day after event ends via scheduled command |
| Recording/replay access | Done | Video embed (YouTube/Vimeo) as material type, availability window gating |
| Financial reports (exportable) | Done | Excel export from event economics (summary + orders) and order list page |

### Future enhancements for FOLLOW-UP
- **Post-event survey enhancements** — Consider adding survey templates for reuse across events.

---

## 6. RETAIN — 100%

Turn one-time attendees into repeat customers.

| Feature | Status | Notes |
|---|---|---|
| Referral system (earn balance) | Done | Referrer gets credit when referee's order is confirmed |
| Customer order history | Done | Customers can view all past orders |
| Customer list + details (admin) | Done | View customers, their orders, delete |
| Customer segmentation/tags | Done | Auto-computed tags: frequency (new/returning/loyal), recency (active/lapsed/inactive), behavior (no-show/big-spender/referrer). Filterable on customer list. |
| Repeat attendee tracking | Done | Derived from computed tags — order count, total spend, recency, check-in rate tracked via SQL subqueries on customer list |
| Loyalty/points program | Done | Attendance reward (Rp 1,000 credit on check-in), builds on existing referral balance system, configurable via LOYALTY_ATTENDANCE_CREDIT env |
| Re-engagement campaigns | Done | Tag-based targeting (OR logic), live preview count, mail template integration, chunked sending, campaign audit trail |
| Customer profile (self-service) | Done | Edit name, view order stats, referral info, total spend, events attended, quick links to orders |

---

## Priority Matrix

Features ranked by **impact vs effort** across all stages.

| Priority | Feature | Stage | Impact | Effort |
|---|---|---|---|---|
| ~~1~~ | ~~Email notifications~~ | ~~MARKET~~ | ~~Done~~ | |
| ~~2~~ | ~~Certificate generation~~ | ~~DELIVER~~ | ~~Done~~ | |
| 3 | Payment gateway (Midtrans/Xendit) | SELL | High | Medium-High |
| ~~4~~ | ~~Post-event email automation~~ | ~~FOLLOW-UP~~ | ~~Done~~ | |
| ~~5~~ | ~~Customer segmentation/tags~~ | ~~RETAIN~~ | ~~Done~~ | |
| ~~5~~ | ~~Waitlist management~~ | ~~MARKET~~ | ~~Done~~ | |
| ~~6~~ | ~~Exportable financial reports~~ | ~~FOLLOW-UP~~ | ~~Done~~ | |
| ~~7~~ | ~~Repeat attendee tracking~~ | ~~RETAIN~~ | ~~Done~~ | |
| ~~7~~ | ~~Blast/campaign system~~ | ~~MARKET~~ | ~~Done~~ | |
| ~~8~~ | ~~Per-session attendance~~ | ~~DELIVER~~ | ~~Done~~ | |
| ~~9~~ | ~~Loyalty/points program~~ | ~~RETAIN~~ | ~~Done~~ | |
| ~~10~~ | ~~Recurring class schedules~~ | ~~PLAN~~ | ~~Done~~ | |
| ~~11~~ | ~~Live announcements~~ | ~~DELIVER~~ | ~~Done~~ | |
| ~~12~~ | ~~Post-event surveys (NPS)~~ | ~~FOLLOW-UP~~ | ~~Done~~ | |
| ~~13~~ | ~~Recording/replay access~~ | ~~FOLLOW-UP~~ | ~~Done~~ | |

---

## Overall Progress

| Stage | Progress | Feature Count | Done | Remaining |
|---|---|---|---|---|
| PLAN | 100% | 13 | 13 | 0 |
| MARKET | 100% | 8 | 8 | 0 |
| SELL | 95% | 12 | 11 | 1 |
| DELIVER | 100% | 7 | 7 | 0 |
| FOLLOW-UP | 100% | 7 | 7 | 0 |
| RETAIN | 100% | 8 | 8 | 0 |
| **TOTAL** | **~98%** | **55** | **54** | **1** |
