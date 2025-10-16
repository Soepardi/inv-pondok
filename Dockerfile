# Gunakan image PHP dengan Composer dan ekstensi yang dibutuhkan
FROM php:8.3-fpm

# Install dependencies sistem
RUN apt-get update && apt-get install -y \
    git curl zip unzip libpng-dev libonig-dev libxml2-dev libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql mbstring exif pcntl bcmath gd

# Install Composer
COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

# Copy file Laravel ke container
WORKDIR /var/www/html
COPY . .

# Install dependensi Laravel
RUN composer install --no-dev --optimize-autoloader

# Jalankan build frontend (kalau pakai Vite)
RUN npm install && npm run build

# Jalankan artisan commands
RUN php artisan key:generate

# Gunakan PHP built-in server
CMD php artisan serve --host=0.0.0.0 --port=10000

EXPOSE 10000
