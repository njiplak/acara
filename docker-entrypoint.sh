#!/bin/sh
set -e

# Discover packages (regenerates bootstrap/cache/packages.php for production)
php artisan package:discover --ansi

# Run migrations if database exists
php artisan migrate --force 2>/dev/null || true

# Cache config and routes
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Link storage
php artisan storage:link 2>/dev/null || true

# Start FrankenPHP with Octane workers
exec php artisan octane:frankenphp --host=0.0.0.0 --port=80 --max-requests=1000
