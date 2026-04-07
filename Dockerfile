# ==============================================================================
# Stage 1: Build frontend assets
# ==============================================================================
FROM node:22-alpine AS frontend

WORKDIR /app

COPY package.json bun.lock* ./
RUN npm install -g bun && bun install --frozen-lockfile

COPY resources/ resources/
COPY vite.config.ts tsconfig.json tailwind.config.* postcss.config.* ./
COPY public/ public/

ENV DOCKER_BUILD=1
RUN bun run build


# ==============================================================================
# Stage 2: Install PHP dependencies
# ==============================================================================
FROM composer:2 AS composer

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-scripts \
    --no-autoloader \
    --prefer-dist \
    --ignore-platform-reqs

COPY . .
RUN composer dump-autoload --optimize --classmap-authoritative --no-dev


# ==============================================================================
# Stage 3: Compile PHP to opcache binary cache (strip source)
# ==============================================================================
FROM dunglas/frankenphp:1-php8.4-alpine AS compiler

RUN install-php-extensions \
    bcmath \
    gd \
    intl \
    pdo_mysql \
    pdo_pgsql \
    pdo_sqlite \
    zip \
    exif \
    pcntl \
    mbstring \
    xml \
    curl \
    sqlite3 \
    opcache

WORKDIR /app

# Copy full app for compilation
COPY --from=composer /app/vendor vendor/
COPY --from=frontend /app/public/build public/build/
COPY app/ app/
COPY bootstrap/ bootstrap/
COPY config/ config/
COPY database/ database/
COPY public/ public/
COPY resources/views/ resources/views/
COPY routes/ routes/
COPY storage/ storage/
COPY artisan artisan
COPY composer.json composer.json

# Pre-compile all PHP files to opcache binary
RUN mkdir -p /opcache \
    && php -d opcache.enable_cli=1 \
           -d opcache.file_cache=/opcache \
           -d opcache.file_cache_only=1 \
           -d opcache.validate_timestamps=0 \
           -r " \
    \$dir = new RecursiveDirectoryIterator('/app', RecursiveDirectoryIterator::SKIP_DOTS); \
    \$it  = new RecursiveIteratorIterator(\$dir); \
    \$count = 0; \
    foreach (\$it as \$file) { \
        if (\$file->getExtension() === 'php') { \
            try { opcache_compile_file(\$file->getRealPath()); \$count++; } \
            catch (Throwable \$e) {} \
        } \
    } \
    echo \"Compiled \$count files\n\"; \
"

# Obfuscate PHP source files: replace contents with opcache-only stubs
# This keeps file paths intact (Laravel needs them) but removes readable code
RUN find /app/app /app/routes /app/config /app/bootstrap -name '*.php' -exec sh -c ' \
    for f; do \
        echo "<?php /* compiled */ require __FILE__;" > "$f"; \
    done' _ {} +

# Keep vendor autoload functional but strip vendor source
RUN find /app/vendor -name '*.php' \
    ! -path '*/autoload.php' \
    ! -path '*/composer/*' \
    ! -path '*/autoload_*.php' \
    -exec sh -c ' \
    for f; do \
        echo "<?php /* compiled */ require __FILE__;" > "$f"; \
    done' _ {} +


# ==============================================================================
# Stage 4: Final production image (clean, no source)
# ==============================================================================
FROM dunglas/frankenphp:1-php8.4-alpine

RUN install-php-extensions \
    bcmath \
    gd \
    intl \
    pdo_mysql \
    pdo_pgsql \
    pdo_sqlite \
    zip \
    exif \
    pcntl \
    mbstring \
    xml \
    curl \
    sqlite3 \
    opcache

WORKDIR /app

# Copy compiled app (stubbed PHP files, no readable source)
COPY --from=compiler /app/ /app/

# Copy opcache binary cache
COPY --from=compiler /opcache /opcache

# Copy Caddyfile
COPY Caddyfile /etc/caddy/Caddyfile

# Set permissions
RUN mkdir -p storage/framework/{cache,sessions,testing,views} \
    && mkdir -p storage/logs \
    && mkdir -p storage/app/public \
    && mkdir -p bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# PHP production config: use opcache file cache, no source needed
RUN echo '[opcache]' > /usr/local/etc/php/conf.d/opcache-prod.ini \
    && echo 'opcache.enable=1' >> /usr/local/etc/php/conf.d/opcache-prod.ini \
    && echo 'opcache.enable_cli=1' >> /usr/local/etc/php/conf.d/opcache-prod.ini \
    && echo 'opcache.file_cache=/opcache' >> /usr/local/etc/php/conf.d/opcache-prod.ini \
    && echo 'opcache.file_cache_only=1' >> /usr/local/etc/php/conf.d/opcache-prod.ini \
    && echo 'opcache.validate_timestamps=0' >> /usr/local/etc/php/conf.d/opcache-prod.ini \
    && echo 'opcache.max_accelerated_files=20000' >> /usr/local/etc/php/conf.d/opcache-prod.ini \
    && echo 'opcache.memory_consumption=256' >> /usr/local/etc/php/conf.d/opcache-prod.ini \
    && echo 'opcache.interned_strings_buffer=16' >> /usr/local/etc/php/conf.d/opcache-prod.ini

# Environment
ENV APP_ENV=production
ENV APP_DEBUG=false
ENV LOG_CHANNEL=stderr

# Expose port
EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost/up || exit 1

# Entrypoint: run migrations then start server
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]
