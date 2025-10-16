# Gunakan image PHP dengan Composer & ekstensi yang dibutuhkan Laravel
FROM php:8.3-fpm AS build

# Install dependensi sistem dan Node.js
RUN apt-get update && apt-get install -y \
    git unzip curl libpq-dev libpng-dev nodejs npm \
    && docker-php-ext-install pdo pdo_pgsql gd

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php \
    && mv composer.phar /usr/local/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy composer files dan install dependensi Laravel
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader

# Copy semua file proyek
COPY . .

# Build frontend (Vite)
RUN npm install && npm run build

# Gunakan image produksi yang ringan
FROM php:8.3-fpm AS production

# Install ekstensi yang dibutuhkan
RUN apt-get update && apt-get install -y libpq-dev libpng-dev \
    && docker-php-ext-install pdo pdo_pgsql gd

# Set working directory
WORKDIR /var/www/html

# Copy hasil build dari tahap sebelumnya
COPY --from=build /var/www/html /var/www/html

# Set permission storage dan bootstrap cache
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Expose port (Render akan auto detect)
EXPOSE 8080

# Jalankan PHP-FPM
CMD ["php-fpm"]
