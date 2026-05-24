---
title: "Session vs JWT: Toàn Bộ Lý Thuyết Và Câu Hỏi Phỏng Vấn Hay Gặp Nhất Mà Junior Cần Nắm Chắc"
author: "Nguyễn Hữu Khải - khaizinam"
pubDatetime: 2026-03-19T19:26:34.000Z
slug: session-vs-jwt-toan-bo-ly-thuyet
lang: vi
translationKey: post-204
featured: true
draft: false
tags:
  - "SeriesPhongVan"
description: "Gần như 100% buổi phỏng vấn backend có hỏi về authentication — và câu hỏi kinh điển nhất vẫn là \"em phân biệt Session và JWT như thế nào, khi nào dùng cái nào?\" Nghe quen nhưng rất nhiều Junior trả lời sai hoặc trả lời đúng một nửa."
---

Gần như 100% buổi phỏng vấn backend có hỏi về authentication — và câu hỏi kinh điển nhất vẫn là "em phân biệt Session và JWT như thế nào, khi nào dùng cái nào?" Nghe quen nhưng rất nhiều Junior trả lời sai hoặc trả lời đúng một nửa. Bài này tôi tổng hợp lại toàn bộ lý thuyết cốt lõi, phân tích sâu từng điểm khác biệt, và liệt kê đúng những câu hỏi phỏng vấn thực tế xoay quanh chủ đề này — kèm câu trả lời chi tiết để bạn không bị bất ngờ.

### Mục Lục

1\. [Bản chất của Authentication — Tại sao cần Session hay JWT?](#ban-chat-cua-authentication-tai-sao-can-session-hay-jwt)

2\. [Session là gì — Cơ chế hoạt động và lưu trữ ở đâu](#session-la-gi-co-che-hoat-dong-va-luu-tru-o-dau)

3\. [JWT là gì — Cấu trúc, cơ chế và lưu trữ ở đâu](#jwt-la-gi-cau-truc-co-che-va-luu-tru-o-dau)

4\. [So sánh chi tiết Session vs JWT — Giống nhau, khác nhau](#so-sanh-chi-tiet-session-vs-jwt-giong-nhau-khac-nhau)

5\. [Khi nào dùng Session, khi nào dùng JWT](#khi-nao-dung-session-khi-nao-dung-jwt)

6\. [Những câu hỏi phỏng vấn thực tế và cách trả lời chuẩn](#nhung-cau-hoi-phong-van-thuc-te-va-cach-tra-loi-chuan)

7\. [Những sai lầm hay gặp khi implement và trả lời phỏng vấn](#nhung-sai-lam-hay-gap-khi-implement-va-tra-loi-phong-van)

8\. [FAQ — Câu hỏi đào sâu nhất về Session và JWT](#faq-cau-hoi-dao-sau-nhat-ve-session-va-jwt)

* * *

#### Bản Chất Của Authentication — Tại Sao Cần Session Hay JWT?

Trước khi so sánh, cần hiểu tại sao vấn đề này tồn tại. **HTTP là stateless** — mỗi request hoàn toàn độc lập, server không tự nhớ bạn đã đăng nhập ở request trước. Sau khi user nhập đúng username/password, server cần một cơ chế để **chứng minh danh tính** của user ở những request tiếp theo mà không bắt họ đăng nhập lại.

Đây là bài toán **Authentication State Management** — và có hai trường phái giải quyết hoàn toàn khác nhau về triết lý:

*   **Server-side state (Session):** Server lưu trạng thái đăng nhập, client chỉ giữ một cái "thẻ nhớ" để tra cứu.
*   **Client-side state (JWT):** Server không lưu gì, toàn bộ thông tin được mã hóa và gửi về cho client tự giữ.

Hiểu đúng triết lý này là nền tảng để trả lời mọi câu hỏi phỏng vấn liên quan. Mọi điểm khác biệt giữa Session và JWT đều bắt nguồn từ sự lựa chọn kiến trúc căn bản này.

#### Session Là Gì — Cơ Chế Hoạt Động Và Lưu Trữ Ở Đâu

![Session Là Gì — Cơ Chế Hoạt Động Và Lưu Trữ Ở Đâu](https://cdn.khaizinam.io.vn/blogs/session-la-gi.jpg)

Session Là Gì — Cơ Chế Hoạt Động Và Lưu Trữ Ở Đâu

**Session** là cơ chế trong đó server tạo ra một bản ghi lưu trạng thái đăng nhập của user, gán cho nó một ID ngẫu nhiên duy nhất (Session ID), rồi gửi Session ID đó về client qua cookie. Các request tiếp theo, client gửi kèm Session ID — server dùng ID đó để tra cứu bản ghi session và xác định đây là ai.

##### Luồng hoạt động của Session từng bước

1.  User gửi POST /login với username + password.
2.  Server xác thực credentials, nếu đúng thì tạo một session record: `{ user_id: 42, role: "admin", created_at: "..." }`
3.  Server lưu session record vào storage (file, database, Redis...) với key là Session ID ngẫu nhiên, ví dụ: `abc123xyz`
4.  Server trả về response với header `Set-Cookie: session_id=abc123xyz; HttpOnly; Secure`
5.  Browser tự động lưu cookie và gửi kèm mọi request tiếp theo.
6.  Server nhận request, đọc cookie lấy session\_id, tra cứu storage → biết đây là user 42 với role admin.
7.  Khi logout, server xóa session record khỏi storage → Session ID đó vô hiệu ngay lập tức.

##### Session lưu ở đâu — Phía server

Đây là câu hỏi phỏng vấn hay bị hỏi nhất trong phần Session. Session data được lưu **phía server**, không phải phía client. Client chỉ giữ Session ID (một chuỗi ngẫu nhiên vô nghĩa). Có nhiều lựa chọn storage cho session data:

*   **File system:** Mặc định trong nhiều framework (PHP mặc định lưu file `/tmp/sess_abc123`). Đơn giản, không cần cấu hình thêm. Nhược điểm: không share được giữa nhiều server instance — tức là không scale ngang được.
*   **Database (MySQL/PostgreSQL):** Lưu vào bảng `sessions`. Dễ query, dễ audit, dễ force logout. Nhược điểm: mỗi request cần query DB — tạo thêm latency.
*   **Redis (phổ biến nhất trong production):** In-memory, cực nhanh, có TTL tự động expire, dễ scale, share được giữa nhiều server instance. Đây là lựa chọn tiêu chuẩn cho hệ thống production cần scale ngang. Laravel dùng `SESSION_DRIVER=redis`.
*   **Memcached:** Tương tự Redis nhưng ít tính năng hơn. Ít phổ biến hơn trong các dự án mới.

##### Session ID lưu ở đâu — Phía client

Phía client, Session ID được lưu trong **cookie**. Cookie nên được thiết lập với các flag bảo mật:

*   **HttpOnly:** JavaScript không đọc được cookie này → chặn XSS tấn công đánh cắp Session ID.
*   **Secure:** Chỉ gửi qua HTTPS, không gửi qua HTTP → chặn man-in-the-middle.
*   **SameSite=Strict hoặc Lax:** Hạn chế gửi cookie theo cross-site request → giảm rủi ro CSRF.

// Laravel session config — config/session.php
'driver'    => env('SESSION\_DRIVER', 'redis'),
'lifetime'  => 120,          // phút
'expire\_on\_close' => false,
'encrypt'   => true,         // mã hóa session data trước khi lưu
'cookie'    => 'laravel\_session',
'secure'    => true,         // chỉ HTTPS
'http\_only' => true,         // không cho JS đọc
'same\_site' => 'lax',

#### JWT Là Gì — Cấu Trúc, Cơ Chế Và Lưu Trữ Ở Đâu

![JWT Là Gì — Cấu Trúc, Cơ Chế Và Lưu Trữ Ở Đâu](https://cdn.khaizinam.io.vn/blogs/jwt-la-gi.jpg)

JWT Là Gì — Cấu Trúc, Cơ Chế Và Lưu Trữ Ở Đâu

**JWT (JSON Web Token)** — đọc là "jot" — là một chuẩn mở ([RFC 7519](https://datatracker.ietf.org/doc/html/rfc7519)) định nghĩa cách truyền thông tin an toàn giữa các bên dưới dạng JSON object được ký số. Điểm cốt lõi: **server không lưu gì** — toàn bộ thông tin nằm trong token, server chỉ cần verify chữ ký để xác thực.

##### Cấu trúc của một JWT

JWT gồm 3 phần, ngăn cách bởi dấu chấm: `Header.Payload.Signature`

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
.
eyJ1c2VyX2lkIjo0Miwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzE2MDAwMDAwfQ
.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV\_adQssw5c

Mỗi phần là Base64Url encoded JSON:

**Header:** Chứa loại token và thuật toán ký.

{ "alg": "HS256", "typ": "JWT" }

**Payload (Claims):** Chứa thông tin user và metadata. Payload **không được mã hóa** — chỉ encoded Base64, ai cũng decode được. Không bao giờ để thông tin nhạy cảm như password vào đây.

{ "user\_id": 42, "role": "admin", "exp": 1716000000, "iat": 1715913600 }

**Signature:** Được tạo bằng cách ký Header + Payload với secret key. Đây là phần đảm bảo token không bị giả mạo — nếu ai thay đổi Payload, signature sẽ không còn khớp.

HMACSHA256(base64(header) + "." + base64(payload), SECRET\_KEY)

##### Luồng hoạt động của JWT từng bước

1.  User gửi POST /login với credentials.
2.  Server xác thực, tạo JWT với payload chứa user\_id, role, exp (expiry time), ký bằng secret key.
3.  Server trả token về cho client. **Server không lưu gì.**
4.  Client lưu token và gửi kèm mọi request tiếp theo trong header: `Authorization: Bearer <token>`
5.  Server nhận request, verify signature bằng secret key → nếu hợp lệ thì đọc payload, biết đây là user 42.
6.  Không cần query database hay bất kỳ storage nào để xác thực.

##### JWT lưu ở đâu — Phía client

Đây là câu hỏi nhiều người trả lời sai. JWT được lưu **phía client**, và có nhiều lựa chọn với trade-off khác nhau:

*   **localStorage / sessionStorage:** Đơn giản, JavaScript đọc dễ dàng. Nhưng đây là lựa chọn **kém bảo mật nhất** — XSS attack có thể đánh cắp token trực tiếp qua `localStorage.getItem('token')`. Không nên dùng cho production app xử lý dữ liệu nhạy cảm.
*   **HttpOnly Cookie:** Bảo mật hơn vì JavaScript không đọc được, chống XSS. Nhưng cookie tự động gửi kèm request → cần thêm CSRF protection. Đây là cách nhiều SPA hiện đại dùng để lưu JWT.
*   **In-memory (biến JavaScript):** Bảo mật nhất — không persist ở đâu, XSS không lấy được. Nhược điểm: refresh trang là mất token, user phải đăng nhập lại. Thường kết hợp với Refresh Token lưu trong HttpOnly Cookie để giải quyết vấn đề này.

Không có lựa chọn hoàn hảo — mỗi cách đánh đổi giữa bảo mật, UX và độ phức tạp implement. Đây chính là lý do câu hỏi này hay xuất hiện trong phỏng vấn senior hơn junior.

##### Access Token và Refresh Token

Trong thực tế, JWT thường dùng theo cặp để cân bằng bảo mật và UX:

*   **Access Token:** Thời gian sống ngắn (15 phút đến 1 giờ). Gửi kèm mọi API request. Nếu bị lộ, thiệt hại giới hạn trong thời gian ngắn.
*   **Refresh Token:** Thời gian sống dài (7 ngày đến 30 ngày). Lưu trong HttpOnly cookie. Chỉ dùng để xin Access Token mới khi Access Token hết hạn. Không dùng để gọi API.

// Laravel Sanctum / Passport — tạo token
$user = User::find(1);

// Access token — hết hạn sau 60 phút
$accessToken = $user->createToken('access-token', \['\*'\], now()->addHour())->plainTextToken;

// Refresh token — hết hạn sau 30 ngày
$refreshToken = $user->createToken('refresh-token', \['refresh'\], now()->addDays(30))->plainTextToken;

#### So Sánh Chi Tiết Session vs JWT — Giống Nhau, Khác Nhau

##### Điểm giống nhau

*   Cả hai đều giải quyết bài toán duy trì trạng thái đăng nhập trên nền HTTP stateless.
*   Cả hai đều có thể set thời gian hết hạn (expiry).
*   Cả hai đều cần HTTPS để bảo vệ khỏi bị đánh cắp trong quá trình truyền.
*   Cả hai đều là cơ chế xác thực — không phải cơ chế phân quyền (Authorization là tầng riêng phía trên).

##### Điểm khác nhau cốt lõi

*   **Lưu trữ state:** Session lưu state phía server (stateful). JWT không lưu state phía server (stateless). Đây là khác biệt căn bản nhất.
*   **Scalability:** Session cần shared storage (Redis) khi scale ngang — nhiều server cần cùng truy cập một session store. JWT không cần — mỗi server tự verify độc lập bằng secret key.
*   **Revocation (thu hồi):** Session có thể thu hồi ngay lập tức bằng cách xóa record trên server. JWT không thể thu hồi trước khi hết hạn nếu không có blacklist — đây là điểm yếu lớn nhất của JWT.
*   **Kích thước:** Session ID là một chuỗi ngắn (~32 ký tự). JWT thường dài hơn nhiều (vài trăm ký tự) vì mang payload — gửi kèm mọi request sẽ tốn bandwidth hơn.
*   **Thông tin chứa:** Session ID không chứa thông tin gì — chỉ là key để tra cứu. JWT chứa thông tin user trong payload — server đọc được ngay mà không cần query DB.
*   **Cross-domain:** Cookie (Session) bị hạn chế bởi Same-Origin Policy — khó dùng cross-domain. JWT trong Authorization header không bị giới hạn này — phù hợp cho API được gọi từ nhiều domain khác nhau.
*   **Server load:** Session cần I/O (Redis/DB lookup) mỗi request. JWT chỉ cần tính toán crypto verify — nhanh hơn, không cần I/O.
*   **Phù hợp với:** Session phù hợp với web app truyền thống (server render, monolith). JWT phù hợp với API, SPA, mobile app, microservices.

#### Khi Nào Dùng Session, Khi Nào Dùng JWT

Đây là câu hỏi không có đáp án tuyệt đối — phụ thuộc vào yêu cầu cụ thể của hệ thống. Tuy nhiên có các nguyên tắc rõ ràng để quyết định:

##### Dùng Session khi

*   **Web app truyền thống server-render:** MVC monolith như Laravel Blade, Rails, Django — Session + Cookie là lựa chọn tự nhiên và được framework hỗ trợ sẵn.
*   **Cần revoke ngay lập tức:** Hệ thống ngân hàng, admin panel, y tế — bất kỳ nơi nào cần force logout user ngay lập tức khi phát hiện bất thường. Với Session, chỉ cần xóa record là xong.
*   **Dữ liệu session thay đổi thường xuyên:** Role, permission của user thay đổi liên tục — với Session, server đọc data mới nhất mỗi request. Với JWT, token đã ký rồi thì không cập nhật được cho đến khi hết hạn.
*   **Chỉ có một domain:** App không cần chia sẻ authentication giữa nhiều domain hay subdomain — Session là đủ và đơn giản hơn.
*   **Team nhỏ, dự án đơn giản:** Session ít footgun hơn — ít điểm sai hơn khi implement, phù hợp khi bảo mật quan trọng nhưng team chưa có nhiều kinh nghiệm với JWT.

##### Dùng JWT khi

*   **API cho mobile app hoặc SPA:** Mobile app không có cookie browser tự nhiên — JWT trong Authorization header là standard. SPA gọi API từ domain khác — JWT không bị Same-Origin restriction.
*   **Microservices:** Service A cần xác thực request từ service B mà không cần cả hai share cùng session store. JWT cho phép mỗi service tự verify độc lập bằng public key.
*   **Scale ngang không có shared storage:** Serverless function, edge computing, nhiều server instance không share Redis — JWT stateless không cần shared storage.
*   **Third-party authentication (OAuth 2.0 / OIDC):** Google, Facebook, GitHub login đều dùng JWT (ID Token trong OpenID Connect). Nếu bạn integrate SSO hoặc OAuth, bạn sẽ làm việc với JWT.
*   **API public cho developer bên ngoài:** API key dạng JWT dễ embed thông tin scope, expiry mà không cần server lookup.

##### Trường hợp nên dùng cả hai kết hợp

Đây là pattern ít Junior biết nhưng rất phổ biến trong thực tế: **Session cho web app, JWT cho API**. Ví dụ: một hệ thống e-commerce có web app (dùng Session + Cookie) và mobile app + third-party API (dùng JWT). Cả hai chia sẻ cùng backend nhưng dùng cơ chế authentication khác nhau tùy client type.

Trong Laravel, đây là lý do có cả `auth:sanctum` (hỗ trợ cả Session-based và Token-based) và `auth:api` (JWT thuần).

#### Những Câu Hỏi Phỏng Vấn Thực Tế Và Cách Trả Lời Chuẩn

Đây là phần tôi tổng hợp lại từ kinh nghiệm thực tế — những câu hỏi thực sự xuất hiện trong buổi phỏng vấn, không phải câu hỏi sách vở.

##### Câu 1: "Em giải thích Session và JWT khác nhau như thế nào?"

Đây là câu mở đầu, nên trả lời bằng cách nhấn vào **triết lý kiến trúc** trước, rồi mới đến chi tiết kỹ thuật:

"Session là stateful — server lưu trạng thái đăng nhập, client chỉ giữ một cái ID để tra cứu. JWT là stateless — server không lưu gì, toàn bộ thông tin nằm trong token client giữ, server chỉ verify chữ ký. Từ sự khác biệt căn bản này dẫn đến các trade-off về scalability, revocation, và phù hợp với loại ứng dụng khác nhau."

##### Câu 2: "Session lưu ở đâu, JWT lưu ở đâu?"

Câu này có hai tầng cần trả lời rõ — phía server và phía client:

"Session data lưu phía server — có thể là file, database, hoặc Redis. Client chỉ lưu Session ID trong cookie. JWT không lưu gì phía server. Phía client, JWT có thể lưu trong localStorage, sessionStorage, hoặc HttpOnly cookie — mỗi cách có trade-off bảo mật khác nhau. Bảo mật nhất là in-memory kết hợp với Refresh Token trong HttpOnly cookie."

##### Câu 3: "Nếu user bị ban, làm thế nào để vô hiệu hóa token JWT ngay lập tức?"

Đây là câu hỏi bẫy — nhiều Junior không biết đây là điểm yếu cố hữu của JWT. Câu trả lời đúng:

"JWT không thể revoke trước khi hết hạn một cách thuần túy stateless. Có hai cách xử lý: Một là dùng short-lived access token (15 phút) — user bị ban thì tối đa 15 phút sau token tự hết hạn. Hai là maintain một JWT blacklist trên Redis — khi revoke, lưu jti (JWT ID) vào blacklist, mỗi request check xem jti có trong blacklist không. Cách hai về bản chất làm JWT trở thành semi-stateful, mất một phần lợi thế ban đầu."

##### Câu 4: "Tại sao không nên lưu JWT trong localStorage?"

"localStorage có thể bị đọc bởi bất kỳ JavaScript nào chạy trên trang — bao gồm cả mã độc inject qua XSS. Nếu app bị XSS, attacker chạy `localStorage.getItem('token')` là lấy được JWT ngay. Ngược lại, HttpOnly cookie không đọc được qua JavaScript — XSS không lấy được. Tuy nhiên HttpOnly cookie lại dễ bị CSRF hơn, nên cần thêm CSRF token protection."

##### Câu 5: "Payload của JWT có bị đọc không? Có an toàn không?"

"Payload của JWT chỉ được Base64Url encode, không mã hóa — ai cũng decode được. Tính bảo mật của JWT không nằm ở việc giữ payload bí mật, mà ở chữ ký (signature) — đảm bảo payload không bị giả mạo. Vì vậy tuyệt đối không lưu thông tin nhạy cảm như password, credit card vào JWT payload."

##### Câu 6: "Khi nào thì dùng Session, khi nào dùng JWT? Anh đang xây một admin panel nội bộ, em sẽ dùng cái nào?"

"Admin panel nội bộ, tôi sẽ dùng Session. Lý do: admin panel thường là web app server-render hoặc SPA trên cùng domain, không có yêu cầu cross-domain authentication. Quan trọng hơn, admin cần khả năng revoke session ngay lập tức — nếu phát hiện tài khoản bị xâm phạm, cần logout ngay, không thể đợi token hết hạn. Session cho phép làm điều đó đơn giản và an toàn hơn."

##### Câu 7: "HS256 và RS256 trong JWT khác nhau như thế nào?"

Câu này ít gặp ở Junior nhưng nếu bị hỏi:

"HS256 dùng symmetric key — cùng một secret key để ký và verify. Tất cả bên cần verify đều phải biết secret key — không phù hợp khi nhiều service cần verify độc lập. RS256 dùng asymmetric key — private key để ký (chỉ auth server biết), public key để verify (bất kỳ service nào cũng có thể có). Microservices thường dùng RS256 vì các service chỉ cần public key để verify mà không cần biết private key."

#### Những Sai Lầm Hay Gặp Khi Implement Và Trả Lời Phỏng Vấn

*   **Sai lầm 1: Lưu password hoặc thông tin nhạy cảm trong JWT payload.** Payload chỉ encode Base64, không mã hóa — ai cũng đọc được. Cách phòng tránh: chỉ lưu user\_id, role, exp vào payload. Thông tin nhạy cảm phải query từ DB khi cần.
*   **Sai lầm 2: Nghĩ JWT "bảo mật hơn" Session một cách tuyệt đối.** Không có cái nào bảo mật hơn tuyệt đối — chỉ có trade-off phù hợp với use case. JWT có điểm yếu riêng (revocation, payload visible). Session có điểm yếu riêng (CSRF, shared storage). Cách phòng tránh: phân tích yêu cầu hệ thống trước khi chọn.
*   **Sai lầm 3: Đặt JWT expiry quá dài.** Access token 30 ngày là sai hoàn toàn — nếu bị lộ, attacker có 30 ngày để dùng. Cách phòng tránh: access token 15 phút đến 1 giờ, refresh token 7 đến 30 ngày, rotate refresh token sau mỗi lần dùng.
*   **Sai lầm 4: Không verify signature khi nhận JWT.** Đây là lỗi nghiêm trọng — nếu chỉ decode payload mà không verify signature, attacker có thể forge token bằng cách thay đổi payload và bỏ signature. Cách phòng tránh: luôn dùng thư viện JWT chuẩn, không tự implement verify logic.
*   **Sai lầm 5: Dùng algorithm "none" trong JWT.** Một số library JWT cũ cho phép algorithm "none" — không cần ký. Attacker có thể exploit bằng cách gửi token với alg=none và payload tùy ý. Cách phòng tránh: luôn whitelist explicitly các algorithm được phép, không cho phép "none".
*   **Sai lầm 6: Không có CSRF protection khi dùng cookie-based JWT.** HttpOnly cookie bảo vệ khỏi XSS nhưng không bảo vệ khỏi CSRF. Cách phòng tránh: thêm SameSite=Strict hoặc CSRF token khi lưu JWT trong cookie.
*   **Sai lầm 7: Khi phỏng vấn, chỉ trả lời lý thuyết mà không liên hệ thực tế.** Interviewer outsource muốn biết bạn đã từng implement chưa, không chỉ đọc docs. Cách phòng tránh: chuẩn bị sẵn một ví dụ thực tế — "Em đã dùng Laravel Sanctum với token-based auth cho REST API mobile, cụ thể là..."

#### FAQ — Câu Hỏi Đào Sâu Nhất Về Session Và JWT

##### Hỏi: JWT có thể dùng với Laravel không, hay chỉ dùng Session?

**Đáp:** Laravel hỗ trợ cả hai. Laravel Sanctum hỗ trợ cả Session-based authentication (cho SPA cùng domain) và Token-based (cho mobile app, API). Laravel Passport implement OAuth 2.0 đầy đủ với JWT. Package `tymon/jwt-auth` là lựa chọn phổ biến khác cho JWT thuần. Mặc định Laravel dùng Session cho web routes và Token cho API routes.

##### Hỏi: Refresh Token hoạt động như thế nào, tại sao cần hai loại token?

**Đáp:** Access Token thời gian sống ngắn để giới hạn thiệt hại nếu bị lộ, nhưng ngắn quá thì user phải đăng nhập lại liên tục. Refresh Token thời gian sống dài, chỉ dùng để lấy Access Token mới khi hết hạn. Client tự động gọi refresh endpoint khi nhận 401, lấy Access Token mới mà user không cần thao tác gì. Refresh Token nên lưu HttpOnly cookie, Access Token nên lưu in-memory để bảo mật tối đa.

##### Hỏi: Microservices nên dùng JWT hay Session?

**Đáp:** JWT là lựa chọn tiêu chuẩn cho microservices. Lý do: các service không share cùng session store, mỗi service cần tự verify request độc lập. Với JWT dùng RS256, auth service giữ private key để ký token, còn lại các service chỉ cần public key để verify. Không cần gọi auth service cho mỗi request — service A tự verify JWT và đọc claims mà không cần I/O thêm.

##### Hỏi: Có thể dùng cả Session lẫn JWT trong cùng một ứng dụng không?

**Đáp:** Hoàn toàn được và khá phổ biến trong thực tế. Laravel cho phép định nghĩa nhiều guard khác nhau trong `config/auth.php`: web guard dùng Session cho browser, api guard dùng token cho mobile và third-party client. Middleware `auth:web` và `auth:api` áp dụng riêng biệt cho từng nhóm routes. Đây là pattern phù hợp cho hệ thống vừa có web app vừa có REST API.

##### Hỏi: Nếu secret key JWT bị lộ, phải làm gì?

**Đáp:** Đây là tình huống nghiêm trọng — attacker có thể forge bất kỳ token nào với secret key đó. Cần làm ngay: đổi secret key mới, deploy lại service. Toàn bộ token cũ ký bằng key cũ sẽ fail verify ngay lập tức — tất cả user bị logout và phải đăng nhập lại. Để giảm rủi ro, nên rotate secret key định kỳ và dùng key versioning trong payload (`"kid": "v2"`) để support transition period.

#### Tổng Kết — Cách Nhớ Để Không Bao Giờ Nhầm

Sau tất cả lý thuyết, có một cách nhớ đơn giản nhất: **Session giống thẻ gửi xe — bạn giữ số thẻ, bãi xe giữ xe thật. JWT giống bằng lái xe — bạn giữ toàn bộ thông tin, ai cũng có thể kiểm tra mà không cần gọi về trung tâm.**

Chọn Session khi bạn cần kiểm soát tuyệt đối — thu hồi ngay, audit đầy đủ, dữ liệu luôn mới nhất. Chọn JWT khi bạn cần linh hoạt — nhiều client, nhiều domain, scale ngang không cần shared storage.

Xem thêm các bài viết thuộc [Series Phỏng vấn](/tag/seriesphongvan)

**Bước tiếp theo thực tế:** Mở một project Laravel cũ của bạn, thử implement cả hai cơ chế — Session cho web routes, Sanctum token cho API routes. Viết một endpoint `/me` hoạt động với cả hai guard. Khi bạn tự tay implement và debug lỗi thực tế, phỏng vấn về chủ đề này sẽ không còn là thách thức nữa.

Tác giả: Nguyễn Hữu Khải

21/04/2026

> Xem thêm: 
> 
> *   [Session vs JWT: Toàn Bộ Lý Thuyết](/session-vs-jwt-toan-bo-ly-thuyet)
> *   [Session vs JWT Phỏng Vấn](/session-vs-jwt-phong-van)
> *   [Câu hỏi phỏng vấn JWT thường gặp](/cau-hoi-phong-van-jwt-thuong-gap)
> *   [Session vs JWT: Developer Nên Chọn Cái Nào?](/session-vs-jwt-developer-nen-chon-cai-nao)
> *   [JWT Security Best Practices](/jwt-security-best-practices)
