# Acara - Project Overview

## Purpose
Acara is an event management platform. It handles events, orders, customers, payments, surveys, campaigns, vouchers, speakers, venues, landing pages, blogs/articles, mail templates, and more.

## Tech Stack
- **Backend**: Laravel 12 (PHP 8.2+), SQLite database
- **Frontend**: React 19 + TypeScript, Inertia.js v2 (SPA bridge)
- **Styling**: Tailwind CSS v4, shadcn/ui (Radix UI primitives), tw-animate-css
- **Rich Text**: TipTap editor
- **Tables**: TanStack React Table
- **Charts**: Recharts
- **Build**: Vite 7, Laravel Vite Plugin
- **Package Manager**: bun (bun.lock present)
- **SSR**: Optional Inertia SSR support

## Key Packages
- **spatie/laravel-permission**: Role-based access control
- **spatie/laravel-medialibrary**: File/media management
- **spatie/laravel-query-builder**: API query building
- **laravel/socialite**: Social authentication
- **barryvdh/laravel-dompdf**: PDF generation
- **maatwebsite/excel**: Excel import/export
- **phpoffice/phpword**: Word document generation
- **stripe/stripe-php** & **xendit/xendit-php**: Payment gateways
- **laravel/wayfinder**: Type-safe route generation for Inertia

## Project Structure
```
app/
  Http/Controllers/    # Auth, Master, Operational, Setting, Customer, Webhook
  Models/              # ~28 models (Event, Order, Customer, Payment, etc.)
  Filters/             # Query filters
  Service/             # Service layer
  Mail/                # Mail classes
  Jobs/                # Queue jobs
  Exports/             # Excel exports
  Utils/               # Utility classes
resources/js/
  pages/               # Inertia pages (auth, blog, master, operational, setting, events, customer)
  components/          # React components (shadcn/ui based)
  layouts/             # Layout components
  hooks/               # Custom React hooks
  actions/             # Frontend actions
  lib/                 # Utility libraries
  types/               # TypeScript type definitions
  wayfinder/           # Auto-generated route helpers
routes/
  web.php              # Main routes file
  web/                 # Route partials
  api/                 # API routes
database/
  migrations/          # Database migrations
  seeders/             # Database seeders
  factories/           # Model factories
```
