---
title: "Deploy PHP, Laravel, CodeIgniter on Linux VPS with Nginx + MySQL Docker + SSL 2026"
author: KhaiziNam
pubDatetime: 2026-04-20T19:22:46.000Z
slug: deploy-php-laravel-codeigniter-len-linux-vps-voi-nginx
lang: en
translationKey: post-227
featured: false
draft: false
tags:
  - "DevOps"
description: "You just spun up a Linux VPS and you're staring at a blank terminal not knowing where to start? Shared hosting works fine for simple PHP — but the moment you need to control PHP versions, configure MySQL your way, or run a Laravel queue worker, shared hosting falls short."
---

A complete step-by-step guide to installing PHP 8.2, Nginx, MySQL via Docker, configuring PHP-FPM, UFW firewall, and Let's Encrypt SSL to deploy plain PHP, Laravel, or CodeIgniter on an Ubuntu VPS from scratch.

You just spun up a Linux VPS and you're staring at a blank terminal not knowing where to start? Shared hosting works fine for simple PHP — but the moment you need to control PHP versions, configure MySQL your way, or run a Laravel queue worker, shared hosting falls short. This guide goes straight to hands-on: from your first SSH login to your domain running HTTPS with PHP 8.2, Nginx, MySQL (via Docker), and auto-renewing SSL.

**Table of Contents:**

*   [1\. Why Nginx instead of Apache for PHP on a VPS?](#1-why-nginx-instead-of-apache-for-php-on-a-vps)
*   [2\. Prerequisites](#2-prerequisites)
*   [3\. Step 1 — SSH in, update the server, and enable UFW firewall](#3-step-1-ssh-in-update-the-server-and-enable-ufw-firewall)
*   [4\. Step 2 — Install PHP 8.2 and required extensions](#4-step-2-install-php-82-and-required-extensions)
*   [5\. Step 3 — Install Nginx](#5-step-3-install-nginx)
*   [6\. Step 4 — Install MySQL via Docker (and why you should)](#6-step-4-install-mysql-via-docker-and-why-you-should)
*   [7\. Step 5 — Configure Nginx server block for PHP](#7-step-5-configure-nginx-server-block-for-php)
*   [8\. Step 6 — Enable free HTTPS with Certbot + Let's Encrypt](#8-step-6-enable-free-https-with-certbot-lets-encrypt)
*   [9\. Step 7 — Deploy Laravel and CodeIgniter](#9-step-7-deploy-laravel-and-codeigniter)
*   [10\. Common errors and fixes](#10-common-errors-and-fixes)
*   [FAQ](#faq-frequently-asked-questions)

* * *

#### 1\. Why Nginx Instead of Apache for PHP on a VPS?

Apache has been the default web server for PHP for decades — and it still works well — but Nginx has a clear advantage on resource-constrained VPS environments. Nginx handles concurrent requests using an event-driven asynchronous model, consuming significantly less RAM than Apache's process-per-request model under load. On a 1–2GB RAM VPS, this difference is substantial.

> See more: [How to Deploy Node.js and React Apps on Linux Hosting with Nginx Reverse Proxy](/en/cach-deploy-nodejs-va-react-len-hosting-linux-bang-nginx-reverse-proxy-huong-dan-day-du-pm2-ssl-2025)

Nginx doesn't execute PHP directly — it delegates PHP processing to **PHP-FPM** (FastCGI Process Manager) over a Unix socket or TCP port. This separation means:

*   Nginx serves static files (CSS, JS, images) directly without involving PHP-FPM
*   PHP-FPM manages its own worker pool, tunable to your server's RAM
*   Upgrading PHP versions only requires changing the socket path in Nginx config — no web server changes needed
*   Multiple PHP apps with different versions (7.4 and 8.2) can run side-by-side on the same server

* * *

#### 2\. Prerequisites

*   VPS or dedicated server running **Ubuntu 20.04 / 22.04 / 24.04**
*   **Root or sudo access** via SSH
*   A domain with its **A record pointing to your server's public IP** — point the domain first, wait for DNS propagation, then run Certbot
*   PHP / Laravel / CodeIgniter code ready to deploy (via Git or SCP/SFTP)

* * *

#### 3\. Step 1 — SSH In, Update the Server, and Enable UFW Firewall

##### 3.1. SSH into the server

\# SSH with password (first login)
ssh root@YOUR\_SERVER\_IP

# SSH with key (recommended for production)
ssh -i ~/.ssh/your\_key.pem ubuntu@YOUR\_SERVER\_IP

##### 3.2. Update the server and install essential tools

\# Update all packages
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl git unzip software-properties-common apt-transport-https ca-certificates gnupg

##### 3.3. Configure UFW firewall

\# Enable UFW
sudo ufw enable

# Allow SSH (critical — missing this step will lock you out)
sudo ufw allow ssh
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 'Nginx Full'

# Check status
sudo ufw status verbose

**Critical warning:** Always run **sudo ufw allow ssh** BEFORE **sudo ufw enable**. Enabling UFW without opening the SSH port first will completely lock you out of the server — you'll need to use your VPS provider's console to recover.

* * *

#### 4\. Step 2 — Install PHP 8.2 and Required Extensions

##### 4.1. Add PPA and install PHP 8.2

\# Add Ondřej Surý's PHP PPA (most trusted source for up-to-date PHP on Ubuntu)
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update

# Install PHP 8.2 and PHP-FPM
sudo apt install -y php8.2 php8.2-fpm

# Verify version
php -v

##### 4.2. Install required PHP extensions

\# Full extension set for plain PHP, Laravel, and CodeIgniter
sudo apt install -y \\
  php8.2-cli \\
  php8.2-common \\
  php8.2-mysql \\
  php8.2-pgsql \\
  php8.2-sqlite3 \\
  php8.2-xml \\
  php8.2-xmlrpc \\
  php8.2-curl \\
  php8.2-gd \\
  php8.2-imagick \\
  php8.2-mbstring \\
  php8.2-zip \\
  php8.2-bcmath \\
  php8.2-intl \\
  php8.2-redis \\
  php8.2-opcache

# Start and enable PHP-FPM
sudo systemctl enable php8.2-fpm
sudo systemctl start php8.2-fpm
sudo systemctl status php8.2-fpm

##### 4.3. Install Composer

curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
sudo chmod +x /usr/local/bin/composer
composer --version

* * *

#### 5\. Step 3 — Install Nginx

sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
sudo systemctl status nginx

# Remove the default config — you'll create per-site configs instead
sudo rm /etc/nginx/sites-enabled/default

At this point, visiting **http://YOUR\_SERVER\_IP** in a browser should show the Nginx welcome page, confirming it's running correctly.

* * *

#### 6\. Step 4 — Install MySQL via Docker (and Why You Should)

You can install MySQL directly with **apt install mysql-server** — that works perfectly fine. However, running MySQL inside a Docker container has practical advantages, especially when managing multiple projects on a single server:

*   **Easy port control:** Instead of MySQL exposing port 3306 to the whole server, you map it to a custom port (e.g. 33060) and bind it to localhost only — more secure than the default
*   **Isolated instances:** Need MySQL 5.7 for a legacy project and MySQL 8 for a new one? Run two containers side by side with zero conflicts
*   **Simple backup and migration:** All MySQL data lives in a Docker volume — copying the volume is a complete backup
*   **Clean uninstall:** Removing a container leaves no system files behind, unlike a native install

##### 6.1. Install Docker

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo "deb \[arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg\] \\
  https://download.docker.com/linux/ubuntu $(lsb\_release -cs) stable" | \\
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

sudo usermod -aG docker $USER
newgrp docker
docker --version

##### 6.2. Run the MySQL 8 container

\# Create a named volume so data survives container restarts
docker volume create mysql8\_data

# Run MySQL 8
# - Binds port 33060 on localhost only (not exposed to the internet)
# - Data persisted in docker volume
# - Restarts automatically on server reboot
docker run -d \\
  --name mysql8 \\
  -e MYSQL\_ROOT\_PASSWORD=your\_strong\_root\_password \\
  -e MYSQL\_DATABASE=your\_db\_name \\
  -e MYSQL\_USER=your\_db\_user \\
  -e MYSQL\_PASSWORD=your\_db\_password \\
  -p 127.0.0.1:33060:3306 \\
  -v mysql8\_data:/var/lib/mysql \\
  --restart always \\
  mysql:8.0

**Important:** The **\-p 127.0.0.1:33060:3306** flag binds MySQL only to the loopback interface — only processes on the same server can connect. Never use **0.0.0.0:3306** on a production server as it exposes MySQL to the public internet.

##### 6.3. Create a database and user per project

\# Connect into the MySQL container
docker exec -it mysql8 mysql -u root -p

# Inside the MySQL shell
CREATE DATABASE laravel\_app CHARACTER SET utf8mb4 COLLATE utf8mb4\_unicode\_ci;
CREATE USER 'laravel\_user'@'%' IDENTIFIED BY 'strong\_password\_here';
GRANT ALL PRIVILEGES ON laravel\_app.\* TO 'laravel\_user'@'%';
FLUSH PRIVILEGES;
EXIT;

In your Laravel / CodeIgniter **.env** file:

DB\_HOST=127.0.0.1
DB\_PORT=33060
DB\_DATABASE=laravel\_app
DB\_USERNAME=laravel\_user
DB\_PASSWORD=strong\_password\_here

* * *

#### 7\. Step 5 — Configure Nginx Server Block for PHP

Nginx doesn't process PHP — it hands PHP requests to PHP-FPM via **fastcgi\_pass**. This is the PHP equivalent of **proxy\_pass** for Node.js, but using the FastCGI protocol instead of HTTP.

##### 7.1. Create the web directory and upload code

sudo mkdir -p /var/www/yourdomain.com
sudo chown -R $USER:www-data /var/www/yourdomain.com
sudo chmod -R 755 /var/www/yourdomain.com

cd /var/www/yourdomain.com
git clone https://github.com/youruser/your-php-project.git .

##### 7.2. Nginx config for plain PHP

sudo nano /etc/nginx/sites-available/yourdomain.com

Paste the following. This is the HTTP port 80 config — Certbot will add the HTTPS section in the next step:

server {
    listen 80;
    listen \[::\]:80;
    server\_name yourdomain.com www.yourdomain.com;

    root /var/www/yourdomain.com;
    index index.php index.html index.htm;

    access\_log /var/log/nginx/yourdomain.access.log;
    error\_log  /var/log/nginx/yourdomain.error.log;

    location / {
        try\_files $uri $uri/ =404;
    }

    # Pass all .php requests to PHP-FPM
    location ~ \\.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi\_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi\_param SCRIPT\_FILENAME $realpath\_root$fastcgi\_script\_name;
        include fastcgi\_params;
    }

    location ~ /\\.ht  { deny all; }
    location ~ /\\.env { deny all; }
}

##### 7.3. Nginx config for Laravel

server {
    listen 80;
    listen \[::\]:80;
    server\_name yourdomain.com www.yourdomain.com;

    # Laravel: document root must point to the public/ subdirectory
    root /var/www/yourdomain.com/public;
    index index.php index.html;

    access\_log /var/log/nginx/yourdomain.access.log;
    error\_log  /var/log/nginx/yourdomain.error.log;

    location / {
        # Laravel routing depends on this line
        try\_files $uri $uri/ /index.php?$query\_string;
    }

    location ~ \\.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi\_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi\_param SCRIPT\_FILENAME $realpath\_root$fastcgi\_script\_name;
        include fastcgi\_params;
    }

    location ~ /\\.ht  { deny all; }
    location ~ /\\.env { deny all; }

    location ~\* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add\_header Cache-Control "public, immutable";
    }
}

##### 7.4. Enable the site and test

sudo ln -s /etc/nginx/sites-available/yourdomain.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

* * *

#### 8\. Step 6 — Enable Free HTTPS with Certbot + Let's Encrypt

Certbot reads your existing Nginx config, adds an HTTPS server block for port 443, and configures an HTTP-to-HTTPS redirect — no manual Nginx editing required.

sudo apt install -y certbot python3-certbot-nginx

sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow the prompts:
# 1. Enter your email for renewal notifications
# 2. Agree to the Terms of Service (A)
# 3. Select redirect HTTP to HTTPS (option 2) — recommended

\# Test auto-renewal (dry run — does not affect the real certificate)
sudo certbot renew --dry-run

# Verify the systemd renewal timer is active
sudo systemctl status certbot.timer

* * *

#### 9\. Step 7 — Deploy Laravel and CodeIgniter

##### 9.1. Complete Laravel setup

cd /var/www/yourdomain.com
composer install --optimize-autoloader --no-dev
cp .env.example .env
nano .env
php artisan key:generate
php artisan migrate --force
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
php artisan config:cache
php artisan route:cache
php artisan view:cache

##### 9.2. Run Laravel Queue Worker with Supervisor

sudo apt install -y supervisor
sudo nano /etc/supervisor/conf.d/laravel-worker.conf

\[program:laravel-worker\]
process\_name=%(program\_name)s\_%(process\_num)02d
command=php /var/www/yourdomain.com/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect\_stderr=true
stdout\_logfile=/var/log/supervisor/laravel-worker.log
stopwaitsecs=3600

sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start laravel-worker:\*

* * *

#### 10\. Common Errors and Fixes

**502 Bad Gateway:** Nginx cannot communicate with PHP-FPM. Check that PHP-FPM is running (**sudo systemctl status php8.2-fpm**) and verify the socket path in your Nginx config (**/var/run/php/php8.2-fpm.sock**) matches the actual socket file (**ls /var/run/php/**).

**403 Forbidden:** Nginx can't read your files due to wrong ownership. Fix with **sudo chown -R www-data:www-data /var/www/yourdomain.com** and ensure directories are 755 and files are 644.

**404 on all Laravel/CodeIgniter routes:** Missing or incorrect **try\_files $uri $uri/ /index.php?$query\_string** directive. Framework routing depends on this to forward all non-static requests to **index.php**.

**PHP can't connect to MySQL Docker:** Verify the port in **.env** matches the mapped port in your **docker run** command. Check the container is running with **docker ps**. Test the connection manually: **mysql -h 127.0.0.1 -P 33060 -u your\_user -p**.

**Certbot: "Could not automatically find a matching server block":** Your Nginx config's **server\_name** doesn't match the domain you passed to Certbot. Check **/etc/nginx/sites-available/yourdomain.com** and ensure **server\_name** is correct.

**Laravel: "No application encryption key has been specified":** You haven't run **php artisan key:generate**, or the **.env** file is missing the **APP\_KEY** variable.

**Permission denied on storage/ or bootstrap/cache/:** Run **sudo chown -R www-data:www-data storage bootstrap/cache && sudo chmod -R 775 storage bootstrap/cache** from the Laravel root directory.

* * *

#### FAQ — Frequently Asked Questions

##### Should I install MySQL directly or use Docker on a VPS?

Both work. A direct install is simpler if you only have one project. Docker makes more sense when managing multiple projects that need different MySQL versions, or when you want to keep the OS clean and simplify data backup and migration.

##### What's the difference between a Unix socket and a TCP port for PHP-FPM?

A Unix socket (**unix:/var/run/php/php8.2-fpm.sock**) is faster than TCP because it communicates through the kernel without going through the network stack. Use Unix sockets when Nginx and PHP-FPM are on the same server — this is the standard setup. Use TCP (**127.0.0.1:9000**) only when PHP-FPM runs on a separate server.

##### Can I run multiple PHP versions on the same server?

Yes. Install PHP 7.4 and PHP 8.2 in parallel from Ondřej's PPA — each version gets its own PHP-FPM socket. In each site's Nginx config, simply point **fastcgi\_pass** to the correct socket: **php7.4-fpm.sock** or **php8.2-fpm.sock**.

##### What's the deployment process for new code?

For plain PHP: upload files via SFTP or run **git pull** — no server restart needed. For Laravel: **git pull && composer install --no-dev && php artisan migrate --force && php artisan config:cache && php artisan route:cache**. If using queue workers: **sudo supervisorctl restart laravel-worker:\*** after deployment.

##### What happens when my Let's Encrypt certificate expires?

Nothing manual is required. Certbot installs a systemd timer that runs **certbot renew** twice daily. Certificates are renewed automatically when less than 30 days remain. To verify: **sudo certbot renew --dry-run**.

#### Conclusion — Your PHP Production Stack Is Ready

You now have a complete PHP production stack: PHP 8.2 with all required extensions running through PHP-FPM, Nginx as the web server with FastCGI pass, MySQL 8 isolated in a Docker container with persistent volume storage, UFW firewall controlling inbound traffic, and auto-renewing HTTPS via Let's Encrypt. This stack handles plain PHP, Laravel, CodeIgniter, and any other PHP framework.

Next step: set up automated CI/CD with GitHub Actions — SSH into the server, pull the latest code, run **composer install** and **php artisan migrate** automatically on every merge to **main**. Automating deployments from day one eliminates manual errors and reduces each update to a matter of seconds.

> See more: [How to Deploy Node.js and React Apps on Linux Hosting with Nginx Reverse Proxy](/en/cach-deploy-nodejs-va-react-len-hosting-linux-bang-nginx-reverse-proxy-huong-dan-day-du-pm2-ssl-2025)
