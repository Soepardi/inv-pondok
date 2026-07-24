#!/bin/bash
set -e

echo "==> Starting Laravel app..."

# Render injects DATABASE_URL — map it to Laravel's DB_URL
if [ -n "$DATABASE_URL" ]; then
    export DB_URL="$DATABASE_URL"
fi

# Generate .env from environment variables if it doesn't exist
if [ ! -f /var/www/html/.env ]; then
    echo "==> Creating .env file..."
    cp /var/www/html/.env.production /var/www/html/.env
fi

# Cache config for performance
echo "==> Caching configuration..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run migrations
echo "==> Running database migrations..."
php artisan migrate --force

# Create storage symlink
echo "==> Creating storage symlink..."
php artisan storage:link || true

# Fix permissions after any file ops
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Update Apache port if Render's $PORT is set
PORT="${PORT:-80}"
sed -i "s/Listen 80/Listen $PORT/g" /etc/apache2/ports.conf
sed -i "s/\${PORT}/$PORT/g" /etc/apache2/sites-available/000-default.conf

echo "==> Starting Apache on port $PORT..."
exec apache2-foreground
