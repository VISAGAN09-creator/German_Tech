FROM php:8.2-apache

# Enable PDO and PostgreSQL
RUN docker-php-ext-install pdo pdo_pgsql

# Copy project files into container
COPY . /var/www/html/

# Set working directory
WORKDIR /var/www/html/

# Expose port 80
EXPOSE 80

# Start Apache
CMD ["apache2-foreground"]
