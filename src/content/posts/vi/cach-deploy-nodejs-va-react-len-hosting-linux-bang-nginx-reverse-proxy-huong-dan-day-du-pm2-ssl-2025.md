---
title: "Cách Deploy Node.js và React Lên Hosting Linux Bằng Nginx Reverse Proxy — Hướng Dẫn Đầy Đủ PM2 + SSL 2025"
author: KhaiziNam
pubDatetime: 2026-03-23T20:59:38.000Z
slug: cach-deploy-nodejs-va-react-len-hosting-linux-bang-nginx-reverse-proxy-huong-dan-day-du-pm2-ssl-2025
lang: vi
translationKey: post-205
featured: false
draft: false
tags:
  - "DevOps"
description: "Bạn đã build xong app Node.js hoặc React và đang nhìn vào màn hình terminal của VPS Linux mà không biết bắt đầu từ đâu? Upload file lên shared hosting kiểu cũ không chạy được với Node.js — bạn cần một process manager để giữ app sống, một reverse proxy để trỏ domain vào đúng port, và cấu hình SSL để chạy HTTPS. Bài này hướng dẫn toàn bộ stack triển khai thực tế: PM2 quản lý process"
---

Bạn đã build xong app Node.js hoặc React và đang nhìn vào màn hình terminal của VPS Linux mà không biết bắt đầu từ đâu? Upload file lên shared hosting kiểu cũ không chạy được với Node.js — bạn cần một process manager để giữ app sống, một reverse proxy để trỏ domain vào đúng port, và cấu hình SSL để chạy HTTPS. Bài này hướng dẫn toàn bộ stack triển khai thực tế: PM2 quản lý process, Nginx làm reverse proxy với `proxy_pass`, SSL miễn phí qua Let's Encrypt, và cách serve React build tĩnh — tất cả từ đầu trên Ubuntu.

### Mục Lục

1\. [Nginx Reverse Proxy Là Gì Và Tại Sao Node.js Cần Nó](#nginx-reverse-proxy-la-gi-va-tai-sao-nodejs-can-no)

2\. [Chuẩn Bị Trước Khi Bắt Đầu](#chuan-bi-truoc-khi-bat-dau)

3\. [Bước 1 — Cài Node.js Trên Ubuntu Linux](#buoc-1-cai-nodejs-tren-ubuntu-linux)

4\. [Bước 2 — Cài Và Cấu Hình PM2 Process Manager](#buoc-2-cai-va-cau-hinh-pm2-process-manager)

5\. [Bước 3 — Cài Và Cấu Hình Nginx](#buoc-3-cai-va-cau-hinh-nginx)

6\. [Bước 4 — Cấu Hinh Nginx proxy_pass Cho Node.js API](#buoc-4-cau-hinh-nginx-proxypass-cho-nodejs-api)

7\. [Bước 5 — Deploy React Build Tĩnh Với Nginx](#buoc-5-deploy-react-build-tinh-voi-nginx)

8\. [Bước 6 — Bật HTTPS Miễn Phí Với Let's Encrypt](#buoc-6-bat-https-mien-phi-voi-lets-encrypt)

9\. [Bước 7 — Chạy Nhiều App Node.js Trên Một Server](#buoc-7-chay-nhieu-app-nodejs-tren-mot-server)

10\. [Lỗi Thường Gặp Và Cách Sửa](#loi-thuong-gap-va-cach-sua)

11\. [Câu Hỏi Thường Gặp](#cau-hoi-thuong-gap)

* * *

#### Nginx Reverse Proxy Là Gì Và Tại Sao Node.js Cần Nó

Node.js chạy app của bạn trên một port nội bộ — thường là 3000, 4000 hoặc 5000. Port này không được và không nên expose trực tiếp ra internet trên port 80 hay 443. Đây là lúc **Nginx đóng vai trò reverse proxy**: nó đứng trước process Node.js, nhận toàn bộ traffic từ internet trên port 80/443, rồi chuyển tiếp vào bên trong đến app của bạn qua chỉ thị `proxy_pass`.

Kiến trúc này cho phép bạn làm được những thứ mà Node.js một mình không xử lý tốt:

*   **SSL termination:** Nginx xử lý HTTPS, app Node.js chỉ nói HTTP nội bộ — không cần sửa code ứng dụng.
*   **Serve file tĩnh hiệu quả:** React build, ảnh, CSS — Nginx serve trực tiếp mà không đi qua Node.js, giảm tải đáng kể cho app server.
*   **Chạy nhiều app trên một server:** Nhiều domain hoặc subdomain trỏ vào các process Node.js khác nhau trên các port khác nhau — tất cả quản lý qua Nginx server blocks.
*   **Load balancing:** Phân phối traffic ra nhiều instance Node.js dùng directive upstream.
*   **Rate limiting và security headers:** Thêm giới hạn request, gzip compression và HTTP security headers ở tầng proxy mà không động vào code app.

**PM2** bổ sung cho Nginx bằng cách giữ process Node.js sống sau khi crash, tự khởi động lại khi server reboot, và cung cấp monitoring và quản lý log.

> Xem thêm: [Deploy PHP, Laravel, CodeIgniter Lên Linux VPS Với Nginx](/deploy-php-laravel-codeigniter-len-linux-vps-voi-nginx)

#### Chuẩn Bị Trước Khi Bắt Đầu

*   VPS hoặc dedicated server chạy **Ubuntu 20.04 / 22.04 / 24.04** — các lệnh trong bài này áp dụng cho cả ba phiên bản.
*   Quyền root hoặc sudo qua SSH.
*   Tên miền với **bản ghi A** trỏ về IP public của server. DNS propagation có thể mất đến 24 giờ — trỏ domain trước, sau đó mới bắt đầu các bước bên dưới.
*   Code app Node.js — clone từ Git hoặc upload qua SCP/SFTP.
*   Quen cơ bản với command line Linux — bạn sẽ dùng `nano` để sửa file và chạy các lệnh `sudo`.

#### Bước 1 — Cài Node.js Trên Ubuntu Linux

Không cài Node.js từ repository mặc định của Ubuntu — phiên bản đó quá cũ. Dùng **NodeSource repository** để lấy bản LTS hiện tại (Node.js 20.x tại thời điểm viết bài):

```bash
# Cập nhật package list
sudo apt update && sudo apt upgrade -y

# Cài curl nếu chưa có
sudo apt install -y curl git build-essential

# Thêm NodeSource repository cho Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Cài Node.js và npm
sudo apt install -y nodejs

# Kiểm tra phiên bản
node -v   # phải hiện v20.x.x
npm -v    # phải hiện 10.x.x
```

Nếu bạn quản lý nhiều project Node.js cần các phiên bản khác nhau, cài **NVM (Node Version Manager)** thay thế để switch version theo từng project:

```bash
# Cài NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc

# Cài và dùng Node.js 20
nvm install 20
nvm use 20
nvm alias default 20
```

#### Bước 2 — Cài Và Cấu Hình PM2 Process Manager

**PM2** là process manager tiêu chuẩn cho Node.js trong môi trường production. Không có PM2, app của bạn sẽ chết ngay khi phiên SSH kết thúc hoặc server reboot. Cài toàn cục:

```bash
sudo npm install -g pm2
```

Clone app và khởi động với PM2:

```bash
# Clone repository của bạn
cd /var/www
git clone https://github.com/yourusername/your-node-app.git
cd your-node-app

# Cài dependencies (chỉ production)
npm install --production

# Khởi động app với PM2 (thay app.js bằng file entry của bạn)
pm2 start app.js --name "my-node-app"

# Hoặc chỉ định port cụ thể
PORT=3000 pm2 start app.js --name "my-node-app"

# Lưu danh sách process PM2
pm2 save

# Cấu hình PM2 tự khởi động khi server reboot
pm2 startup
# Sao chép và chạy lệnh mà PM2 in ra (dạng như:)
# sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u youruser --hp /home/youruser
```

Các lệnh PM2 dùng hàng ngày:

```bash
pm2 list                    # Danh sách tất cả process đang chạy
pm2 logs my-node-app        # Xem log real-time
pm2 restart my-node-app     # Restart sau khi deploy code mới
pm2 stop my-node-app        # Dừng process
pm2 delete my-node-app      # Xóa khỏi danh sách PM2
pm2 monit                   # Dashboard CPU/memory real-time
```

Với app production, dùng **cluster mode** để tận dụng tất cả CPU cores:

```bash
# Khởi động với cluster mode — spawn một instance mỗi CPU core
pm2 start app.js --name "my-node-app" -i max

# Hoặc chỉ định số lượng instance cụ thể
pm2 start app.js --name "my-node-app" -i 4
```

#### Bước 3 — Cài Và Cấu Hình Nginx

```bash
# Cài Nginx
sudo apt install -y nginx

# Bật Nginx tự khởi động khi server bật
sudo systemctl enable nginx

# Khởi động Nginx
sudo systemctl start nginx

# Kiểm tra trạng thái
sudo systemctl status nginx

# Cấu hình firewall — cho phép HTTP, HTTPS và SSH
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

Cấu hình Nginx nằm trong hai thư mục trên Ubuntu:

*   **/etc/nginx/sites-available/** — Lưu tất cả file cấu hình virtual host tại đây (đã bật hay chưa đều được).
*   **/etc/nginx/sites-enabled/** — Nginx chỉ đọc config từ đây. Bạn bật một site bằng cách tạo symlink từ sites-available sang sites-enabled.

Cách tách biệt này cho phép bạn soạn thảo và kiểm tra cấu hình mà không kích hoạt ngay.

#### Bước 4 — Cấu Hình Nginx proxy_pass Cho Node.js API

Tạo file cấu hình Nginx mới cho app Node.js. Thay `yourdomain.com` bằng domain thực của bạn và `3000` bằng port app đang lắng nghe:

```bash
sudo nano /etc/nginx/sites-available/yourdomain.com
```

Dán cấu hình sau vào:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Log file
    access_log /var/log/nginx/yourdomain.access.log;
    error_log  /var/log/nginx/yourdomain.error.log;

    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;

        # Bắt buộc cho WebSocket
        proxy_set_header Upgrade    $http_upgrade;
        proxy_set_header Connection 'upgrade';

        # Truyền thông tin client thực đến Node.js app
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_cache_bypass $http_upgrade;
        proxy_redirect     off;

        # Timeout — tăng lên cho request chạy lâu
        proxy_read_timeout  240s;
        proxy_send_timeout  240s;
        proxy_connect_timeout 75s;
    }
}
```

Bật site và reload Nginx:

```bash
# Tạo symlink để bật site
sudo ln -s /etc/nginx/sites-available/yourdomain.com /etc/nginx/sites-enabled/

# Kiểm tra cú pháp cấu hình — luôn làm bước này trước khi reload
sudo nginx -t

# Nếu test pass, reload Nginx
sudo systemctl reload nginx
```

App Node.js của bạn giờ có thể truy cập tại `http://yourdomain.com`. Dòng `proxy_pass http://127.0.0.1:3000` là trái tim của reverse proxy — toàn bộ traffic vào port 80 được chuyển tiếp đến process Node.js trên port 3000 nội bộ.

##### Tại sao dùng 127.0.0.1 thay vì localhost trong proxy_pass?

Dùng `127.0.0.1` ép IPv4 resolution và tránh một bug tinh vi: trên hệ thống bật IPv6, `localhost` có thể resolve thành `::1` (IPv6 loopback) trong khi app Node.js chỉ lắng nghe IPv4 — gây lỗi connection refused dù cả Nginx lẫn Node.js đều đang chạy bình thường.

#### Bước 5 — Deploy React Build Tĩnh Với Nginx

React (và các SPA framework khác như Vue, Next.js static export) nên được serve dưới dạng file tĩnh đã build sẵn — không proxy qua Node.js. Cách này nhanh hơn đáng kể và không tốn tài nguyên app server.

Build React app trên server hoặc trong CI pipeline:

```bash
cd /var/www/your-react-app
npm install
npm run build
# Output nằm trong /var/www/your-react-app/build (CRA) hoặc /dist (Vite)
```

Tạo cấu hình Nginx để serve static build và tùy chọn proxy API calls về Node.js backend:

```bash
sudo nano /etc/nginx/sites-available/app.yourdomain.com
```

```nginx
server {
    listen 80;
    server_name app.yourdomain.com;

    # Thư mục gốc — trỏ đến output build của React
    root /var/www/your-react-app/build;
    index index.html;

    access_log /var/log/nginx/react-app.access.log;
    error_log  /var/log/nginx/react-app.error.log;

    # Serve React app — xử lý client-side routing
    # Không có dòng này, refresh trên /dashboard sẽ trả 404
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy request /api về Node.js backend
    # React app gọi /api/users -> chuyển tiếp đến Node.js port 3000
    location /api {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Cache mạnh cho static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires    1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Directive `try_files $uri $uri/ /index.html` cực kỳ quan trọng cho React Router. Không có nó, khi user truy cập trực tiếp vào `/dashboard` sẽ nhận 404 vì Nginx tìm file tên `dashboard` trên disk không thấy. Dòng này nói với Nginx: nếu file không tồn tại, serve `index.html` và để React Router tự xử lý routing phía client.

#### Bước 6 — Bật HTTPS Miễn Phí Với Let's Encrypt

Không bao giờ chạy app production trên HTTP thuần. Let's Encrypt cấp SSL certificate miễn phí qua **Certbot**, công cụ này cũng tự cấu hình Nginx luôn:

```bash
# Cài Certbot và Nginx plugin
sudo apt install -y certbot python3-certbot-nginx

# Cho phép HTTPS qua firewall
sudo ufw allow 'Nginx Full'

# Cấp certificate và tự cấu hình Nginx
# Thay bằng domain thực của bạn
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Làm theo hướng dẫn:
*   Nhập email để nhận thông báo gia hạn
*   Đồng ý điều khoản dịch vụ
*   Chọn redirect (option 2) để ép toàn bộ HTTP sang HTTPS

Certbot tự sửa file cấu hình Nginx để thêm HTTPS và redirect HTTP sang HTTPS. Certificate có hiệu lực 90 ngày, Certbot cài systemd timer để tự gia hạn trước khi hết hạn. Kiểm tra tự gia hạn với:

```bash
sudo certbot renew --dry-run
```

#### Bước 7 — Chạy Nhiều App Node.js Trên Một Server

Một trong những lợi thế lớn nhất của Nginx: chạy nhiều app trên cùng một server, mỗi app một domain hoặc subdomain riêng, mỗi app một port nội bộ riêng. Tạo file config riêng cho từng app:

```bash
# App 1 — API trên port 3000
sudo nano /etc/nginx/sites-available/api.yourdomain.com

# App 2 — Admin panel trên port 4000
sudo nano /etc/nginx/sites-available/admin.yourdomain.com

# App 3 — React frontend (file tĩnh)
sudo nano /etc/nginx/sites-available/app.yourdomain.com
```

Ví dụ chạy hai Node.js API riêng biệt cùng lúc:

```nginx
# /etc/nginx/sites-available/api.yourdomain.com
server {
    listen 80;
    server_name api.yourdomain.com;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```nginx
# /etc/nginx/sites-available/admin.yourdomain.com
server {
    listen 80;
    server_name admin.yourdomain.com;
    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Bật cả hai và reload:

```bash
sudo ln -s /etc/nginx/sites-available/api.yourdomain.com /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/admin.yourdomain.com /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

#### Lỗi Thường Gặp Và Cách Sửa

*   **502 Bad Gateway:** Nginx đang chạy nhưng không kết nối được đến app Node.js. Kiểm tra PM2 có đang chạy không (`pm2 list`), xác nhận số port trong `proxy_pass` khớp với port app thực sự lắng nghe, xem log app với `pm2 logs`.
*   **404 khi refresh hoặc truy cập URL trực tiếp trong React:** Thiếu `try_files $uri $uri/ /index.html` trong location block. Thêm vào cho bất kỳ SPA nào được serve dưới dạng file tĩnh.
*   **Permission denied trên /var/www/:** File có thể đang thuộc sở hữu của root. Sửa bằng `sudo chown -R $USER:$USER /var/www/your-app`.
*   **nginx -t báo lỗi:** Đọc kỹ output lỗi — nó chỉ đúng file và dòng bị lỗi. Nguyên nhân thường gặp: thiếu dấu chấm phẩy, sai dấu ngoặc nhọn, typo trong tên directive.
*   **App không tự khởi động sau khi server reboot:** Chạy `pm2 startup`, thực thi lệnh nó in ra với quyền root, sau đó `pm2 save`. Bước này đăng ký PM2 như một systemd service.
*   **Lỗi CORS khi React app gọi /api:** Khi React và API cùng domain (frontend proxy qua Nginx về Node.js), không cần CORS. Nếu khác domain, thêm CORS headers trong Express app: `app.use(cors({ origin: 'https://app.yourdomain.com' }))`.
*   **req.ip luôn trả về 127.0.0.1 thay vì IP thực:** Thêm `app.set('trust proxy', 1)` vào Express app. Dòng này báo Express đọc IP thực từ header `X-Forwarded-For` mà Nginx set.

#### Câu Hỏi Thường Gặp

##### Hỏi: Có cần PM2 không nếu đang dùng Docker?

**Đáp:** Không. Docker tự quản lý vòng đời process — nếu container crash, Docker restart lại (với flag `--restart unless-stopped`). Bên trong Docker container, chạy Node.js trực tiếp làm main process (`CMD ["node", "app.js"]`). PM2 dành cho deployment trên VPS hoặc bare-metal không có container hóa.

##### Hỏi: Next.js deploy giống Node.js không hay khác?

**Đáp:** Giống, nhưng cần phân biệt một điểm. Next.js production chạy như Node.js server (`npm run start` trên port 3000 mặc định) — `proxy_pass` về nó y hệt Node.js app thông thường. Nếu dùng `next export` để xuất ra file tĩnh hoàn toàn, serve như ví dụ React static ở trên. Với App Router dùng server components, luôn dùng chế độ Node.js server.

##### Hỏi: Deploy code mới mà không muốn app bị downtime thì làm thế nào?

**Đáp:** Pull code mới, cài dependencies, sau đó dùng `pm2 reload` thay vì `pm2 restart` để deploy zero-downtime: `git pull && npm install --production && pm2 reload my-node-app`. PM2 reload xoay vòng các worker lần lượt, giữ app vẫn nhận traffic trong suốt quá trình.

##### Hỏi: App Node.js nên lắng nghe trên port nào?

**Đáp:** Bất kỳ port nào trên 1024 mà chưa bị dùng — 3000, 4000, 5000, 8000 đều là lựa chọn phổ biến. Kiểm tra port đang dùng bằng `sudo ss -tlnp`. Port bên ngoài (80/443) do Nginx xử lý hoàn toàn — app Node.js không cần biết đến chúng.

##### Hỏi: Đặt biến môi trường cho production thế nào?

**Đáp:** Tạo file `.env` trong thư mục app và dùng thư viện `dotenv`, hoặc truyền biến trực tiếp qua PM2 ecosystem file. Tạo `ecosystem.config.js` ở root project và chạy `pm2 start ecosystem.config.js`. Cách này tách biệt cấu hình môi trường khỏi code ứng dụng và dễ quản lý riêng cho từng môi trường dev, staging, production. Tham khảo thêm về cách cấu hình CI/CD tự động deploy Node.js với GitHub Actions để hoàn thiện quy trình.

#### Tổng Kết — Stack Triển Khai Đã Sẵn Sàng Cho Production

Bạn vừa có đầy đủ stack triển khai hoàn chỉnh: Node.js chạy dưới PM2, Nginx làm reverse proxy xử lý toàn bộ traffic công khai qua `proxy_pass`, HTTPS được đảm bảo bởi Let's Encrypt, React static assets được Nginx serve trực tiếp, và khả năng host nhiều app trên một server duy nhất. Đây là stack mà đa số deployment Node.js production trên thế giới đang dùng.

**Bước tiếp theo:** Thiết lập script deploy tự động — một shell script hoặc GitHub Action SSH vào server, pull code mới nhất, chạy `npm install` và gọi `pm2 reload`. Tự động hóa deployment từ ngày đầu loại bỏ lỗi thủ công và làm cho mỗi lần cập nhật chỉ mất vài giây thay vì vài phút.

> Xem thêm: [Deploy PHP, Laravel, CodeIgniter Lên Linux VPS Với Nginx](/deploy-php-laravel-codeigniter-len-linux-vps-voi-nginx)
