---
title: "JWT Interview Questions and Answers (2026)"
author: KhaiziNam
pubDatetime: 2026-04-05T20:43:26.000Z
slug: cau-hoi-phong-van-jwt-thuong-gap
lang: vi
translationKey: post-216
featured: false
draft: false
tags:
  - "SeriesPhongVan"
description: "JWT interview questions and answers covering token structure, refresh tokens, JWT security, RS256 vs HS256, token revocation, and real-world authentication flows."
---

Tổng hợp 15+ câu hỏi phỏng vấn JWT thường gặp nhất năm 2026, kèm đáp án chi tiết, ví dụ thực tế và các lỗi sai phổ biến giúp developer tự tin vượt qua vòng technical interview.

Bạn chuẩn bị phỏng vấn vị trí Backend hoặc Fullstack nhưng mỗi lần đến phần xác thực (authentication) lại lúng túng không biết giải thích JWT như thế nào cho đúng? Nhiều fresher và junior developer nắm được khái niệm cơ bản nhưng lại "tắc" ngay khi interviewer hỏi sâu hơn về bảo mật, flow thực tế hay so sánh với Session. Bài viết này tổng hợp toàn bộ câu hỏi phỏng vấn JWT phổ biến nhất — từ định nghĩa, cấu trúc, luồng xác thực cho đến các vấn đề bảo mật — kèm hướng dẫn trả lời cụ thể để bạn không bị bắt bẻ.

Nội dung bài viết:

*   [JWT là gì? Câu hỏi nền tảng](#jwt-la-gi)
*   [Cấu trúc JWT - Header, Payload, Signature](#cau-truc-jwt)
*   [JWT vs Session: So sánh trong phỏng vấn](#jwt-vs-session)
*   [Câu hỏi bảo mật JWT nâng cao](#bao-mat-jwt)
*   [Access Token & Refresh Token](#refresh-token)
*   [5 sai lầm hay gặp khi trả lời về JWT](#sai-lam-pho-bien)
*   [FAQ - Câu hỏi thường gặp về JWT](#faq-jwt)

* * *

#### JWT là gì? Câu hỏi nền tảng bạn phải trả lời được

##### Bản chất của vấn đề

JWT (JSON Web Token) là một tiêu chuẩn mở (RFC 7519) để truyền tải thông tin an toàn giữa các bên dưới dạng JSON object được ký số (signed). Điểm cốt lõi cần hiểu: JWT không phải là cơ chế mã hóa (encryption) — nó là cơ chế **xác minh tính toàn vẹn** (integrity verification). Ai cũng có thể đọc payload nếu có token, nhưng không ai giả mạo được nội dung mà không có secret key.

Câu hỏi mà interviewer thường dùng để test level:

*   "JWT là gì và tại sao chúng ta dùng nó thay vì Session?"
*   "JWT có phải là mã hóa không?"
*   "Token-based authentication hoạt động như thế nào?"

##### Cách trả lời chuẩn

JWT là một chuỗi gồm 3 phần được encode bằng Base64URL và nối với nhau bằng dấu chấm (.). Nó được sử dụng để xác thực (authentication) và trao đổi thông tin (information exchange) trong các hệ thống stateless — đặc biệt là REST API và microservices. Server không cần lưu trạng thái session vì mọi thông tin cần thiết đã nằm trong token.

#### Cấu trúc JWT - Header, Payload, Signature

##### Phân tích từng phần

Một JWT có dạng: **xxxxx.yyyyy.zzzzz**

**Header** chứa thuật toán ký (alg) và loại token (typ):

{
  "alg": "HS256",
  "typ": "JWT"
}

**Payload** chứa các claims — thông tin về user và metadata. Có 3 loại claim:

*   **Registered claims**: iss (issuer), exp (expiration), sub (subject), aud (audience)
*   **Public claims**: do cộng đồng định nghĩa, cần tránh trùng tên
*   **Private claims**: do hai bên thỏa thuận, ví dụ user\_id, role

{
  "sub": "1234567890",
  "name": "Nguyen Van A",
  "role": "admin",
  "iat": 1516239022,
  "exp": 1516242622
}

**Signature** được tạo bằng cách ký Header + Payload với secret key:

HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)

Câu hỏi hay bị hỏi thêm: **"Payload có bị lộ không?"** — Trả lời: Có. Base64URL là encode, không phải encrypt. Tuyệt đối không đặt password hay thông tin nhạy cảm trong payload. Nếu cần bảo mật payload, dùng JWE (JSON Web Encryption).

#### JWT vs Session: So sánh trong phỏng vấn

##### Before/After khi dùng đúng công cụ

Đây là câu hỏi kinh điển trong mọi buổi phỏng vấn Backend. Bài viết [Session vs JWT: Toàn Bộ Lý Thuyết Và Câu Hỏi Phỏng Vấn Hay Gặp Nhất Mà Junior Cần Nắm Chắc](/session-vs-jwt-toan-bo-ly-thuyet) đã phân tích chi tiết, nhưng để trả lời phỏng vấn, bạn cần nhớ bảng so sánh này:

*   **Session**: Stateful — server lưu session data, client chỉ giữ session ID. Phù hợp monolith, dễ revoke ngay lập tức.
*   **JWT**: Stateless — server không lưu gì, mọi thứ trong token. Phù hợp microservices, scale ngang dễ dàng, nhưng khó revoke trước khi hết hạn.

Khi interviewer hỏi "Khi nào dùng JWT, khi nào dùng Session?" — đáp án thông minh là: dùng JWT cho REST API và hệ thống distributed; dùng Session cho web app truyền thống cần kiểm soát đăng xuất chặt chẽ.

#### Câu hỏi bảo mật JWT nâng cao

##### Các vector tấn công phổ biến

Đây là phần phân biệt junior với mid-level. Interviewer sẽ hỏi:

**1\. Algorithm confusion attack (alg:none)**

Attacker sửa header thành **"alg": "none"** để bypass signature verification. Fix: server phải whitelist thuật toán được phép, không dùng thư viện tự động tin theo alg trong header.

**2\. JWT Secret Brute-force**

Nếu secret key quá yếu (ví dụ: "secret", "123456"), attacker có thể brute-force offline vì họ có header và payload. Fix: dùng secret key đủ entropy (ít nhất 256-bit random string), hoặc chuyển sang RS256 (asymmetric).

**3\. Token Theft / XSS**

Nếu lưu JWT trong localStorage, XSS có thể đánh cắp token. Fix: lưu trong httpOnly cookie để JavaScript không đọc được. Đây là best practice hiện tại.

**4\. Replay Attack**

Attacker sử dụng lại token cũ bị đánh cắp. Fix: đặt exp ngắn (15 phút cho access token), dùng refresh token rotation.

##### RS256 vs HS256 — khi nào dùng gì?

*   **HS256**: Symmetric — cùng một secret để ký và verify. Phù hợp khi chỉ có 1 service.
*   **RS256**: Asymmetric — private key để ký, public key để verify. Phù hợp microservices vì các service khác chỉ cần public key, không cần secret.

#### Access Token & Refresh Token - Flow thực tế

##### Step-by-step flow đúng chuẩn production

1.  User đăng nhập với email/password.
2.  Server verify credentials, tạo **access token** (TTL: 15 phút) và **refresh token** (TTL: 7-30 ngày).
3.  Access token gửi trong Authorization header; refresh token lưu httpOnly cookie.
4.  Khi access token hết hạn, client gửi refresh token để lấy access token mới.
5.  Server verify refresh token, cấp access token mới + **rotate refresh token** (vô hiệu hóa token cũ).
6.  Khi logout: xóa refresh token khỏi DB (blacklist hoặc delete).

**Case study thực tế:** Một startup SaaS dùng access token 1 giờ (không có refresh token) — kết quả user bị đăng xuất liên tục, ảnh hưởng UX. Sau khi chuyển sang access token 15 phút + refresh token 30 ngày có rotation, tỷ lệ phàn nàn về đăng xuất giảm 80% trong 2 tuần đầu. Đồng thời bảo mật tốt hơn vì refresh token bị đánh cắp sẽ bị phát hiện ngay qua rotation.

#### 5 sai lầm phổ biến khi trả lời câu hỏi về JWT trong phỏng vấn

1.  **Nói JWT là "mã hóa" (encrypted)** → Sửa: JWT là signed (ký số), không phải encrypted. Dùng từ "encode" và "verify signature" cho chính xác.
2.  **Không biết cách revoke JWT** → Sửa: JWT không tự revoke được, nhưng có thể dùng blacklist (lưu jti trong Redis), hoặc dùng refresh token có thể revoke.
3.  **Lưu JWT trong localStorage và coi đó là an toàn** → Sửa: localStorage dễ bị XSS. Best practice: lưu refresh token trong httpOnly cookie.
4.  **Đặt exp quá dài** → Sửa: Access token nên có TTL ngắn (15-30 phút). TTL dài làm giảm cửa sổ revoke khi token bị lộ.
5.  **Không biết sự khác biệt giữa HS256 và RS256** → Sửa: Nắm rõ symmetric vs asymmetric và khi nào dùng cái nào (xem phần trên).

Để hiểu sâu hơn về sự khác biệt giữa JWT và Session trong thực tế, bạn có thể đọc thêm bài viết Session vs JWT Phỏng Vấn: Hướng Dẫn Đầy Đủ Để Không Bao Giờ Bị Hỏi Khó.

#### FAQ - Câu hỏi thường gặp về JWT trong phỏng vấn

##### JWT có thể bị giải mã (decode) không?

Có. Bất kỳ ai có JWT đều có thể decode phần Header và Payload vì chúng chỉ được Base64URL encode, không phải encrypt. Tuy nhiên, họ không thể tạo ra token hợp lệ mà không có secret key vì Signature sẽ không khớp. Đây là lý do tuyệt đối không lưu thông tin nhạy cảm như password trong payload.

##### Làm thế nào để logout khi dùng JWT?

Đây là câu hỏi hay đánh đố. JWT bản thân không có cơ chế revoke — token vẫn hợp lệ cho đến khi hết hạn. Các cách giải quyết: (1) Dùng access token TTL ngắn (15 phút) để giảm thiểu rủi ro. (2) Blacklist jti (JWT ID) trong Redis khi logout. (3) Xóa refresh token trong DB để ngăn cấp token mới. Trong thực tế, kết hợp cả 3 cách cho hệ thống production.

##### JWT có phù hợp cho mobile app không?

Có, và đây là use case phổ biến nhất. Mobile app không có cookie như browser, nên JWT trong Authorization header là lựa chọn tự nhiên. Lưu trữ token trong Secure Storage (iOS Keychain hoặc Android Keystore) thay vì SharedPreferences hay UserDefaults thông thường để tránh bị đánh cắp khi thiết bị bị root/jailbreak.

##### Tại sao nên dùng RS256 thay vì HS256 trong microservices?

Trong kiến trúc microservices, nhiều service cần verify JWT. Nếu dùng HS256, tất cả service đều phải biết secret key — rủi ro bảo mật cao. Với RS256, chỉ Auth Service giữ private key để ký; các service khác chỉ cần public key để verify. Public key có thể publish công khai (ví dụ qua JWKS endpoint) mà không lo bị lộ.

##### JWT size có ảnh hưởng performance không?

Có, đặc biệt khi gọi API nhiều. JWT thường nặng hơn Session ID (vài byte) do chứa claims. Một JWT điển hình dài 200–500 byte; nếu nhồi nhiều claim thì có thể lên đến 1KB+. Với hệ thống gọi 100+ API/giây, overhead này tích lũy đáng kể. Best practice: chỉ đặt vào payload những thông tin thực sự cần dùng trong request — không lưu toàn bộ profile user.

#### Tổng kết & Bước tiếp theo

Để vượt qua câu hỏi phỏng vấn JWT, bạn cần nắm vững 4 trụ cột: cấu trúc token (Header/Payload/Signature), flow xác thực thực tế (access + refresh token), các điểm bảo mật quan trọng (alg:none, XSS, brute-force), và khi nào nên dùng JWT thay vì Session. Câu trả lời hay không phải là đọc thuộc lòng định nghĩa — mà là kể được một scenario thực tế bạn đã làm hoặc đã nghiên cứu. Hãy thử tự xây dựng một JWT auth flow nhỏ bằng ngôn ngữ quen thuộc trước khi đi phỏng vấn — không gì thay thế được kinh nghiệm thực tay.

Tác giả: Nguyễn Hữu Khải

21/04/2026

> Xem thêm: 
> 
> *   [Session vs JWT: Toàn Bộ Lý Thuyết](/session-vs-jwt-toan-bo-ly-thuyet)
> *   [Session vs JWT Phỏng Vấn](/session-vs-jwt-phong-van)
> *   [Câu hỏi phỏng vấn JWT thường gặp](/cau-hoi-phong-van-jwt-thuong-gap)
> *   [Session vs JWT: Developer Nên Chọn Cái Nào?](/session-vs-jwt-developer-nen-chon-cai-nao)
> *   [JWT Security Best Practices](/jwt-security-best-practices)
