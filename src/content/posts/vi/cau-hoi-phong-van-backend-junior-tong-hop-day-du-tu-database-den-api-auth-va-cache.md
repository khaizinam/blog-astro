---
title: "Câu Hỏi Phỏng Vấn Backend Junior: Tổng Hợp Đầy Đủ Từ Database Đến API, Auth và Cache"
author: KhaiziNam
pubDatetime: 2026-04-01T13:48:29.000Z
slug: cau-hoi-phong-van-backend-junior-tong-hop-day-du-tu-database-den-api-auth-va-cache
lang: vi
translationKey: post-211
featured: false
draft: false
tags:
  - "SeriesPhongVan"
description: "Bạn sắp phỏng vấn vị trí backend junior nhưng không biết trọng tâm nằm ở đâu? Bài viết tổng hợp 30+ câu hỏi phỏng vấn backend junior thực tế nhất — từ REST API, database, authentication đến caching — kèm phân tích sâu và gợi ý trả lời để bạn tự tin pass mọi vòng kỹ thuật."
---

Bạn sắp phỏng vấn vị trí backend junior nhưng không biết trọng tâm nằm ở đâu? Bài viết tổng hợp 30+ câu hỏi phỏng vấn backend junior thực tế nhất — từ REST API, database, authentication đến caching — kèm phân tích sâu và gợi ý trả lời để bạn tự tin pass mọi vòng kỹ thuật.

Vị trí backend junior là một trong những vị trí bị hỏi rộng nhất trong ngành IT. Không chỉ một ngôn ngữ, không chỉ một framework — nhà tuyển dụng muốn thấy bạn hiểu hệ thống hoạt động ra sao, dữ liệu di chuyển như thế nào, và bạn suy nghĩ về bảo mật từ đầu hay chỉ vá víu sau. Bài viết này sẽ cho bạn bức tranh toàn cảnh đó.

### Mục Lục

1\. [Bản chất của phỏng vấn backend junior](#vi-bk1)

2\. [Nhóm câu hỏi về REST API và thiết kế API](#vi-bk2)

3\. [Nhóm câu hỏi về Database và SQL](#vi-bk3)

4\. [Nhóm câu hỏi về Authentication và bảo mật](#vi-bk4)

5\. [Nhóm câu hỏi về Caching và hiệu năng](#vi-bk5)

6\. [Case study: buổi phỏng vấn backend thực tế](#vi-bk6)

7\. [Sai lầm phổ biến khi trả lời câu hỏi backend](#vi-bk7)

8\. [Hỏi đáp nhanh](#vi-bk8)

* * *

#### Bản Chất Của Phỏng Vấn Backend Junior

Nhiều bạn chuẩn bị phỏng vấn backend bằng cách học thuộc lý thuyết — định nghĩa REST, các câu SQL cơ bản, vài dòng về JWT. Cách tiếp cận này thường sụp đổ ngay khi interviewer hỏi tiếp một câu: **"Vậy thực tế bạn đã làm điều đó trong dự án nào chưa?"**

Phỏng vấn backend junior không phải bài kiểm tra trí nhớ. Đó là cuộc trò chuyện để đánh giá xem bạn có tư duy hệ thống hay không — bạn nghĩ đến edge case chưa, bạn biết lý do tại sao lại chọn cách này thay vì cách kia, và quan trọng nhất, bạn có thể giải thích cho người khác hiểu.

Cấu trúc kỹ thuật của một buổi phỏng vấn backend junior thường xoay quanh bốn trụ cột: **API design**, **database**, **authentication**, và **caching/performance**. Nắm chắc bốn nhóm này, bạn đã cover được 80% nội dung của hầu hết mọi buổi phỏng vấn.

#### Nhóm Câu Hỏi Về REST API Và Thiết Kế API

##### REST API là gì và các nguyên tắc cốt lõi?

Đây là câu hỏi mở màn phổ biến nhất. Câu trả lời yếu là liệt kê định nghĩa. Câu trả lời mạnh là giải thích được **tại sao** REST lại được thiết kế như vậy — Stateless giúp scale dễ hơn, resource-based URL giúp API dễ đọc hơn, HTTP verb có semantic rõ ràng hơn.

Năm nguyên tắc cần thuộc lòng: Stateless, Client-Server, Cacheable, Uniform Interface, Layered System. Bonus nếu bạn nhắc đến Code-on-Demand.

##### HTTP methods — khi nào dùng PUT, khi nào dùng PATCH?

**PUT** thay thế toàn bộ resource. Nếu bạn PUT một user mà không gửi trường email, email đó bị xóa. **PATCH** chỉ cập nhật các trường được gửi lên. Trong thực tế, đa số API hiện đại dùng PATCH cho update vì ít rủi ro hơn và tiết kiệm bandwidth. Interviewer rất thích khi bạn nhắc đến trade-off này.

##### HTTP status code — các mã quan trọng cần nắm

Không cần nhớ hết 50+ mã, nhưng phải rõ ràng về: 200 (OK), 201 (Created), 204 (No Content), 400 (Bad Request — lỗi từ client), 401 (Unauthorized — chưa xác thực), 403 (Forbidden — đã xác thực nhưng không có quyền), 404 (Not Found), 409 (Conflict), 422 (Unprocessable Entity), 429 (Too Many Requests), 500 (Server Error).

Sai lầm phổ biến nhất: dùng 401 và 403 lẫn lộn. **401 là bạn chưa đăng nhập. 403 là bạn đã đăng nhập nhưng không có quyền.**

##### API versioning — làm thế nào để không break client cũ?

Ba cách phổ biến: URL versioning (`/api/v1/users`), Header versioning (`Accept: application/vnd.app.v1+json`), Query param (`?version=1`). URL versioning được dùng nhiều nhất vì dễ debug và dễ hiểu. Interviewer thường hỏi thêm: "Bạn sẽ deprecate một version như thế nào?" — câu trả lời chuẩn là thông báo trước, giữ version cũ ít nhất 6 tháng, và trả về Deprecation header trong response.

##### Idempotency là gì và tại sao quan trọng?

Một request được gọi là idempotent nếu gọi nhiều lần cho kết quả giống nhau. GET, PUT, DELETE là idempotent. POST thì không — POST tạo mới, gọi hai lần tạo ra hai record. Hiểu idempotency giúp bạn thiết kế retry logic an toàn trong hệ thống phân tán, một topic mà nhiều junior bỏ qua.

#### Nhóm Câu Hỏi Về Database Và SQL

##### Index trong database hoạt động như thế nào?

Index là cấu trúc dữ liệu phụ (thường là B-Tree) giúp database tìm kiếm nhanh hơn mà không cần scan toàn bộ bảng. **Trade-off quan trọng cần nêu:** index tăng tốc SELECT nhưng làm chậm INSERT/UPDATE/DELETE vì database phải cập nhật cả index. Không nên index mọi column — chỉ index các column thường xuyên xuất hiện trong WHERE, JOIN, hoặc ORDER BY.

##### JOIN types — INNER, LEFT, RIGHT, FULL OUTER khác nhau thế nào?

**INNER JOIN**: chỉ trả về row tồn tại ở cả hai bảng. **LEFT JOIN**: trả về tất cả row ở bảng trái, NULL nếu không có match ở bảng phải. **RIGHT JOIN**: ngược lại. **FULL OUTER JOIN**: trả về tất cả row từ cả hai bảng, NULL ở phía không match.

Interviewer thường cho một schema đơn giản và hỏi bạn viết query. Đừng chỉ học lý thuyết — luyện viết query thực tế trên SQLFiddle hoặc DB Fiddle.

##### Transaction và ACID là gì?

Transaction là một nhóm thao tác được thực hiện như một đơn vị nguyên tử. ACID là bốn tính chất đảm bảo tính toàn vẹn dữ liệu: **Atomicity** (toàn bộ thành công hoặc toàn bộ rollback), **Consistency** (dữ liệu luôn ở trạng thái hợp lệ), **Isolation** (các transaction không ảnh hưởng nhau trong khi chạy), **Durability** (dữ liệu đã commit sẽ không mất dù có crash).

##### N+1 problem là gì và cách fix?

N+1 xảy ra khi bạn query một list N item, rồi với mỗi item lại query thêm một lần nữa để lấy related data — tổng cộng N+1 query. Với N=100, bạn đang bắn 101 query vào database thay vì 2. Fix: dùng **eager loading** (JOIN hoặc IN clause để lấy tất cả related data trong một query), hoặc dùng DataLoader pattern trong GraphQL.

##### SQL vs NoSQL — khi nào chọn cái nào?

SQL phù hợp khi data có cấu trúc rõ ràng, cần ACID transaction, và quan hệ giữa các bảng phức tạp (tài chính, e-commerce, ERP). NoSQL phù hợp khi data unstructured hoặc semi-structured, cần scale horizontal dễ dàng, hoặc cần schema linh hoạt (real-time analytics, catalog sản phẩm đa dạng, chat). Câu trả lời đúng nhất là "tùy use case" — nhưng phải giải thích được tại sao.

#### Nhóm Câu Hỏi Về Authentication Và Bảo Mật

##### Session vs JWT — khác nhau ở điểm cốt lõi nào?

**Session** là stateful — server lưu trạng thái phiên đăng nhập, client chỉ giữ session ID. **JWT** là stateless — toàn bộ thông tin user được mã hóa trong token, server không cần lưu gì. JWT dễ scale hơn vì bất kỳ server instance nào cũng có thể verify token mà không cần share session store. Nhược điểm của JWT: không thể invalidate ngay lập tức trước khi hết hạn.

Xem chi tiết tại [Session vs JWT phỏng vấn — lý thuyết đầy đủ và câu hỏi thực tế](/session-vs-jwt-toan-bo-ly-thuyet-va-cau-hoi-phong-van-hay-gap-nhat-ma-junior-can-nam-chac) để nắm vững topic này trước buổi phỏng vấn.

##### OAuth 2.0 là gì — giải thích flow cơ bản?

OAuth 2.0 là authorization framework cho phép một application truy cập resource của user trên service khác mà không cần biết password. Flow phổ biến nhất (Authorization Code): user redirect đến authorization server → đăng nhập và grant permission → nhận authorization code → exchange code lấy access token → dùng access token gọi API. Đây là flow của "Đăng nhập bằng Google/Facebook".

##### Làm thế nào để bảo vệ API khỏi các tấn công phổ biến?

*   **SQL Injection:** Dùng prepared statements hoặc ORM, không bao giờ concatenate user input vào SQL query.
*   **XSS:** Sanitize và escape output, dùng Content-Security-Policy header.
*   **CSRF:** Dùng CSRF token hoặc SameSite cookie attribute.
*   **Rate limiting:** Giới hạn số request per IP/user để chống brute force và DDoS.
*   **HTTPS:** Luôn dùng TLS, không truyền sensitive data qua HTTP.

#### Nhóm Câu Hỏi Về Caching Và Hiệu Năng

##### Caching là gì và các tầng cache trong hệ thống web?

Cache là lớp lưu trữ trung gian giúp phục vụ data nhanh hơn bằng cách tránh tính toán hoặc query lặp đi lặp lại. Các tầng cache phổ biến trong hệ thống web: **Browser cache** (Cache-Control header), **CDN cache** (Cloudflare, AWS CloudFront), **Application cache** (Redis, Memcached), **Database cache** (query cache, buffer pool).

##### Redis dùng để làm gì trong backend?

Redis là in-memory data store cực nhanh, thường được dùng cho: cache (giảm load database), session storage (thay thế server-side session), rate limiting (INCR + EXPIRE), pub/sub messaging, và job queue. **Điểm quan trọng cần nêu:** Redis là volatile by default — nếu server restart mà không config persistence, data sẽ mất. Với data quan trọng cần dùng RDB snapshot hoặc AOF logging.

Đọc thêm về Các bài viết chủ đề [Series Phỏng vấn.](/tag/seriesphongvan)

##### Cache invalidation — vấn đề khó nhất của caching?

Cache invalidation là quyết định khi nào và làm thế nào để xóa/cập nhật data cũ trong cache. Ba chiến lược phổ biến: **TTL (Time-To-Live)** — cache tự hết hạn sau một khoảng thời gian; **Cache-aside** — application tự quản lý, đọc từ cache trước, miss thì query DB rồi write vào cache; **Write-through** — mỗi lần write DB thì đồng thời update cache. Không có chiến lược nào hoàn hảo — mỗi cái có trade-off riêng.

##### Database connection pooling là gì và tại sao cần?

Mỗi kết nối đến database tốn chi phí — time-handshake, memory allocation, thread. Tạo connection mới cho mỗi request là cực kỳ tốn kém. Connection pool duy trì một tập hợp connection sẵn có, tái sử dụng chúng cho nhiều request. Không cấu hình pool đúng là nguyên nhân phổ biến khiến backend bị chết khi traffic tăng đột biến.

#### Case Study: Buổi Phỏng Vấn Backend Thực Tế

Tuấn ứng tuyển vị trí backend junior tại một fintech startup. Tech stack của công ty là Node.js + PostgreSQL + Redis. Buổi phỏng vấn kỹ thuật kéo dài 75 phút với một senior backend engineer.

Mười lăm phút đầu: câu hỏi về REST API và HTTP. Tuấn trả lời tốt về các HTTP method và status code, nhưng vấp khi bị hỏi về idempotency — lúc đầu giải thích lẫn lộn với stateless. Sau đó Tuấn thừa nhận nhầm và giải thích lại đúng hơn. **Điểm cộng: sửa sai thành thật thay vì cố bảo vệ câu trả lời sai.**

Ba mươi phút tiếp theo: live coding SQL. Interviewer cho schema gồm bảng users, orders, order\_items và yêu cầu viết query lấy top 5 user có tổng giá trị đơn hàng cao nhất trong tháng trước. Tuấn mất 8 phút nhưng ra được query đúng với GROUP BY, SUM, và LIMIT. Interviewer hỏi thêm: "Query này có dùng index không?" — Tuấn chỉ ra được column nào nên được index và tại sao.

Phần cuối: thiết kế endpoint để xử lý thanh toán. Tuấn chủ động đề cập đến idempotency key để tránh double charge khi client retry — đây là điểm ghi nhớ quan trọng với interviewer vì hầu hết junior không nghĩ đến điều này. **Kết quả: pass và nhận offer 12 triệu — cao hơn đề xuất ban đầu của công ty nhờ buổi phỏng vấn ấn tượng.**

#### Sai Lầm Phổ Biến Khi Trả Lời Câu Hỏi Backend

*   **Trả lời lý thuyết mà không có ví dụ thực tế:** "REST là stateless" nghe yếu hơn nhiều so với "Trong dự án X của tôi, chúng tôi chọn JWT thay vì session vì cần deploy lên nhiều server mà không cần share session store." Cách fix: luôn kết nối khái niệm với kinh nghiệm thực tế của bạn, dù chỉ là dự án cá nhân.
*   **Nhầm lẫn 401 và 403:** Lỗi này xuất hiện ở khoảng 40% ứng viên junior. Cách fix: nhớ đơn giản — 401 là "Bạn là ai?" (chưa xác thực), 403 là "Tôi biết bạn là ai nhưng bạn không được vào đây" (không có quyền).
*   **Không nêu trade-off khi so sánh:** Khi hỏi SQL vs NoSQL, câu trả lời "SQL tốt hơn" hoặc "NoSQL tốt hơn" đều sai. Cách fix: luôn trả lời theo format "Tùy use case — khi A thì dùng X vì... khi B thì dùng Y vì..."
*   **Im lặng khi không biết câu trả lời:** Silence trong phỏng vấn kỹ thuật là tín hiệu xấu nhất. Cách fix: nói to suy nghĩ của bạn — "Tôi chưa làm việc trực tiếp với topic này, nhưng dựa trên những gì tôi biết về X, tôi đoán là..."
*   **Không hỏi lại khi đề bài mơ hồ:** Khi được yêu cầu "thiết kế API cho hệ thống đặt hàng", đừng nhảy vào ngay. Hỏi: "Hệ thống này cần xử lý bao nhiêu request/giây? Có cần support mobile không?" Clarify requirements là kỹ năng senior, không phải điểm trừ của junior.
*   **Liệt kê công nghệ mà không giải thích lý do chọn:** "Tôi dùng Redis để cache" yếu hơn "Tôi dùng Redis vì query này tốn 200ms và được gọi 500 lần/phút, cache giúp giảm load xuống database đáng kể." Cách fix: với mỗi technical decision, luôn có context và lý do.
*   **Bỏ qua bảo mật khi thiết kế API:** Interviewer thường để ý xem bạn có chủ động đề cập đến authentication, authorization, và input validation không. Cách fix: với bất kỳ endpoint nào bạn thiết kế, hãy hỏi "Ai có thể gọi endpoint này? Data input cần validate gì?"

#### Hỏi Đáp Nhanh

##### Hỏi: Phỏng vấn backend junior có yêu cầu biết system design không?

**Đáp:** Ở cấp junior, system design thường không phải yêu cầu chính — nhưng biết cơ bản là lợi thế lớn. Interviewer có thể hỏi bạn "thiết kế API đơn giản" hoặc "nếu hệ thống có 1 triệu user bạn sẽ làm gì khác?" Không cần trả lời hoàn hảo như senior, nhưng cho thấy bạn suy nghĩ đến scalability là điểm cộng rõ ràng.

##### Hỏi: Có nên học cả SQL lẫn NoSQL trước khi phỏng vấn backend không?

**Đáp:** Ưu tiên SQL trước — hầu hết hệ thống vẫn dùng relational database và câu hỏi SQL xuất hiện ở gần như mọi buổi phỏng vấn backend. Với NoSQL, hiểu Redis ở mức cache và session là đủ cho junior. MongoDB hay Cassandra chỉ cần nếu job description có đề cập rõ ràng.

##### Hỏi: Nếu không nhớ một câu lệnh SQL cụ thể trong phỏng vấn, phải làm gì?

**Đáp:** Thừa nhận và giải thích logic. "Tôi không nhớ chính xác syntax của window function, nhưng tôi biết nó dùng để tính running total hoặc rank trong một partition — tôi sẽ dùng ROW\_NUMBER() OVER (PARTITION BY...)" — câu trả lời này cho thấy bạn hiểu concept dù không nhớ syntax, và interviewer đánh giá cao điều đó hơn là im lặng.

##### Hỏi: Backend junior có cần hiểu về microservices không?

**Đáp:** Biết khái niệm là cần, hiểu sâu là không bắt buộc. Bạn nên biết microservices là gì, trade-off so với monolith, và tại sao không phải lúc nào cũng nên dùng microservices. Điều này đủ để trả lời câu hỏi phỏng vấn ở cấp junior. Kinh nghiệm thực chiến với microservices thường đến sau khi bạn đã đi làm 1–2 năm.

##### Hỏi: Phỏng vấn backend có hay hỏi về Docker và CI/CD không?

**Đáp:** Ngày càng nhiều công ty hỏi về Docker ở cấp junior — đặc biệt các product company và startup. Bạn nên biết Docker là gì, image vs container, và có thể viết Dockerfile đơn giản. CI/CD thì biết khái niệm và đã từng dùng GitHub Actions hoặc GitLab CI là đủ. Nếu chưa có kinh nghiệm, hãy tự làm thử một pipeline đơn giản để có thể kể lại trong phỏng vấn.

#### Tổng Kết

**Phỏng vấn backend junior đánh giá tư duy hệ thống của bạn nhiều hơn là khả năng nhớ định nghĩa.** Nắm vững bốn nhóm — API design, database, authentication, và caching — rồi luyện giải thích từng topic bằng ngôn ngữ của chính mình, kết nối với dự án thực tế bạn đã làm.

Đừng cố học thuộc hết mọi câu hỏi. Thay vào đó, hiểu đủ sâu để có thể trả lời câu hỏi tiếp theo của interviewer sau câu trả lời đầu tiên của bạn — đó mới là thứ phân biệt ứng viên được nhận với ứng viên không được nhận.

Bước tiếp theo: đọc bài [Session vs JWT phỏng vấn](/session-vs-jwt-phong-van) và luyện viết SQL query thực tế trên ít nhất 20 bài tập trên LeetCode hoặc HackerRank SQL track trước buổi phỏng vấn.
