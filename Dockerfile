# Gunakan image PHP resmi dengan FPM
FROM php:8.3-fpm

# Install dependencies sistem & ekstensi yang dibutuhkan Laravel + PgSQL + PhpSpreadsheet
RUN apt-get update && apt-get install -y \
    git curl zip unzip libpng-dev libonig-dev libxml2-dev libpq-dev libzip-dev \
    && docker-php-ext-install pdo pdo_pgsql mbstring exif pcntl bcmath gd zip

# Install Composer
COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

# Atur direktori kerja
WORKDIR /var/www/html

# Salin semua file Laravel ke container
COPY . .

# Install dependensi Laravel (tanpa dev dependencies)
RUN composer install --no-dev --optimize-autoloader

# Build frontend pakai Vite (opsional, kalau pakai Vite)
RUN npm install && npm run build

# Generate application key (dijalankan saat build)
RUN php artisan key:generate || true

# Set permission untuk folder storage dan bootstrap/cache
RUN chmod -R 775 storage bootstrap/cache || true

# Laravel listen di port 10000
EXPOSE 10000

# Jalankan aplikasi Laravel
CMD php artisan serve --host=0.0.0.0 --port=10000
