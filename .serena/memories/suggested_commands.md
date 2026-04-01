# Suggested Commands

## Development
```bash
composer dev              # Start all services (server, queue, logs, vite) concurrently
composer dev:ssr          # Start with SSR support
php artisan serve         # Laravel dev server only
bun run dev               # Vite dev server only
```

## Building
```bash
bun run build             # Build frontend assets
bun run build:ssr         # Build with SSR
```

## Testing
```bash
composer test             # Run linting + tests (Pest)
php artisan test          # Run Pest tests only
composer test:lint        # Check PHP code style (Pint, dry-run)
```

## Linting & Formatting
```bash
composer lint             # Fix PHP code style (Laravel Pint, parallel)
bun run lint              # Fix JS/TS code style (ESLint)
bun run format            # Format frontend files (Prettier)
bun run format:check      # Check frontend formatting
bun run types             # TypeScript type checking (tsc --noEmit)
```

## Laravel Artisan (common)
```bash
php artisan migrate       # Run database migrations
php artisan make:model    # Generate a model
php artisan make:controller # Generate a controller
php artisan tinker        # Interactive REPL
php artisan queue:listen  # Process queued jobs
```

## Dependencies
```bash
composer install          # Install PHP dependencies
bun install               # Install JS dependencies
```

## System Utilities (macOS/Darwin)
```bash
git, ls, cd, grep, find   # Standard Unix utilities
```

## Note on RTK
The project has RTK (Rust Token Killer) configured. When running shell commands in Claude Code, prefix with `rtk` for token-optimized output (see CLAUDE.md).
