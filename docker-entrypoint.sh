#!/bin/bash
set -e

echo "==> Starting Laravel app initialization..."

# Generate .env from .env.production if it doesn't exist
if [ ! -f /var/www/html/.env ]; then
    echo "==> Creating .env file from .env.production..."
    cp /var/www/html/.env.production /var/www/html/.env
fi

# Map Render environment variables into .env file
if [ -n "$DATABASE_URL" ]; then
    export DB_URL="$DATABASE_URL"
    grep -q "^DATABASE_URL=" /var/www/html/.env && sed -i "s|^DATABASE_URL=.*|DATABASE_URL=$DATABASE_URL|" /var/www/html/.env || echo "DATABASE_URL=$DATABASE_URL" >> /var/www/html/.env
    grep -q "^DB_URL=" /var/www/html/.env && sed -i "s|^DB_URL=.*|DB_URL=$DATABASE_URL|" /var/www/html/.env || echo "DB_URL=$DATABASE_URL" >> /var/www/html/.env
fi

if [ -n "$APP_KEY" ]; then
    grep -q "^APP_KEY=" /var/www/html/.env && sed -i "s|^APP_KEY=.*|APP_KEY=$APP_KEY|" /var/www/html/.env || echo "APP_KEY=$APP_KEY" >> /var/www/html/.env
fi

# Ensure APP_KEY exists and starts with base64:
if ! grep -q "^APP_KEY=base64:" /var/www/html/.env 2>/dev/null; then
    echo "==> Generating fresh APP_KEY..."
    php artisan key:generate --force
fi

# Clear old cached configs to avoid stale values
php artisan config:clear || true
php artisan route:clear || true
php artisan view:clear || true

# Wait for database to be reachable
echo "==> Waiting for database connection..."
MAX_TRIES=20
COUNT=0
while [ $COUNT -lt $MAX_TRIES ]; do
    if php artisan db:monitor > /dev/null 2>&1 || php artisan migrate:status > /dev/null 2>&1; then
        echo "==> Database connected successfully!"
        break
    fi
    COUNT=$((COUNT+1))
    echo "Waiting for database ($COUNT/$MAX_TRIES)..."
    sleep 2
done

# Run database migrations
echo "==> Running database migrations..."
php artisan migrate --force

# Run database seeder if requested
if [ "$RUN_SEEDER" = "true" ]; then
    echo "==> Running database seeders..."
    php artisan db:seed --force
fi

# Create storage symlink
echo "==> Creating storage symlink..."
php artisan storage:link || true

# Cache config and routes for production speed
echo "==> Caching configuration and routes..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Permissions
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Update Apache port if Render's $PORT is set
PORT="${PORT:-80}"
sed -i "s/Listen 80/Listen $PORT/g" /etc/apache2/ports.conf
sed -i "s/<VirtualHost \*:.*>/<VirtualHost \*:$PORT>/g" /etc/apache2/sites-available/000-default.conf

echo "==> Starting Apache on port $PORT..."
exec apache2-foreground
