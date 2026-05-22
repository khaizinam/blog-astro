---
title: "Deploy PHP, Laravel, CodeIgniter Lên Linux VPS Với Nginx + MySQL Docker + SSL 2026"
author: KhaiziNam
pubDatetime: 2026-04-20T19:22:46.000Z
slug: deploy-php-laravel-codeigniter-len-linux-vps-voi-nginx
lang: vi
translationKey: post-227
featured: false
draft: false
tags:
  - "DevOps"
description: "Hướng dẫn đầy đủ cài PHP 8.2, Nginx, MySQL Docker, cấu hình php-fpm, UFW firewall và SSL Let's Encrypt để deploy PHP thuần, Laravel, CodeIgniter lên Ubuntu VPS từ đầu."
---

Hướng dẫn đầy đủ từng bước cài PHP 8.2, Nginx, MySQL Docker, cấu hình php-fpm, UFW firewall và SSL Let's Encrypt để deploy PHP thuần, Laravel hoặc CodeIgniter lên Ubuntu VPS từ số không.

Bạn vừa thuê xong VPS Linux và đang nhìn vào màn hình terminal trắng xóa không biết bắt đầu từ đâu? Shared hosting cũ chạy PHP thì dễ — nhưng muốn control version PHP, cấu hình MySQL theo ý muốn, hay deploy Laravel với queue worker thì shared hosting không đủ sức. Bài này đi thẳng vào thực chiến: từ lần SSH đầu tiên đến lúc domain chạy HTTPS với PHP 8.2, Nginx, MySQL (qua Docker) và SSL tự gia hạn.

**Mục lục:**

*   [1\. Tại sao dùng Nginx thay Apache cho PHP trên VPS?](#1-tai-sao-dung-nginx-thay-apache-cho-php-tren-vps)
*   [2\. Chuẩn bị trước khi bắt đầu](#2-chuan-bi-truoc-khi-bat-dau)
*   [3\. Bước 1 — SSH, cập nhật server và bật UFW firewall](#3-buoc-1-ssh-cap-nhat-server-va-bat-ufw-firewall)
*   [4\. Bước 2 — Cài PHP 8.2 và các extension cần thiết](#4-buoc-2-cai-php-82-va-cac-extension-can-thiet)
*   [5\. Bước 3 — Cài Nginx và cấu hình PHP-FPM](#5-buoc-3-cai-nginx)
*   [6\. Bước 4 — Cài MySQL bằng Docker (và tại sao nên làm vậy)](#6-buoc-4-cai-mysql-bang-docker-va-tai-sao-nen-lam-vay)
*   [7\. Bước 5 — Cấu hình Nginx server block cho PHP](#7-buoc-5-cau-hinh-nginx-server-block-cho-php)
*   [8\. Bước 6 — Bật HTTPS miễn phí với Certbot + Let's Encrypt](#8-buoc-6-bat-https-mien-phi-voi-certbot-lets-encrypt)
*   [9\. Bước 7 — Deploy Laravel và CodeIgniter](#9-buoc-7-deploy-laravel-va-codeigniter)
*   [10\. Lỗi thường gặp và cách sửa](#10-loi-thuong-gap-va-cach-sua)
*   [FAQ — Câu hỏi thường gặp](#faq-cau-hoi-thuong-gap)

* * *

#### 1\. Tại Sao Dùng Nginx Thay Apache Cho PHP Trên VPS?

Apache từng là web server mặc định của thế giới PHP — và vẫn hoạt động tốt — nhưng Nginx có lợi thế rõ ràng hơn trên VPS tài nguyên hạn chế. Nginx xử lý concurrent request theo mô hình event-driven không đồng bộ, tiêu thụ RAM thấp hơn Apache theo mô hình process-per-request khi traffic tăng cao. Với VPS 1–2GB RAM, sự khác biệt này rất đáng kể.

Nginx không thực thi PHP trực tiếp — nó ủy quyền xử lý PHP cho **PHP-FPM** (FastCGI Process Manager) qua socket Unix hoặc TCP port. Kiến trúc tách biệt này có nghĩa:

*   Nginx serve file tĩnh (CSS, JS, ảnh) cực nhanh mà không cần PHP-FPM
*   PHP-FPM quản lý pool worker riêng, có thể tune theo RAM của server
*   Upgrade PHP version chỉ cần đổi socket path trong Nginx config — không đụng đến web server
*   Chạy nhiều app PHP với version PHP khác nhau (7.4 và 8.2) trên cùng server

**📌 Giải thích thuật ngữ:** _PHP-FPM (FastCGI Process Manager)_ — Trình quản lý process PHP chạy độc lập với web server. Nhận request từ Nginx qua giao thức FastCGI, thực thi PHP script, trả kết quả về Nginx để gửi cho client.

> Xem thêm: [Cách Deploy Node.js và React Lên Hosting Linux Bằng Nginx Reverse Proxy](/cach-deploy-nodejs-va-react-len-hosting-linux-bang-nginx-reverse-proxy-huong-dan-day-du-pm2-ssl-2025)

* * *

#### 2\. Chuẩn Bị Trước Khi Bắt Đầu

*   VPS hoặc dedicated server chạy **Ubuntu 20.04 / 22.04 / 24.04** — các lệnh trong bài áp dụng cho cả ba phiên bản
*   Quyền **root hoặc sudo** qua SSH
*   Tên miền với **bản ghi A trỏ về IP public** của server — trỏ domain trước, chờ DNS propagate, rồi mới chạy Certbot
*   Code PHP / Laravel / CodeIgniter sẵn sàng để upload (Git hoặc SCP/SFTP)

* * *

#### 3\. Bước 1 — SSH, Cập Nhật Server Và Bật UFW Firewall

Việc đầu tiên sau khi SSH vào server là cập nhật toàn bộ package và cấu hình firewall trước khi cài bất cứ thứ gì khác.

##### 3.1. SSH vào server

```bash
# SSH bằng password (lần đầu tiên)
ssh root@YOUR_SERVER_IP

# SSH bằng key (khuyến nghị cho production)
ssh -i ~/.ssh/your_key.pem ubuntu@YOUR_SERVER_IP
```

##### 3.2. Cập nhật server và cài tool cơ bản

```bash
# Cập nhật toàn bộ package
sudo apt update && sudo apt upgrade -y

# Cài các tool cần thiết
sudo apt install -y curl git unzip software-properties-common apt-transport-https ca-certificates gnupg
```

##### 3.3. Cấu hình UFW firewall

```bash
# Bật UFW
sudo ufw enable

# Cho phép SSH (bắt buộc — thiếu bước này sẽ bị khóa khỏi server)
sudo ufw allow ssh
sudo ufw allow 22/tcp

# Cho phép HTTP và HTTPS
sudo ufw allow 'Nginx Full'

# Kiểm tra trạng thái
sudo ufw status verbose
```

**Cảnh báo quan trọng:** Luôn chạy **sudo ufw allow ssh** TRƯỚC khi **sudo ufw enable**. Nếu bật UFW mà không mở port SSH trước, bạn sẽ bị khóa hoàn toàn khỏi server và phải vào VPS console từ control panel nhà cung cấp để sửa.

**📌 Giải thích thuật ngữ:** _UFW (Uncomplicated Firewall)_ — Giao diện dòng lệnh đơn giản hóa việc quản lý iptables (firewall kernel Linux). Kiểm soát port nào được phép nhận kết nối từ bên ngoài.

* * *

#### 4\. Bước 2 — Cài PHP 8.2 Và Các Extension Cần Thiết

Repository Ubuntu mặc định thường chứa phiên bản PHP cũ. Dùng PPA của Ondřej Surý — nguồn tin cậy nhất cho PHP mới nhất trên Ubuntu:

##### 4.1. Thêm PPA và cài PHP 8.2

```bash
# Thêm PPA PHP của Ondřej Surý
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update

# Cài PHP 8.2 và PHP-FPM
sudo apt install -y php8.2 php8.2-fpm

# Kiểm tra phiên bản
php -v
```

##### 4.2. Cài extension PHP cần thiết

Extension cần cài tùy theo framework. Dưới đây là bộ đầy đủ cho PHP thuần, Laravel và CodeIgniter:

```bash
# Extension cần thiết cho hầu hết dự án PHP
sudo apt install -y \
  php8.2-cli \
  php8.2-common \
  php8.2-mysql \
  php8.2-pgsql \
  php8.2-sqlite3 \
  php8.2-xml \
  php8.2-xmlrpc \
  php8.2-curl \
  php8.2-gd \
  php8.2-imagick \
  php8.2-mbstring \
  php8.2-zip \
  php8.2-bcmath \
  php8.2-intl \
  php8.2-redis \
  php8.2-opcache

# Khởi động PHP-FPM
sudo systemctl enable php8.2-fpm
sudo systemctl start php8.2-fpm

# Kiểm tra PHP-FPM đang chạy
sudo systemctl status php8.2-fpm
```

##### 4.3. Cài Composer

```bash
# Tải và cài Composer toàn cục
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
sudo chmod +x /usr/local/bin/composer

# Kiểm tra
composer --version
```

**📌 Giải thích thuật ngữ:** _php8.2-opcache_ — Extension cache bytecode PHP đã biên dịch vào RAM, giúp tăng tốc độ thực thi PHP 2–5 lần bằng cách bỏ qua bước parse/compile PHP script mỗi request.

* * *

#### 5\. Bước 3 — Cài Nginx

```bash
# Cài Nginx từ repository Ubuntu
sudo apt install -y nginx

# Bật Nginx tự khởi động khi server reboot
sudo systemctl enable nginx
sudo systemctl start nginx

# Kiểm tra trạng thái
sudo systemctl status nginx

# Xóa config mặc định (sẽ tạo config riêng cho từng site)
sudo rm /etc/nginx/sites-enabled/default
```

Sau bước này, truy cập **http://YOUR_SERVER_IP** trong trình duyệt sẽ thấy trang "Welcome to nginx" — xác nhận Nginx đang chạy đúng.

* * *

#### 6\. Bước 4 — Cài MySQL Bằng Docker (Và Tại Sao Nên Làm Vậy)

Bạn có thể cài MySQL trực tiếp lên server bằng **apt install mysql-server** — cách này hoàn toàn hợp lệ. Tuy nhiên, chạy MySQL qua Docker có những lợi thế thực chiến đáng kể, đặc biệt khi quản lý nhiều dự án trên một server:

*   **Đổi port dễ dàng:** Thay vì MySQL expose port 3306 ra toàn server, bạn map sang port tùy chọn (ví dụ 33060) và chỉ cho phép kết nối từ localhost — an toàn hơn mặc định
*   **Tạo/xóa instance độc lập:** Cần MySQL 5.7 cho project cũ và MySQL 8 cho project mới? Chạy hai container song song không xung đột
*   **Backup và migrate dễ:** Toàn bộ data MySQL nằm trong Docker volume — sao chép volume là xong backup
*   **Không ảnh hưởng đến hệ điều hành:** Xóa container là sạch hoàn toàn, không để lại file rác như khi cài trực tiếp

##### 6.1. Cài Docker

```bash
# Thêm Docker GPG key và repository chính thức
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] \
  https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Cho phép user hiện tại chạy Docker không cần sudo
sudo usermod -aG docker $USER
newgrp docker

# Kiểm tra Docker hoạt động
docker --version
```

##### 6.2. Chạy MySQL 8 container

```bash
# Tạo Docker volume để data MySQL tồn tại sau khi restart container
docker volume create mysql8_data

# Chạy MySQL 8 container
# - Port: map 3306 nội bộ ra 33060 trên host (tránh conflict nếu đã có MySQL native)
# - Volume: mount vào /var/lib/mysql trong container
# - restart always: tự khởi động lại khi server reboot
docker run -d \
  --name mysql8 \
  -e MYSQL_ROOT_PASSWORD=your_strong_root_password \
  -e MYSQL_DATABASE=your_db_name \
  -e MYSQL_USER=your_db_user \
  -e MYSQL_PASSWORD=your_db_password \
  -p 127.0.0.1:33060:3306 \
  -v mysql8_data:/var/lib/mysql \
  --restart always \
  mysql:8.0
```

**Chú ý quan trọng:** Dòng **-p 127.0.0.1:33060:3306** bind port MySQL chỉ trên loopback interface — chỉ các process trên cùng server mới kết nối được. Không bao giờ bind thành **0.0.0.0:3306** trên server production vì điều đó expose MySQL ra internet công khai.

##### 6.3. Tạo database và user cho từng project

```bash
# Kết nối vào MySQL container
docker exec -it mysql8 mysql -u root -p
```

```sql
-- Trong MySQL shell — tạo database và user riêng cho mỗi project
CREATE DATABASE laravel_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'laravel_user'@'%' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON laravel_app.* TO 'laravel_user'@'%';
FLUSH PRIVILEGES;
EXIT;
```

Trong file **.env** của Laravel / CodeIgniter, kết nối MySQL Docker với:

```env
DB_HOST=127.0.0.1
DB_PORT=33060
DB_DATABASE=laravel_app
DB_USERNAME=laravel_user
DB_PASSWORD=strong_password_here
```

**📌 Giải thích thuật ngữ:** _Docker Volume_ — Vùng lưu trữ được Docker quản lý, tồn tại độc lập với container. Khi container bị xóa và tạo lại, data trong volume vẫn còn nguyên.

* * *

#### 7\. Bước 5 — Cấu Hinh Nginx Server Block Cho PHP

Nginx không đọc PHP — nó chuyển các request PHP cho PHP-FPM qua **fastcgi_pass**. Đây là cấu hình Nginx chuẩn cho PHP, tương đương với **proxy_pass** trong bài Node.js nhưng dùng giao thức FastCGI thay vì HTTP.

##### 7.1. Tạo thư mục web và upload code

```bash
# Tạo thư mục cho site
sudo mkdir -p /var/www/yourdomain.com
sudo chown -R $USER:www-data /var/www/yourdomain.com
sudo chmod -R 755 /var/www/yourdomain.com

# Clone project từ Git (hoặc upload qua SFTP)
cd /var/www/yourdomain.com
git clone https://github.com/youruser/your-php-project.git .
```

##### 7.2. Cấu hình Nginx cho PHP thuần

```bash
sudo nano /etc/nginx/sites-available/yourdomain.com
```

Dán vào nội dung sau. Đây là cấu hình HTTP port 80 — Certbot sẽ tự thêm phần HTTPS ở bước tiếp theo:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;

    root /var/www/yourdomain.com;
    index index.php index.html index.htm;

    access_log /var/log/nginx/yourdomain.access.log;
    error_log  /var/log/nginx/yourdomain.error.log;

    location / {
        try_files $uri $uri/ =404;
    }

    # Chuyển tất cả .php file cho PHP-FPM xử lý
    location ~ \.php$ {
        include snippets/fastcgi-php.conf;

        # Kết nối đến PHP-FPM qua Unix socket (nhanh hơn TCP)
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;

        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    # Chặn truy cập file .htaccess (không dùng với Nginx nhưng vẫn nên chặn)
    location ~ /\.ht {
        deny all;
    }

    # Chặn truy cập file .env
    location ~ /\.env {
        deny all;
    }
}
```

##### 7.3. Cấu hình Nginx cho Laravel

Laravel yêu cầu **try_files** trỏ về **index.php** thay vì trả 404 — đây là cơ chế routing của framework. Document root phải trỏ vào thư mục **public/** của Laravel:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;

    # Laravel: root phải trỏ vào thư mục public/
    root /var/www/yourdomain.com/public;
    index index.php index.html;

    access_log /var/log/nginx/yourdomain.access.log;
    error_log  /var/log/nginx/yourdomain.error.log;

    location / {
        # Quan trọng: Laravel routing hoạt động nhờ dòng này
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.ht { deny all; }
    location ~ /\.env { deny all; }

    # Cache static assets của Laravel
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

##### 7.4. Bật site và kiểm tra

```bash
# Tạo symlink bật site
sudo ln -s /etc/nginx/sites-available/yourdomain.com /etc/nginx/sites-enabled/

# Kiểm tra cú pháp — luôn làm trước khi reload
sudo nginx -t

# Nếu test pass
sudo systemctl reload nginx
```

Tại điểm này app PHP đã chạy được trên **http://yourdomain.com**. Bước tiếp theo thêm HTTPS.

* * *

#### 8\. Bước 6 — Bật HTTPS Miễn Phí Với Certbot + Let's Encrypt

Certbot tự động đọc file cấu hình Nginx bạn vừa tạo, thêm server block HTTPS port 443, và cấu hình redirect từ HTTP sang HTTPS — bạn không cần sửa Nginx config thủ công.

```bash
# Cài Certbot và Nginx plugin
sudo apt install -y certbot python3-certbot-nginx

# Cấp certificate — thay bằng domain thực
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Làm theo hướng dẫn:
1. Nhập email để nhận thông báo gia hạn certificate
2. Đồng ý điều khoản dịch vụ (A)
3. Chọn redirect HTTP sang HTTPS (option 2) — khuyến nghị

Sau khi Certbot chạy xong, mở file **/etc/nginx/sites-available/yourdomain.com** sẽ thấy Certbot đã tự thêm:

*   Server block mới lắng nghe trên port 443 với **ssl_certificate**
*   Server block cũ (port 80) được sửa thành redirect 301 sang HTTPS

```bash
# Kiểm tra tự gia hạn certificate (chạy thử, không ảnh hưởng certificate thật)
sudo certbot renew --dry-run

# Certificate Let's Encrypt có hiệu lực 90 ngày
# Certbot cài systemd timer tự gia hạn trước khi hết hạn — kiểm tra:
sudo systemctl status certbot.timer
```

* * *

#### 9\. Bước 7 — Deploy Laravel Và CodeIgniter

##### 9.1. Hoàn thiện setup Laravel

```bash
cd /var/www/yourdomain.com

# Cài dependencies
composer install --optimize-autoloader --no-dev

# Copy file .env
cp .env.example .env

# Sửa .env với thông tin database và app config
nano .env

# Generate app key
php artisan key:generate

# Chạy migration
php artisan migrate --force

# Phân quyền thư mục storage và bootstrap/cache
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache

# Tối ưu Laravel cho production
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

##### 9.2. Cấu hình Nginx cho CodeIgniter 4

CodeIgniter 4 tương tự Laravel — document root trỏ vào thư mục **public/**, routing qua **index.php**:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    root /var/www/yourdomain.com/public;
    index index.php index.html;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.ht { deny all; }
    location ~ /\.env { deny all; }
}
```

##### 9.3. Chạy Laravel Queue Worker với Supervisor

Nếu app dùng Laravel Queue (email, notification, jobs), cần Supervisor để giữ worker chạy liên tục — tương tự PM2 giữ Node.js sống:

```bash
sudo apt install -y supervisor
sudo nano /etc/supervisor/conf.d/laravel-worker.conf
```

```ini
[program:laravel-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/yourdomain.com/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/log/supervisor/laravel-worker.log
stopwaitsecs=3600
```

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start laravel-worker:*
```

* * *

#### 10\. Lỗi Thường Gặp Và Cách Sửa

**502 Bad Gateway:** Nginx không giao tiếp được với PHP-FPM. Kiểm tra PHP-FPM có đang chạy không (**sudo systemctl status php8.2-fpm**) và xác nhận đường dẫn socket trong cấu hình Nginx (**/var/run/php/php8.2-fpm.sock**) trùng khớp với file socket thực tế (**ls /var/run/php/**).

**403 Forbidden:** Nginx không đọc được file do phân quyền sai. Sửa bằng **sudo chown -R www-data:www-data /var/www/yourdomain.com** và đảm bảo thư mục có quyền 755, file có quyền 644.

**404 trên tất cả route Laravel/CodeIgniter:** Thiếu hoặc sai directive **try_files $uri $uri/ /index.php?$query_string**. Framework routing dựa vào dòng này để chuyển tất cả request không khớp file tĩnh về **index.php**.

**PHP không kết nối được MySQL Docker:** Kiểm tra port trong **.env** có khớp với port đã map trong lệnh **docker run** không. Kiểm tra container đang chạy bằng **docker ps**. Kiểm tra kết nối thủ công: **mysql -h 127.0.0.1 -P 33060 -u your_user -p**.

**Certbot báo "Could not automatically find a matching server block":** Nginx config chưa có **server_name** khớp với domain bạn truyền vào Certbot. Kiểm tra lại file **/etc/nginx/sites-available/yourdomain.com** và đảm bảo **server_name** đúng.

**Laravel: "No application encryption key has been specified":** Chưa chạy **php artisan key:generate** hoặc file **.env** thiếu biến **APP_KEY**.

**Permission denied trên storage/ hoặc bootstrap/cache/:** Chạy **sudo chown -R www-data:www-data storage bootstrap/cache && sudo chmod -R 775 storage bootstrap/cache** từ thư mục root của Laravel.

* * *

#### FAQ — Câu Hỏi Thường Gặp

##### Nên cài MySQL trực tiếp hay dùng Docker trên VPS?

Cả hai đều ổn. Cài trực tiếp đơn giản hơn nếu chỉ có một project. Docker phù hợp hơn khi quản lý nhiều project cần version MySQL khác nhau, hoặc khi bạn muốn giữ server OS sạch và dễ backup/migrate data.

##### PHP-FPM socket Unix và TCP port khác nhau thế nào?

Unix socket (**unix:/var/run/php/php8.2-fpm.sock**) nhanh hơn TCP vì giao tiếp trong kernel không qua network stack. Dùng Unix socket khi Nginx và PHP-FPM cùng server — đây là cấu hình chuẩn. Dùng TCP (**127.0.0.1:9000**) khi PHP-FPM chạy trên server khác.

##### Có thể chạy nhiều version PHP trên cùng một server không?

Có. Cài song song PHP 7.4 và PHP 8.2 từ PPA Ondřej — mỗi version có PHP-FPM socket riêng. Trong Nginx config của từng site, chỉ cần đổi **fastcgi_pass** sang socket tương ứng: **php7.4-fpm.sock** hoặc **php8.2-fpm.sock**.

##### Deploy code mới lên server cần làm gì?

Với PHP thuần: upload file mới qua SFTP hoặc **git pull** là xong — không cần restart Nginx hay PHP-FPM. Với Laravel: **git pull && composer install --no-dev && php artisan migrate --force && php artisan config:cache && php artisan route:cache**. Nếu dùng queue worker: **sudo supervisorctl restart laravel-worker:*** sau khi deploy.

##### Let's Encrypt certificate hết hạn phải làm gì?

Không cần làm gì thủ công. Certbot cài systemd timer tự chạy **certbot renew** hai lần mỗi ngày. Certificate sẽ được gia hạn tự động khi còn dưới 30 ngày hiệu lực. Nếu muốn kiểm tra: **sudo certbot renew --dry-run**.

#### Tổng Kết — Stack PHP Production Đã Sẵn Sàng

Bạn vừa có đầy đủ stack PHP production hoàn chỉnh: PHP 8.2 với đầy đủ extension chạy qua PHP-FPM, Nginx làm web server với FastCGI pass, MySQL 8 cô lập trong Docker container với volume persistent, UFW firewall kiểm soát traffic, và HTTPS tự gia hạn qua Let's Encrypt. Stack này phù hợp cho PHP thuần, Laravel, CodeIgniter và bất kỳ PHP framework nào.

Bước tiếp theo: Thiết lập CI/CD tự động với GitHub Actions — SSH vào server, pull code mới nhất, chạy **composer install** và **php artisan migrate** tự động mỗi khi merge vào nhánh **main**. Tự động hóa deployment từ ngày đầu loại bỏ sai sót thủ công và rút ngắn thời gian mỗi lần update xuống còn vài chục giây.

> Xem thêm: [Cách Deploy Node.js và React Lên Hosting Linux Bằng Nginx Reverse Proxy](/cach-deploy-nodejs-va-react-len-hosting-linux-bang-nginx-reverse-proxy-huong-dan-day-du-pm2-ssl-2025)
