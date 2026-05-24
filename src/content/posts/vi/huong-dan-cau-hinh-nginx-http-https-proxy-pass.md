---
title: "Hướng dẫn Cấu hình Nginx: HTTP, HTTPS, Proxy Pass"
author: "Nguyễn Hữu Khải - khaizinam"
pubDatetime: 2026-01-08T13:47:42.000Z
slug: huong-dan-cau-hinh-nginx-http-https-proxy-pass
lang: vi
translationKey: post-159
featured: false
draft: false
tags:
  - "NgoaiLe"
description: "Khám phá cách cấu hình Nginx hiệu quả cho HTTP, HTTPS, Proxy Pass và chặn URL. Tối ưu website của bạn ngay hôm nay!"
---

### **Hướng dẫn Cấu hình Nginx: HTTP, HTTPS, Proxy Pass**

> Khám phá cách cấu hình Nginx hiệu quả cho HTTP, HTTPS, Proxy Pass và chặn URL. Tối ưu website của bạn ngay hôm nay!

Trong thế giới web hiện đại, việc sở hữu một máy chủ web mạnh mẽ và linh hoạt là yếu tố then chốt để đảm bảo hiệu suất và bảo mật cho website của bạn. Nginx, với kiến trúc bất đồng bộ và khả năng xử lý lưu lượng truy cập cao, đã trở thành lựa chọn hàng đầu của nhiều nhà phát triển và quản trị viên hệ thống. Bài viết này sẽ đi sâu vào **cách sử dụng Nginx**, giải thích các quy tắc cấu hình quan trọng như HTTP, HTTPS, proxypass, cache, và cách chặn các URL không mong muốn.

![Hướng dẫn Cấu hình Nginx: HTTP, HTTPS, Proxy Pass](https://cdn.khaizinam.io.vn/blogs/612493203-1455239526604230-4049589168133588422-n.jpg)

**Hướng dẫn Cấu hình Nginx: HTTP, HTTPS, Proxy Pass**

Hiểu rõ cách **cấu hình Nginx** không chỉ giúp bạn tối ưu hóa tốc độ tải trang mà còn tăng cường khả năng bảo vệ website khỏi các mối đe dọa. Chúng ta sẽ cùng nhau khám phá những khía cạnh cốt lõi của Nginx, từ những khái niệm cơ bản đến các kỹ thuật cấu hình nâng cao, giúp bạn làm chủ công cụ mạnh mẽ này.

Nếu bạn đang tìm kiếm giải pháp để cải thiện hiệu suất và bảo mật cho website, thì việc nắm vững **cấu hình Nginx** là bước đi không thể bỏ qua. Hãy cùng bắt đầu hành trình khám phá này!

#### Mục Lục

1\. [Nginx là gì?](#nginx-la-gi)

2\. [Lợi ích của việc sử dụng Nginx](#loi-ich-cua-viec-su-dung-nginx)

3\. [Các thành phần chính trong cấu hình Nginx](#cac-thanh-phan-chinh-trong-cau-hinh-nginx)

4\. [Hướng dẫn từng bước cấu hình Nginx](#huong-dan-tung-buoc-cau-hinh-nginx)

5\. [Sai lầm thường gặp khi cấu hình Nginx](#sai-lam-thuong-gap-khi-cau-hinh-nginx)

6\. [Câu hỏi thường gặp về Nginx](#cau-hoi-thuong-gap-ve-nginx)

* * *

### **Nginx là gì?**

Nginx (phát âm là "engine-x") là một máy chủ web mã nguồn mở, được biết đến với hiệu suất cao, khả năng mở rộng và tài nguyên hệ thống thấp. Nó không chỉ đóng vai trò là một máy chủ web mà còn có thể hoạt động như một bộ cân bằng tải, bộ proxy ngược (reverse proxy) và bộ nhớ đệm HTTP.

Đặc điểm nổi bật của Nginx là kiến trúc xử lý sự kiện bất đồng bộ. Thay vì tạo ra một tiến trình mới cho mỗi kết nối như các máy chủ web truyền thống, Nginx sử dụng một kiến trúc dựa trên luồng (event-driven) để xử lý hàng ngàn kết nối đồng thời với số lượng tiến trình tương đối nhỏ. Điều này giúp Nginx tiêu thụ ít bộ nhớ và CPU hơn, đặc biệt hiệu quả khi xử lý lưu lượng truy cập lớn.

### **Lợi ích của việc sử dụng Nginx**

Việc lựa chọn Nginx cho máy chủ web của bạn mang lại nhiều lợi ích đáng kể, góp phần nâng cao hiệu suất và trải nghiệm người dùng.

*   **Hiệu suất vượt trội:** Nhờ kiến trúc bất đồng bộ, Nginx có thể xử lý số lượng lớn kết nối đồng thời mà vẫn duy trì tốc độ phản hồi nhanh chóng. Ví dụ, một website sử dụng Nginx có thể phục vụ hàng triệu yêu cầu mỗi giây.
*   **Tiết kiệm tài nguyên:** Nginx tiêu thụ ít bộ nhớ và CPU hơn so với nhiều máy chủ web khác, giúp giảm chi phí vận hành, đặc biệt trên các máy chủ có tài nguyên hạn chế.
*   **Khả năng mở rộng linh hoạt:** Nginx dễ dàng mở rộng để đáp ứng nhu cầu ngày càng tăng của website. Bạn có thể thêm các máy chủ Nginx mới hoặc cấu hình chúng để hoạt động như bộ cân bằng tải.
*   **Bảo mật nâng cao:** Nginx hỗ trợ các giao thức bảo mật như SSL/TLS mạnh mẽ, giúp mã hóa dữ liệu truyền tải và bảo vệ website khỏi các cuộc tấn công.
*   **Bộ nhớ đệm hiệu quả:** Khả năng cache của Nginx giúp lưu trữ các tài nguyên tĩnh (hình ảnh, CSS, JavaScript) và phục vụ chúng nhanh hơn cho các yêu cầu tiếp theo, giảm tải cho máy chủ ứng dụng.

### **Các thành phần chính trong cấu hình Nginx**

Để hiểu rõ **cách sử dụng Nginx**, bạn cần nắm vững các khối cấu hình chính:

*   **`main` context:** Chứa các chỉ thị cấu hình toàn cục, ảnh hưởng đến hoạt động chung của Nginx, ví dụ như số lượng worker processes.
*   **`events` context:** Cấu hình các tùy chọn liên quan đến xử lý kết nối, như `worker_connections`.
*   **`http` context:** Đây là khối quan trọng nhất, chứa các cấu hình cho máy chủ web. Nó có thể chứa các khối con như `server` và `upstream`.
*   **`server` context:** Định nghĩa một máy chủ ảo. Bạn có thể có nhiều khối `server` để chạy nhiều website trên cùng một địa chỉ IP hoặc cổng.
*   **`location` context:** Bên trong khối `server`, `location` xác định cách Nginx xử lý các yêu cầu cho các URI (Uniform Resource Identifier) cụ thể.
*   **`upstream` context:** Được sử dụng để định nghĩa một nhóm các máy chủ backend, thường dùng cho việc cân bằng tải.

### **Hướng dẫn từng bước cấu hình Nginx**

Chúng ta sẽ đi qua các bước cấu hình cơ bản cho một website.

#### **1\. Cài đặt Nginx**

Quá trình cài đặt Nginx khác nhau tùy thuộc vào hệ điều hành của bạn. Trên các hệ thống dựa trên Debian/Ubuntu, bạn có thể chạy:

```bash
sudo apt update
sudo apt install nginx
```

Trên CentOS/RHEL, bạn dùng:

```bash
sudo yum update
sudo yum install nginx
```

#### **2\. Cấu hình HTTP cơ bản**

Tệp cấu hình chính của Nginx thường nằm ở `/etc/nginx/nginx.conf`. Các tệp cấu hình cho từng website thường được đặt trong thư mục `/etc/nginx/sites-available/` và được liên kết tượng trưng đến `/etc/nginx/sites-enabled/`.

Tạo một tệp cấu hình mới cho website của bạn, ví dụ: `/etc/nginx/sites-available/mywebsite.conf`:

```nginx
server {
    listen 80;
    server_name your_domain.com www.your_domain.com;
    root /var/www/mywebsite/html;
    index index.html index.htm;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

Sau đó, kích hoạt cấu hình này bằng cách tạo liên kết tượng trưng:

```bash
sudo ln -s /etc/nginx/sites-available/mywebsite.conf /etc/nginx/sites-enabled/
```

Kiểm tra cú pháp cấu hình và khởi động lại Nginx:

```bash
sudo nginx -t
sudo systemctl restart nginx
```

#### **3\. Cấu hình HTTPS**

Để bật HTTPS, bạn cần có chứng chỉ SSL/TLS. Bạn có thể lấy chứng chỉ miễn phí từ Let's Encrypt. Giả sử bạn đã có chứng chỉ tại `/etc/letsencrypt/live/your_domain.com/fullchain.pem` và `/etc/letsencrypt/live/your_domain.com/privkey.pem`.

Chỉnh sửa tệp cấu hình `mywebsite.conf`:

```nginx
server {
    listen 80;
    server_name your_domain.com www.your_domain.com;
    return 301 https://$host$request_uri; # Chuyển hướng HTTP sang HTTPS
}

server {
    listen 443 ssl http2;
    server_name your_domain.com www.your_domain.com;

    ssl_certificate /etc/letsencrypt/live/your_domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your_domain.com/privkey.pem;

    root /var/www/mywebsite/html;
    index index.html index.htm;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

Khởi động lại Nginx sau khi thay đổi.

#### **4\. Cấu hình Proxy Pass**

`proxy_pass` được sử dụng để chuyển tiếp các yêu cầu đến một máy chủ backend khác. Điều này rất hữu ích khi bạn có một ứng dụng web chạy trên một cổng hoặc máy chủ khác.

Ví dụ, để chuyển tiếp tất cả yêu cầu đến một ứng dụng Node.js chạy ở cổng 3000:

```nginx
location / {
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Các `proxy_set_header` quan trọng giúp máy chủ backend biết thông tin về yêu cầu gốc.

#### **5\. Cấu hình Cache**

Nginx có thể cache các phản hồi từ máy chủ backend hoặc các tệp tĩnh để tăng tốc độ. Bạn có thể sử dụng `proxy_cache_path` và `proxy_cache`.

Định nghĩa đường dẫn cache trong khối `http`:

```nginx
http {
    # ... các cấu hình khác ...
    proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m;

    server {
        # ... cấu hình server ...
        location / {
            proxy_pass http://localhost:3000;
            proxy_set_header Host $host;
            # ... các header khác ...

            proxy_cache my_cache; # Sử dụng zone cache đã định nghĩa
            proxy_cache_valid 200 302 10m; # Thời gian cache cho các mã 200, 302
            proxy_cache_valid 404 1m; # Thời gian cache cho mã 404
            add_header X-Cache-Status $upstream_cache_status; # Thêm header để kiểm tra cache
        }
    }
}
```

Hãy nhớ tạo thư mục `/var/cache/nginx` và cấp quyền ghi cho người dùng Nginx.

#### **6\. Chặn URL (Block URL)**

Bạn có thể chặn truy cập vào các URL cụ thể hoặc các mẫu URL bằng cách sử dụng khối `location` với điều kiện.

Ví dụ, chặn truy cập vào tệp `.env` nhạy cảm:

```nginx
location ~ /\.env {
    deny all;
    return 403;
}
```

Hoặc chặn các yêu cầu có chứa một chuỗi nhất định:

```nginx
location ~* "bad_pattern" {
    deny all;
    return 403;
}
```

Dấu `~` cho biết regex match, `~*` cho case-insensitive regex match, và `!` đảo ngược điều kiện.

### **Sai lầm thường gặp khi cấu hình Nginx**

Trong quá trình làm việc với Nginx, một số lỗi phổ biến có thể gây ra sự cố:

*   **Cú pháp cấu hình sai:** Thiếu dấu chấm phẩy (`;`) hoặc dấu ngoặc nhọn (`{}`) là lỗi rất thường gặp. Luôn chạy `nginx -t` để kiểm tra trước khi reload.
*   **Quyền truy cập tệp không đúng:** Nginx cần quyền đọc các tệp cấu hình, tệp website và quyền ghi vào thư mục cache.
*   **Sai đường dẫn `proxy_pass`:** Đảm bảo URL hoặc tên upstream trong `proxy_pass` là chính xác.
*   **Không cấu hình `proxy_set_header`:** Máy chủ backend có thể không nhận được thông tin IP gốc của người dùng, gây khó khăn cho việc ghi log hoặc áp dụng logic dựa trên IP.
*   **Cache không hoạt động như mong đợi:** Kiểm tra lại `proxy_cache_path`, `keys_zone`, `max_size` và `inactive`. Đảm bảo Nginx có quyền ghi vào thư mục cache.
*   **Bỏ qua việc chuyển hướng HTTP sang HTTPS:** Việc không chuyển hướng người dùng từ HTTP sang HTTPS làm giảm tính bảo mật.
*   **Sử dụng `root` thay vì `alias` sai ngữ cảnh:** `root` áp dụng cho tất cả các `location` con, trong khi `alias` chỉ thay thế một phần của URI.

### **Câu hỏi thường gặp về Nginx**

##### Hỏi: Nginx có thể thay thế hoàn toàn Apache không?

**Đáp:** Nginx thường được sử dụng như một reverse proxy phía trước Apache hoặc các máy chủ ứng dụng khác. Nó xuất sắc trong việc xử lý các kết nối tĩnh và cân bằng tải. Trong nhiều trường hợp, Nginx có thể xử lý toàn bộ yêu cầu web, nhưng việc kết hợp Nginx và Apache vẫn là một kiến trúc phổ biến.

##### Hỏi: Làm thế nào để xem log của Nginx?

**Đáp:** Tệp log truy cập (access log) và log lỗi (error log) của Nginx thường nằm trong `/var/log/nginx/`. Bạn có thể cấu hình đường dẫn và định dạng log trong tệp `nginx.conf`.

##### Hỏi: `worker_processes` nên được đặt bằng bao nhiêu?

**Đáp:** Giá trị phổ biến nhất là đặt bằng số lượng CPU core của máy chủ để tối ưu hóa hiệu suất.

##### Hỏi: Tôi có thể sử dụng Nginx để phục vụ file tĩnh và làm proxy cho ứng dụng cùng lúc không?

**Đáp:** Chắc chắn rồi. Bạn có thể sử dụng các khối `location` khác nhau để chỉ định cách xử lý cho các loại yêu cầu khác nhau. Một `location` có thể phục vụ tệp tĩnh từ `root`, trong khi một `location` khác sử dụng `proxy_pass`.

##### Hỏi: Làm thế nào để cấu hình Nginx để tránh bị tấn công DDoS cơ bản?

**Đáp:** Bạn có thể sử dụng các chỉ thị như `limit_req_zone`, `limit_conn_zone` để giới hạn số lượng yêu cầu và kết nối từ một địa chỉ IP. Việc cấu hình cache hiệu quả cũng giúp giảm tải cho máy chủ.

Nắm vững **cấu hình Nginx** là một kỹ năng quan trọng cho bất kỳ ai làm việc với web server. Từ việc thiết lập HTTP, HTTPS, đến việc sử dụng `proxy_pass` để kết nối với ứng dụng backend, và tận dụng `cache` để tăng tốc độ, Nginx cung cấp một bộ công cụ mạnh mẽ. Việc biết cách chặn các URL không mong muốn cũng góp phần bảo vệ website của bạn.

Nếu bạn cần hỗ trợ **SEO** hoặc **tối ưu website**, liên hệ [**khaizinam.io.vn**](/) để được tư vấn chuyên sâu.

Hãy tiếp tục thực hành và khám phá thêm các tính năng của Nginx để tối ưu hóa hiệu suất và bảo mật cho dự án của bạn.
