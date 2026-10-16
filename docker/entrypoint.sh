#!/bin/sh
set -e

echo "==> Starting Lupon entrypoint script..."

# Ensure required storage and cache directories exist
mkdir -p /var/www/html/storage/app/public \
         /var/www/html/storage/framework/cache/data \
         /var/www/html/storage/framework/sessions \
         /var/www/html/storage/framework/views \
         /var/www/html/storage/logs \
         /var/www/html/bootstrap/cache

# Fix permissions
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Check APP_KEY
if [ -z "$APP_KEY" ]; then
    echo "WARNING: APP_KEY is not set. Generating a temporary key or generating one now..."
    php artisan key:generate --force || true
fi

# Link storage
echo "==> Creating storage link..."
php artisan storage:link --force || true

# Run migrations if enabled (default: true)
if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
    echo "==> Checking database connection & running migrations..."
    # Wait for DB connection if DB_HOST is set
    if [ -n "$DB_HOST" ]; then
        echo "Waiting for database at $DB_HOST:$DB_PORT..."
        MAX_RETRIES=15
        COUNT=0
        until php -r '
            try {
                $h = getenv("DB_HOST") ?: "127.0.0.1";
                $p = getenv("DB_PORT") ?: "3306";
                $d = getenv("DB_DATABASE") ?: "";
                $u = getenv("DB_USERNAME") ?: "";
                $w = getenv("DB_PASSWORD") ?: "";
                new PDO("mysql:host={$h};port={$p};dbname={$d}", $u, $w, [PDO::ATTR_TIMEOUT => 3]);
                exit(0);
            } catch (Throwable $e) {
                exit(1);
            }
        ' > /dev/null 2>&1 || [ $COUNT -eq $MAX_RETRIES ]; do
            COUNT=$((COUNT + 1))
            echo "Database unavailable, waiting 2 seconds... ($COUNT/$MAX_RETRIES)"
            sleep 2
        done

        if [ $COUNT -lt $MAX_RETRIES ]; then
            echo "==> Database is reachable! Running migrations..."
            php artisan migrate --force || echo "Migrations encountered an issue, proceeding anyway..."
        else
            echo "==> Database unreachable after $MAX_RETRIES attempts. Skipping initial migrations; application will start."
        fi
    else
        php artisan migrate --force || true
    fi
fi

# Clear and optimize configuration cache in production
if [ "${APP_ENV:-production}" = "production" ]; then
    echo "==> Caching routes and views for production..."
    php artisan route:cache || true
    php artisan view:cache || true
    # We do not run config:cache at build time so runtime env vars are read, but running it here bakes runtime env vars
    php artisan config:cache || true
fi

echo "==> Container initialization complete. Handing over to: $@"
exec "$@"
