---
title: "Bỏ WordPress: Blog cá nhân gần như miễn phí với Astro + Cloudflare"
author: "Nguyễn Hữu Khải - khaizinam"
pubDatetime: 2026-05-25 00:00:00.00
slug: bo-wordpress-dung-astro-cloudflare-pages
lang: vi
translationKey: post-238
ogImage: https://cdn.khaizinam.io.vn/blog-folder/2026-05/bo-wordpress-sang-astro-cloudflare-pages.jpg
featured: true
draft: false
tags:
  - DevOps
  - cloudflare
description: "Tôi đã bỏ WordPress để dùng Astro + Cloudflare Pages + R2 nhằm giảm gần như toàn bộ chi phí hosting blog cá nhân, tránh malware, plugin lỗi và các vấn đề maintenance kéo dài nhiều năm."
---

Có một lúc tôi nhận ra mình đang trả tiền hosting hàng năm cho một blog cá nhân không tạo ra đồng nào - nhưng lại chiếm nhiều thời gian sửa chữa hơn là viết bài. WordPress không hỏng ngay lập tức. Nó hỏng từ từ, theo từng update, theo từng plugin conflict, theo từng lần site tự chậm mà không rõ lý do.

![Bỏ WordPress: Blog cá nhân gần như miễn phí với Astro + Cloudflare](https://cdn.khaizinam.io.vn/blog-folder/2026-05/bo-wordpress-sang-astro-cloudflare-pages.jpg)

Bỏ WordPress: Blog cá nhân gần như miễn phí với Astro + Cloudflare

Bài này không phải hướng dẫn kỹ thuật từ A-Z. Đây là góc nhìn thực tế của một developer đã dùng WordPress nhiều năm, từng thích nó, rồi dần mệt với nó - và cuối cùng tìm được stack nhẹ đầu hơn nhiều nhờ Astro, GitHub, Cloudflare Pages và R2.

**Mục lục**

- [1. Vấn đề thật sự của WordPress với blog cá nhân](#1-van-de-that-su-cua-wordpress-voi-blog-ca-nhan)
- [2. Chi phí âm thầm mà bạn không thấy ngay](#2-chi-phi-am-tham-ma-ban-khong-thay-ngay)
- [3. Tại sao static blog trước đây khó - và bây giờ thì không còn nữa](#3-tai-sao-static-blog-truoc-day-kho-va-bay-gio-thi-khong-con-nua)
- [4. Stack tôi đang dùng và lý do chọn từng thứ](#4-stack-toi-dang-dung-va-ly-do-chon-tung-thu)
- [5. So sánh thực tế: WordPress vs Astro + Cloudflare](#5-so-sanh-thuc-te-wordpress-vs-astro-cloudflare)
- [6. Những thứ WordPress vẫn làm tốt hơn](#6-nhung-thu-wordpress-van-lam-tot-hon)
- [7. 5 sai lầm tôi thấy người dùng hay mắc khi migrate](#7-5-sai-lam-toi-thay-nguoi-dung-hay-mac-khi-migrate)
- [8. FAQ](#8-faq)
- [9. Tại sao Cloudflare vẫn cho miễn phí nhiều tính năng?](#9-tai-sao-cloudflare-van-cho-mien-phi-nhieu-tinh-nang)
- [10. Tổng kết](#10-tong-ket)

#### 1. Vấn đề thật sự của WordPress với blog cá nhân

WordPress không phải phần mềm tệ. Nó mạnh, linh hoạt, có hệ sinh thái plugin khổng lồ. Vấn đề không nằm ở bản thân WordPress - mà nằm ở việc WordPress được thiết kế để làm được rất nhiều thứ, trong khi blog cá nhân chỉ cần một thứ duy nhất: đăng bài viết.

##### 1.1. Hệ thống quá nặng so với nhu cầu thực

Một blog WordPress nhỏ thường kéo theo PHP, MySQL, Redis, cache layer, backup system, security plugin, image optimization plugin và cronjob - tất cả chỉ để render text và ảnh. Đây là over-engineering điển hình. Bạn đang vận hành một hệ thống có độ phức tạp ngang SaaS mini chỉ để publish vài bài mỗi tháng.

##### 1.2. Pattern hỏng quen thuộc theo thời gian

Update plugin xong site lỗi. Plugin conflict. CPU tăng vô lý. Bot scan wp-login liên tục. Malware inject SEO spam. Backup càng lúc càng nặng. Site chậm dần. Hosting tăng giá. Mỗi thứ này xảy ra từng đợt, không dồn vào một lúc, nên bạn cứ sửa xong lại tiếp tục dùng - cho đến lúc tổng chi phí thời gian và tiền bạc vượt quá giá trị blog cá nhân đó tạo ra.

#### 2. Chi phí âm thầm mà bạn không thấy ngay

![Chi phí âm thầm mà bạn không thấy ngay](https://cdn.khaizinam.io.vn/blog-folder/2026-05/cloudflare-page-astro.jpg)

Chi phí âm thầm mà bạn không thấy ngay

##### 2.1. Chi phí tài chính cộng dồn

Hosting, backup, CDN, plugin premium, anti-malware, cache plugin - đôi khi cả VPS. Riêng lẻ từng thứ trông không lớn, nhưng cộng lại theo năm thì con số bắt đầu đáng kể, đặc biệt khi blog không tạo ra doanh thu.

##### 2.2. Chi phí thời gian - thứ không ai tính vào hoá đơn

Đây mới là phần đau nhất. Mỗi lần site có vấn đề, bạn mất 30 phút đến vài tiếng để debug. Nhân với số lần trong một năm, tổng thời gian đủ để viết thêm chục bài blog có giá trị hơn nhiều. Tôi từng dành nhiều thời gian sửa blog hơn là viết blog - và đó là dấu hiệu rõ ràng nhất cho thấy hệ thống đang phản tác dụng.

##### 2.3. Chi phí tâm lý - stress khi update

Nỗi sợ mỗi lần bấm "Update All". Cảm giác phải kiểm tra lại toàn bộ site sau mỗi update WordPress core. Đây là loại chi phí không có trong invoice nhưng tích tụ dần và ảnh hưởng đến việc bạn có muốn tiếp tục viết blog hay không.

#### 3. Tại sao static blog trước đây khó - và bây giờ thì không còn nữa

##### 3.1. Rào cản cũ: phải biết code nhiều

Trước đây, muốn dùng Astro, Hugo hay bất kỳ static site generator nào, bạn cần biết frontend, React/Vue, Tailwind, build system và cách deploy. Đó là lý do phần lớn người dùng blog cá nhân không kỹ thuật chọn WordPress - nó có giao diện quen, plugin cài một click, không cần đụng terminal.

##### 3.2. AI đã thay đổi rào cản đó

Bây giờ tôi chỉ cần mô tả layout muốn gì, paste lỗi, yêu cầu AI chỉnh component hoặc sửa CSS - và nhận lại code chạy được. AI không biến bạn thành senior frontend engineer, nhưng nó đủ để giúp bạn maintain theme Astro, sửa UI, thêm component, fix responsive và tối ưu SEO cơ bản. Khoảng cách kỹ thuật giữa "muốn blog riêng" và "có blog riêng chạy tốt" vừa được thu hẹp đáng kể.

##### 3.3. Đây là xu hướng đang tăng mạnh năm 2026

Nhóm người đang chuyển khỏi WordPress không phải nhóm muốn học Astro. Họ là nhóm chán WordPress. Và AI đang là yếu tố quyết định giúp họ thực sự migrate thay vì chỉ nghĩ đến rồi thôi.

#### 4. Stack tôi đang dùng và lý do chọn từng thứ

##### 4.1. Astro - static output, ít JavaScript, không database

Astro cho đúng thứ blog cá nhân cần: static output, rất nhanh, SEO tốt, ít JavaScript, ít attack surface, không cần database. Blog quay lại đúng nghĩa: HTML + CSS + content. Không có gì để hack ngoài file tĩnh.

##### 4.2. GitHub - backup, version control và rollback system

Tôi dùng GitHub như backup, version control, history và rollback system cùng một lúc. Nếu site hỏng: revert commit, deploy lại. Không còn cảnh restore backup, sửa database hay debug plugin. Đây là cách quản lý blog đơn giản nhất tôi từng dùng.

##### 4.3. Cloudflare Pages - xoá luôn phần hosting management

Push git là deploy. Không VPS, không cPanel, không nginx cần cấu hình tay, không patch server, không security hardening. Tốc độ nhanh hơn phần lớn shared hosting WordPress, và gần như miễn phí ở mức dùng blog cá nhân.

##### 4.4. Cloudflare R2 - image hosting nhẹ đầu

Không còn lưu ảnh trong WordPress media library, không lo đầy disk, không cần optimize image thủ công, không cần migrate uploads khi chuyển hosting. R2 biến image hosting thành thứ rất nhẹ đầu - và chi phí egress của R2 gần bằng 0 khi dùng với Cloudflare CDN.

#### 5. So sánh thực tế: WordPress vs Astro + Cloudflare

| Tiêu chí | WordPress.org | Astro + Cloudflare |
|---|---|---|
| Sở hữu dữ liệu | Có | Có |
| Dễ bị hack | Cao | Rất thấp |
| Bảo trì | Cao | Rất thấp |
| Tốc độ | Trung bình | Rất cao |
| Chi phí dài hạn | Cao | Gần như 0 |
| Custom theme | Cao | Cao (có AI hỗ trợ) |
| Phụ thuộc plugin | Nặng | Không |
| Stress khi update | Cao | Không có |

##### 5.1. Điểm khác biệt lớn nhất không phải là tốc độ

Tốc độ là lợi thế rõ ràng, nhưng không phải thứ tôi cảm nhận nhiều nhất sau khi migrate. Thứ tôi cảm nhận rõ nhất là sự vắng mặt của lo lắng - không còn nỗi sợ bấm update, không còn kiểm tra site mỗi sáng, không còn alert lúc 2 giờ sáng vì site down.

#### 6. Những thứ WordPress vẫn làm tốt hơn

##### 6.1. WordPress vẫn là lựa chọn đúng cho nhiều use case

News site, ecommerce, membership site, team content với nhiều tác giả, CMS phức tạp cần workflow phê duyệt - WordPress vẫn là lựa chọn hợp lý và mạnh. Không có công nghệ nào phù hợp với mọi bài toán.

##### 6.2. Blog cá nhân nhỏ là use case WordPress bắt đầu quá nặng

Khi nhu cầu chỉ là viết và publish bài, toàn bộ hệ sinh thái WordPress trở thành overhead. Đây không phải vấn đề của WordPress - đây là vấn đề của việc dùng sai công cụ cho đúng bài toán.

#### 7. 5 sai lầm tôi thấy người dùng hay mắc khi migrate

##### 7.1. Migrate toàn bộ content cũ trước khi có theme ổn định

Hầu hết người dùng bắt đầu bằng cách export toàn bộ WordPress content sang Astro ngay từ đầu. Kết quả: mất nhiều thời gian fix format, ảnh broken link, nội dung không đúng kiểu. Hướng đúng hơn: dựng theme ổn định, test với 5-10 bài trước, rồi mới migrate hàng loạt.

##### 7.2. Chọn template quá phức tạp rồi mắc kẹt khi customize

Astro có nhiều template đẹp nhưng phức tạp về cấu trúc component. Người mới chọn template xịn nhất rồi không biết sửa gì khi cần. Nên bắt đầu với template đơn giản nhất, hiểu cấu trúc cơ bản, rồi nâng dần - AI sẽ giúp phần còn lại.

##### 7.3. Không setup redirect từ URL cũ sang URL mới

WordPress và Astro thường có cấu trúc URL khác nhau. Nếu không redirect đúng, toàn bộ SEO tích lũy của blog cũ mất sạch trong vài tuần. Cloudflare Pages hỗ trợ redirect rules - setup trước khi chuyển DNS.

##### 7.4. Bỏ qua image optimization sau khi chuyển sang R2

Static site không có plugin auto-optimize ảnh như WordPress. Ảnh upload thẳng lên R2 mà không resize/compress trước sẽ làm Core Web Vitals tụt. Cần có workflow xử lý ảnh trước khi upload - dùng Squoosh, Sharp hoặc Cloudflare Image Resizing.

##### 7.5. Nghĩ rằng "không cần database" có nghĩa là không cần backup

File markdown trên GitHub đã là backup, nhưng nhiều người không commit đều đặn. Một thói quen commit sau mỗi bài viết là đủ để không bao giờ mất nội dung - đơn giản hơn nhiều so với backup WordPress nhưng cần làm có ý thức.

#### 8. FAQ

##### Tôi không biết code có dùng được Astro không?

Nếu bạn biết Git cơ bản và đã từng dùng ChatGPT để hỏi kỹ thuật, bạn đủ khả năng dùng Astro cho blog cá nhân. Phần khó nhất - setup ban đầu và customize theme - đều có thể làm với AI hỗ trợ. Bạn không cần biết React hay frontend chuyên sâu.

##### Chi phí thực tế của stack Astro + Cloudflare là bao nhiêu?

Với blog cá nhân traffic thấp đến trung bình: Cloudflare Pages miễn phí, R2 miễn phí đến 10GB storage và 1 triệu request/tháng, domain khoảng 200-300k/năm. Tổng chi phí gần như chỉ là tiền domain - so với WordPress có thể từ 1-5 triệu/năm tùy hosting.

##### Migrate từ WordPress sang Astro mất bao lâu?

Với blog dưới 50 bài: 1-2 tuần nếu làm sau giờ làm. Phần tốn thời gian nhất là chọn theme, setup theme và xử lý ảnh cũ. Phần migrate content thực ra khá nhanh nếu dùng script convert WordPress XML sang Markdown.

##### SEO có bị ảnh hưởng khi migrate không?

Có nguy cơ nếu không setup redirect đúng. Nếu redirect 301 đầy đủ từ URL cũ sang mới và giữ nguyên cấu trúc nội dung, SEO thường phục hồi sau 4-8 tuần. Static site thực ra có lợi thế lớn về Core Web Vitals so với WordPress - điểm PageSpeed thường tăng đáng kể sau migrate.

##### Viết bài trên Astro có bất tiện hơn WordPress không?

Khác, không hẳn bất tiện. WordPress có visual editor quen thuộc. Astro dùng Markdown - nhanh hơn khi đã quen, và dễ kết hợp với AI để viết và format nội dung. Nếu cần giao diện viết bài trực quan hơn, có thể kết hợp với Decap CMS hoặc Keystatic.

##### Cloudflare Pages miễn phí được trong bao lâu?

Vĩnh viễn cho đến khi Cloudflare tuyên bố phá sản.

##### Chịu được bao nhiêu lượt truy cập mỗi ngày?

Con số là rất lớn, hiệu năng còn tốt hơn server VPS thông thường của bạn. Mức 250.000 lượt truy cập mỗi ngày là chuyện rất bình thường.
> "250k lượt truy cập mỗi ngày vào trang web tĩnh của tôi mà chưa bao giờ bị gián đoạn." - *Theo Reddit.*

Thêm một nhận xét ấn tượng khác:
> "Một trong những khách hàng của mình host một số trang web sân bay, mỗi ngày nhận khoảng một triệu lượt truy cập và có thể vượt quá 50 triệu lượt trong 24 giờ khi thời tiết xấu.
> Mình đang dùng gói Pro để có thêm một số tính năng và chưa bao giờ gặp vấn đề gì với CF không xử lý nổi lượng truy cập.
> Ghi chú bên lề, kỷ lục của mình là trong lúc Crowdstrike bị lỗi, tất cả màn hình ở sân bay đều sập nên mọi người đều vào trang web để xem thông tin chuyến bay. Hôm đó mình đạt 1,8 tỷ lượt truy cập (lượt truy cập thực) và vẫn hoạt động suốt cả ngày." - *Theo Reddit.*

##### Dùng Astro có chịu được tấn công DDoS không?

Hoàn toàn có thể, thậm chí là cực kỳ tốt:
> "Một trong những website của mình dùng gói miễn phí của Cloudflare bị tấn công DDoS và nhận hơn 1.4 tỉ request mà vẫn ngon lành cành đào nên mấy vụ traffic nhiều cỡ nào cũng chẳng phải lo! Chả downtime gì cả và 99.9% request bị chặn/cache luôn!" - *Theo Reddit.*

##### Giới hạn số lần Build (triển khai) là bao nhiêu?

Tối đa 500 lần build/deploy mã mới lên Git mỗi tháng cho mỗi dự án.

##### Giới hạn số lượng tệp (files) là bao nhiêu?

Tối đa 20.000 tệp trên mỗi trang web. Đối với blog cá nhân dạng vừa và nhỏ, con số 10.000 bài post đã là quá tuyệt vời rồi, nên bạn hầu như không cần quan tâm đến giới hạn này.

##### Giới hạn kích thước tệp tối đa?

Dung lượng mỗi tệp không được vượt quá 25 MB. Để dễ hình dung, 25 MB tương đương với khoảng hơn 10 triệu chữ (với mỗi ký tự là 1 byte, văn bản thuần tuý). Đây là một bài viết nội dung cực kỳ lớn, chắc bài viết của bạn không bao giờ đạt tới mức đó đâu ha kkk.

##### Có giới hạn đối với Functions (Serverless) không?

Có, Cloudflare Pages cung cấp miễn phí 100.000 request chứa hàm xử lý dữ liệu mỗi ngày.

#### 9. Tại sao Cloudflare vẫn cho miễn phí nhiều tính năng?

Nhiều người nghĩ Cloudflare đang "đốt tiền" để kéo user, nhưng thực tế mô hình của họ ngược lại hoàn toàn: càng nhiều người dùng miễn phí, Cloudflare càng mạnh và càng giảm được chi phí vận hành.

Hiện tại khoảng 20% Internet nằm sau hệ thống của Cloudflare. Quy mô khổng lồ này khiến hàng nghìn ISP trên thế giới chủ động kết nối (peering) trực tiếp với họ thay vì đi qua các nhà mạng trung gian. Kết quả là Cloudflare giảm được rất nhiều chi phí bandwidth - vốn là khoản tốn kém nhất của một mạng CDN toàn cầu.

Ngoài ra, user free còn mang lại cho Cloudflare thứ cực kỳ giá trị:
- Dữ liệu traffic toàn cầu.
- Mẫu tấn công DDoS và bot mới.
- Môi trường QA thực tế ở quy mô Internet.
- Network effect giúp họ trở thành một phần hạ tầng mặc định của web.

Nói cách khác:
> Free tier của Cloudflare không phải hoạt động từ thiện.
> Nó là một phần trong chiến lược hạ tầng và tăng trưởng của họ.

Cloudflare chỉ giới hạn những loại traffic phá vỡ economics như video lớn hoặc streaming dung lượng cao. Còn với traffic web thông thường, lượng user miễn phí thực tế lại giúp họ tối ưu hệ thống tốt hơn, huấn luyện hệ thống bảo mật tốt hơn và mở rộng ảnh hưởng nhanh hơn.

Đó là lý do Cloudflare có thể tiếp tục cho miễn phí nhiều tính năng mà phần lớn dịch vụ khác sẽ tính phí rất sớm.

* Tham khảo [Reaffirming our commitment to free](https://blog.cloudflare.com/cloudflares-commitment-to-free/)

#### 10. Tổng kết

Tôi không bỏ WordPress vì ghét nó. Tôi bỏ vì cuối cùng nhận ra blog cá nhân không nên cần một hệ thống phức tạp đến vậy. Astro + GitHub + Cloudflare Pages + R2 không phải stack hoàn hảo cho mọi người - nhưng với blog cá nhân nhỏ, nó giải quyết đúng ba thứ tôi muốn: không maintenance, không tốn tiền, không mất ownership. AI lấp phần kỹ thuật còn lại. Điều duy nhất còn lại là viết - và đó là lý do tôi làm blog ngay từ đầu.