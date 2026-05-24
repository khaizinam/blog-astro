---
title: "Session vs JWT Phỏng Vấn: Hướng Dẫn Đầy Đủ Để Không Bao Giờ Bị Hỏi Khó"
author: "Nguyễn Hữu Khải - khaizinam"
pubDatetime: 2026-04-02T12:17:09.000Z
slug: session-vs-jwt-phong-van
lang: vi
translationKey: post-214
featured: false
draft: false
tags:
  - "SeriesPhongVan"
description: "Bạn biết Session và JWT là gì nhưng cứ lúng túng khi interviewer hỏi sâu hơn? Bài viết này phân tích toàn diện cơ chế hoạt động, so sánh thực chiến, và các câu hỏi phỏng vấn thường gặp nhất về Session vs JWT — để bạn trả lời tự tin, có chiều sâu, không chỉ đọc thuộc định nghĩa."
---

Bạn biết Session và JWT là gì nhưng cứ lúng túng khi interviewer hỏi sâu hơn? Bài viết này phân tích toàn diện cơ chế hoạt động, so sánh thực chiến, và các câu hỏi phỏng vấn thường gặp nhất về Session vs JWT — để bạn trả lời tự tin, có chiều sâu, không chỉ đọc thuộc định nghĩa.

Trong hầu hết các buổi phỏng vấn backend junior, câu hỏi về authentication xuất hiện gần như chắc chắn. "Session hay JWT, bạn dùng cái nào và tại sao?" là câu hỏi tưởng đơn giản nhưng lại là bẫy phân loại ứng viên rõ ràng nhất — người hiểu thực sự sẽ nói về trade-off, người học vẹt sẽ chỉ nêu định nghĩa.

### Mục Lục

1\. [Bản chất vấn đề: tại sao authentication lại phức tạp?](#ban-chat-van-de-tai-sao-authentication-lai-phuc-tap)

2\. [Session hoạt động như thế nào — từ request đến response](#session-hoat-dong-nhu-the-nao-tu-request-den-response)

3\. [JWT hoạt động như thế nào — giải phẫu một token](#jwt-hoat-dong-nhu-the-nao-giai-phau-mot-token)

4\. [So sánh trực tiếp: Session vs JWT theo từng tiêu chí](#so-sanh-truc-tiep-session-vs-jwt-theo-tung-tieu-chi)

5\. [Khi nào dùng Session, khi nào dùng JWT](#khi-nao-dung-session-khi-nao-dung-jwt)

6\. [Case study thực tế](#case-study-thuc-te)

7\. [Sai lầm phổ biến khi trả lời câu hỏi này](#sai-lam-pho-bien-khi-tra-loi-cau-hoi-nay)

8\. [Hỏi đáp nhanh](#hoi-dap-nhanh)

* * *

#### Bản Chất Vấn Đề: Tại Sao Authentication Lại Phức Tạp?

HTTP là giao thức **stateless** — mỗi request hoàn toàn độc lập, server không nhớ bạn là ai từ request trước. Đây là thiết kế cố ý để web có thể scale, nhưng nó tạo ra một vấn đề thực tế: làm thế nào để server biết request này đến từ một user đã đăng nhập?

Câu trả lời là phải có cơ chế lưu trạng thái ở đâu đó — hoặc ở phía server (Session), hoặc ở phía client dưới dạng token tự mang thông tin (JWT). Mỗi cách giải quyết cùng một vấn đề nhưng với những đánh đổi hoàn toàn khác nhau, và hiểu rõ những đánh đổi đó chính là thứ interviewer muốn thấy.

Bài viết này là phần bổ sung cho Câu Hỏi Phỏng Vấn Backend Junior: Tổng Hợp Đầy Đủ Từ Database Đến API, Auth và Cache — nếu bạn chưa đọc, hãy đọc trước để có bức tranh rộng hơn về những gì cần chuẩn bị.

#### Session Hoạt Động Như Thế Nào — Từ Request Đến Response

##### Flow đăng nhập bằng Session

Khi user đăng nhập thành công, server tạo ra một **session record** lưu trong bộ nhớ (RAM), database, hoặc Redis — chứa thông tin như user ID, role, và thời gian hết hạn. Server sau đó tạo một **session ID** ngẫu nhiên (thường là chuỗi hex dài), gửi về client qua Set-Cookie header. Client lưu cookie này và tự động gửi kèm trong mọi request tiếp theo.

Ở mỗi request, server nhận session ID từ cookie, tra cứu trong session store, tìm thấy thông tin user, xác nhận request hợp lệ. Nếu không tìm thấy hoặc session đã hết hạn, server trả về 401.

##### Điểm mạnh của Session

*   **Revoke ngay lập tức:** Muốn logout user khỏi mọi thiết bị? Xóa session record khỏi store — hiệu lực tức thì. Đây là lợi thế lớn nhất của Session mà JWT không có.
*   **Payload không bị expose:** Client chỉ giữ session ID vô nghĩa — không có thông tin user nào bị lộ ra ngoài.
*   **Đơn giản để implement:** Hầu hết framework có session middleware sẵn, ít code hơn, ít lỗi hơn.

##### Điểm yếu của Session

*   **Stateful — khó scale:** Nếu bạn có 3 server instances, request lần đầu đến server A tạo session ở đó, lần sau đến server B sẽ không tìm thấy. Giải pháp là dùng sticky session hoặc centralized session store (Redis) — đều tốn thêm chi phí và complexity.
*   **Tốn bộ nhớ server:** 1 triệu user đồng thời = 1 triệu session record phải lưu và quản lý.
*   **CSRF vulnerability:** Cookie tự động gửi kèm theo mọi request, kể cả request từ trang web độc hại — cần CSRF token để bảo vệ.

#### JWT Hoạt Động Như Thế Nào — Giải Phẫu Một Token

##### Cấu trúc của một JWT

JWT (JSON Web Token) gồm ba phần cách nhau bởi dấu chấm: **Header.Payload.Signature** — tất cả được encode bằng Base64URL.

**Header** chứa algorithm dùng để ký (thường là HS256 hoặc RS256) và loại token. **Payload** chứa claims — thông tin về user như user\_id, role, email, và thời gian hết hạn (exp). **Signature** là kết quả của việc ký Header + Payload bằng secret key — đây là phần đảm bảo token không bị tamper.

Quan trọng cần hiểu: **Payload KHÔNG được mã hóa — chỉ được encode.** Bất kỳ ai có token đều có thể decode và đọc payload. Chỉ có Signature là được ký — nếu ai đó sửa payload, signature sẽ không còn hợp lệ và server sẽ reject.

##### Flow đăng nhập bằng JWT

User đăng nhập → server tạo JWT, ký bằng secret key, trả về client → client lưu token (thường trong localStorage hoặc httpOnly cookie) → mọi request tiếp theo gửi kèm token trong Authorization header: `Bearer` → server nhận token, verify signature bằng secret key, decode payload lấy thông tin user — tất cả mà không cần tra cứu database hay session store.

##### Điểm mạnh của JWT

*   **Stateless — scale dễ dàng:** Bất kỳ server instance nào cũng có thể verify JWT chỉ cần có secret key — không cần share session store, không cần sticky session.
*   **Cross-domain friendly:** JWT dễ dùng hơn trong các kiến trúc microservices hoặc khi frontend và backend ở domain khác nhau — không bị vướng CORS cookie restriction.
*   **Tự chứa thông tin:** Server không cần query database để biết user là ai — giảm latency và database load.

##### Điểm yếu của JWT

*   **Không thể revoke trước khi hết hạn:** Đây là nhược điểm lớn nhất. Nếu token bị đánh cắp hoặc user bị ban, bạn không thể invalidate token đó ngay lập tức — phải chờ đến khi token tự hết hạn (exp). Giải pháp phổ biến: dùng access token ngắn hạn (15 phút) + refresh token dài hạn, hoặc maintain một token blacklist (nhưng cách này làm mất đi tính stateless).
*   **Payload bị expose:** Không bao giờ lưu thông tin nhạy cảm (password hash, số thẻ, v.v.) trong JWT payload vì bất kỳ ai cũng có thể decode.
*   **Token size lớn hơn session ID:** JWT thường dài 200–500 bytes so với session ID chỉ 32 bytes — tốn bandwidth hơn khi gửi kèm mọi request.

#### So Sánh Trực Tiếp: Session vs JWT Theo Từng Tiêu Chí

##### Lưu trạng thái

**Session:** Stateful — server lưu session store. **JWT:** Stateless — client lưu token, server không lưu gì.

##### Khả năng revoke

**Session:** Tức thì — xóa session record là xong. **JWT:** Không thể revoke trước exp — phải dùng blacklist hoặc access/refresh token pattern để workaround.

##### Scalability

**Session:** Cần centralized store (Redis) khi scale nhiều server. **JWT:** Native stateless — scale horizontal dễ dàng, không cần shared store.

##### Bảo mật payload

**Session:** Client không biết gì về session data — chỉ có ID. **JWT:** Payload có thể decode bởi bất kỳ ai — không lưu data nhạy cảm.

##### Phù hợp với kiến trúc

**Session:** Monolithic app, same-domain frontend/backend, cần revoke ngay lập tức (banking, admin). **JWT:** Microservices, mobile app, cross-domain, third-party API access.

#### Khi Nào Dùng Session, Khi Nào Dùng JWT

Đây là câu hỏi mà nhiều interviewer thực sự muốn nghe câu trả lời của bạn — không phải "JWT tốt hơn" hay "Session cũ rồi", mà là tư duy đánh giá use case.

**Dùng Session khi:** Ứng dụng web truyền thống cùng domain, cần logout ngay lập tức trên tất cả thiết bị (ứng dụng tài chính, ngân hàng, hệ thống admin), không có yêu cầu scale horizontal phức tạp, hoặc đang dùng framework có session support mạnh như Laravel, Rails, Django.

**Dùng JWT khi:** Kiến trúc microservices với nhiều service cần verify user, mobile app (không dùng cookie được), Single Page Application với API riêng biệt, cần cấp token cho third-party service, hoặc hệ thống cần scale horizontal mà không muốn quản lý centralized session store.

**Dùng cả hai (hybrid):** Một pattern phổ biến trong production là dùng Session cho web app chính (vì cần revoke ngay) và JWT cho mobile API hoặc third-party integration. Đây là câu trả lời "senior" mà junior ít khi nghĩ đến nhưng sẽ gây ấn tượng mạnh nếu bạn đề cập.

#### Case Study Thực Tế

Hùng phỏng vấn vị trí backend junior tại một công ty fintech đang xây dựng ứng dụng mobile banking. Interviewer hỏi: "Bạn sẽ chọn Session hay JWT để authenticate user trên mobile app của chúng tôi và tại sao?"

Câu trả lời của Hùng: "Với mobile app, tôi sẽ chọn JWT với access/refresh token pattern. Mobile client không xử lý cookie tốt như browser, và JWT phù hợp hơn cho stateless authentication qua REST API. Tuy nhiên vì đây là ứng dụng tài chính, tôi sẽ dùng access token ngắn hạn — 15 phút — kết hợp refresh token lưu trong secure storage của thiết bị. Nếu phát hiện đăng nhập đáng ngờ, refresh token sẽ bị revoke phía server để buộc user đăng nhập lại."

Interviewer hỏi tiếp: "Nếu user bị mất điện thoại, bạn xử lý thế nào?" — Hùng trả lời: "Implement một endpoint revoke-all-tokens cho user đó — về cơ bản là maintain một blacklist refresh token hoặc dùng token version trong database. Đây là điểm chúng tôi phải chấp nhận thêm state để đảm bảo bảo mật."

**Kết quả: Hùng được đánh giá cao vì không chỉ chọn một cách mà giải thích được trade-off và cách xử lý edge case — đây chính là tư duy mà một backend engineer cần có.**

#### Sai Lầm Phổ Biến Khi Trả Lời Câu Hỏi Này

*   **Nói "JWT an toàn hơn Session" mà không giải thích:** Đây là câu sai. Session có thể an toàn như JWT nếu implement đúng. Cả hai đều có điểm mạnh và yếu khác nhau về bảo mật. Cách fix: luôn nói "phụ thuộc vào use case và cách implement" thay vì tuyên bố cái nào an toàn hơn tuyệt đối.
*   **Nhầm encode với encrypt trong JWT:** Payload của JWT được Base64URL encode — không phải encrypt. Nhiều junior nói "JWT mã hóa thông tin user" — đây là sai hoàn toàn. Cách fix: nhớ rõ — encode = ai cũng decode được, encrypt = cần key để decrypt.
*   **Không biết JWT payload có thể bị đọc:** Nếu bạn nói "tôi lưu password trong JWT payload vì nó được mã hóa" — đây là red flag nghiêm trọng. Cách fix: không bao giờ lưu thông tin nhạy cảm trong payload; chỉ lưu non-sensitive identifier như user\_id và role.
*   **Không biết cách revoke JWT:** Khi interviewer hỏi "làm thế nào để logout user khỏi mọi thiết bị với JWT?" — im lặng là không được. Cách fix: chuẩn bị ít nhất hai cách — blacklist token trong Redis với TTL, hoặc token version/generation number trong database.
*   **Lưu JWT trong localStorage mà không đề cập XSS risk:** localStorage dễ bị XSS attack đọc token. Cách fix tốt hơn là lưu trong httpOnly cookie — nhưng cần CSRF protection. Biết được trade-off này là điểm cộng rõ ràng.
*   **Không đề cập access/refresh token pattern:** Nếu chỉ biết JWT access token mà không biết refresh token, bạn đang thiếu một phần quan trọng của production auth flow. Cách fix: học và thực hành implement cả flow access + refresh token trước khi phỏng vấn.
*   **Chọn một phía tuyệt đối mà không cân nhắc use case:** "Tôi luôn dùng JWT" hoặc "Session mới đúng" đều là câu trả lời yếu. Cách fix: bắt đầu bằng "Tùy vào yêu cầu hệ thống..." rồi phân tích cụ thể.

#### Hỏi Đáp Nhanh

##### Hỏi: JWT có phải là OAuth không?

**Đáp:** Không — đây là hai khái niệm khác nhau thường bị nhầm lẫn. JWT là định dạng token — một cách để encode và ký thông tin. OAuth 2.0 là authorization framework — một giao thức để cấp quyền truy cập. JWT thường được dùng như format cho access token trong OAuth 2.0, nhưng OAuth không bắt buộc phải dùng JWT — có thể dùng opaque token thay thế.

##### Hỏi: Nên lưu JWT ở đâu — localStorage hay Cookie?

**Đáp:** Đây là một trong những câu tranh luận nhất trong cộng đồng web security. localStorage dễ implement nhưng dễ bị XSS đọc. httpOnly Cookie chống XSS tốt hơn nhưng cần CSRF protection và gặp vấn đề với cross-domain. Lựa chọn phổ biến nhất trong production: httpOnly, Secure, SameSite=Strict cookie cho web app; secure storage (Keychain/Keystore) cho mobile. Không có câu trả lời hoàn hảo — mỗi cách có trade-off.

##### Hỏi: HS256 và RS256 trong JWT khác nhau thế nào?

**Đáp:** HS256 dùng HMAC với một secret key duy nhất để cả ký lẫn verify — đơn giản nhưng server nào verify cũng phải biết secret key. RS256 dùng RSA key pair — private key để ký, public key để verify — phù hợp hơn cho microservices vì chỉ cần distribute public key, giữ private key an toàn ở auth server. Với hệ thống đơn giản một server, HS256 đủ dùng. Với microservices hoặc third-party verification, RS256 là lựa chọn tốt hơn.

##### Hỏi: Refresh token là gì và tại sao cần?

**Đáp:** Access token JWT thường có thời gian sống ngắn (5–15 phút) để giảm rủi ro nếu bị đánh cắp. Nhưng không thể bắt user đăng nhập lại mỗi 15 phút — đây là lúc refresh token vào cuộc. Refresh token là một token riêng biệt, thời gian sống dài (7–30 ngày), được lưu an toàn. Khi access token hết hạn, client dùng refresh token để lấy access token mới mà không cần user nhập lại password. Refresh token được lưu phía server — có thể revoke bất cứ lúc nào.

##### Hỏi: Phỏng vấn NodeJS và PHP có hỏi khác nhau về Session/JWT không?

**Đáp:** Concept thì giống nhau, nhưng implementation detail khác nhau. Với PHP/Laravel, interviewer có thể hỏi về Laravel Sanctum vs Passport, session driver config (file, database, Redis), và cookie encryption. Với NodeJS, câu hỏi thường xoay quanh express-session, jsonwebtoken library, và middleware pattern.

#### Tổng Kết

**Session và JWT không phải cuộc chiến ai thắng ai — chúng là hai công cụ giải quyết cùng một vấn đề theo hai cách khác nhau, mỗi cách phù hợp với một bối cảnh khác nhau.** Interviewer không muốn nghe bạn chọn đúng — họ muốn thấy bạn biết tại sao mình chọn và tại sao cách kia cũng có thể đúng trong tình huống khác.

Trước buổi phỏng vấn backend, hãy tự implement một lần cả hai — một mini app dùng Session, một app dùng JWT với refresh token. Kinh nghiệm tay trên sẽ giúp bạn trả lời mọi follow-up question tự nhiên hơn bất kỳ bài học thuộc lòng nào.

Tác giả: Nguyễn Hữu Khải

21/04/2026

> Xem thêm: 
> 
> *   [Session vs JWT: Toàn Bộ Lý Thuyết](/session-vs-jwt-toan-bo-ly-thuyet)
> *   [Session vs JWT Phỏng Vấn](/session-vs-jwt-phong-van)
> *   [Câu hỏi phỏng vấn JWT thường gặp](/cau-hoi-phong-van-jwt-thuong-gap)
> *   [Session vs JWT: Developer Nên Chọn Cái Nào?](/session-vs-jwt-developer-nen-chon-cai-nao)
> *   [JWT Security Best Practices](/jwt-security-best-practices)
