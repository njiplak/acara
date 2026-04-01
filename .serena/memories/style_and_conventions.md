# Code Style & Conventions

## PHP (Backend)
- **Style**: Laravel Pint with `laravel` preset (PSR-12 based)
- **Naming**: PSR-4 autoloading, standard Laravel conventions
  - Models: PascalCase singular (e.g., `Event`, `PaymentTransaction`)
  - Controllers: PascalCase with `Controller` suffix
  - Organized in subdirectories: Auth, Master, Operational, Setting, Customer, Webhook
- **Testing**: Pest v4 (not PHPUnit directly)
- **Architecture**: Service layer pattern (`app/Service/`), Filters (`app/Filters/`), Form Requests (`app/Http/Requests/`)

## TypeScript/React (Frontend)
- **TypeScript**: Strict mode, `noImplicitAny: false`, ESNext target, bundler module resolution
- **React**: v19, JSX runtime (no manual React imports needed)
- **Imports**: Enforced `type` imports via `@typescript-eslint/consistent-type-imports`
- **Path alias**: `@/*` maps to `resources/js/*`
- **ESLint**: Flat config, includes React, React Hooks, TypeScript, Import plugins + Prettier compat
- **Prettier**: With Tailwind CSS plugin for class sorting
- **Components**: shadcn/ui pattern (Radix UI + CVA + tailwind-merge + clsx)
- **Tailwind**: v4, never use arbitrary values like `[44px]` — use standard utilities only

## General
- Inertia.js pages follow directory-based organization matching controller structure
- Laravel Wayfinder generates type-safe route helpers in `resources/js/wayfinder/`
