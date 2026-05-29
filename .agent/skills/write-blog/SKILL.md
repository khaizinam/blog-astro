---
name: seo-content-audit
description: >
  Audit toàn diện nội dung bài viết blog/landing page theo tiêu chuẩn SEO, EEAT, UX người Việt.
  Sử dụng skill này BẮT BUỘC khi: người dùng paste bài viết và nói "audit", "check SEO", "review bài",
  "đánh giá bài viết", "cải thiện SEO", "optimize content", "kiểm tra EEAT", hoặc bất kỳ yêu cầu nào
  liên quan đến đánh giá chất lượng nội dung blog, bài viết chuẩn SEO, hay cải thiện thứ hạng Google.
  Skill sẽ chạy full checklist 10 nhóm tiêu chí, chấm điểm, và đề xuất sửa cụ thể.
  Luôn tạo Table of Contents nếu bài chưa có, và đề xuất cấu trúc heading chuẩn.
---

# SEO Content Audit Skill

## Mục tiêu
Phân tích và đánh giá bài viết theo 10 nhóm tiêu chí SEO + EEAT + UX bản địa Việt Nam.
Xuất ra: bảng điểm, danh sách vấn đề ưu tiên, đề xuất sửa cụ thể, và Table of Contents nếu cần.

## Cách sử dụng skill này
Khi nhận được bài viết cần audit, thực hiện tuần tự:
1. Đọc toàn bộ bài viết
2. Chạy checklist 10 nhóm (xem `references/checklist.md`)
3. Tính điểm từng nhóm
4. Tạo Table of Contents nếu bài chưa có
5. Xuất báo cáo theo format chuẩn (xem phần OUTPUT FORMAT bên dưới)

---

## QUY TRÌNH AUDIT

### Bước 1 — Thu thập thông tin đầu vào
Trước khi audit, hỏi nếu thiếu:
- **Keyword chính** là gì? (nếu không rõ từ bài viết)
- **Đối tượng độc giả** là ai? (phổ thông / chuyên ngành / B2B / B2C)
- **Loại trang**: Blog thông tin / Landing page / Product page / Category page?
- **Đã publish chưa?** (để biết có check Search Console không)

Nếu người dùng paste bài và không nói gì thêm → tự suy luận keyword từ H1/title, tiến hành audit luôn.

### Bước 2 — Phân tích cấu trúc Heading & Table of Contents

**Kiểm tra:**
- Bài có H1 chưa? H1 có khớp keyword chính không?
- Cấu trúc H2/H3 có logic, bao phủ subtopic không?
- Bài có Table of Contents (TOC) không?

**Nếu bài CHƯA có TOC:**
→ Tạo TOC chuẩn dựa trên heading hiện tại của bài
→ Đề xuất thêm heading còn thiếu để bao phủ search intent
→ Format TOC theo Markdown có anchor link

**Nếu bài ĐÃ có TOC:**
→ Kiểm tra TOC có khớp với heading thực tế không
→ Đề xuất cải thiện nếu cần

**Format TOC chuẩn đề xuất:**
```markdown
## Mục lục
- [Phần 1: Tên heading](#phan-1-ten-heading)
- [Phần 2: Tên heading](#phan-2-ten-heading)
  - [2.1 Sub-heading](#21-sub-heading)
- [Phần 3: FAQ](#phan-3-faq)
- [Kết luận](#ket-luan)
```

> ⚠️ **BẮt buộc trước khi tạo TOC: Xác định cách dự án tự động sinh slug từ heading.**
>
> Anchor link trong TOC phải khớp chính xác với ID được gắn vào heading khi render. Không khớp → link broken.
>
> **Các kiểu sinh slug phổ biến:**
>
> | Kiểu | Mô tả | Ví dụ |
> |------|---------|--------|
> | `github-slugger` (mặc định Astro/Next) | lowercase, giữ unicode, `-` thay space | `"JWT là gì?"` → `jwt-l%C3%A0-g%C3%AC` |
> | `cleanSlugify` NFD (dự án này) | bỏ dấu, đ→d, bỏ ký tự đặc biệt | `"JWT là gì?"` → `jwt-la-gi` |
> | Custom `{#id}` trong MDX | dùng id viết tay | `## Tiêu đề {#my-id}` → `my-id` |
>
> **Cách xác định cách dự án này dùng:**
> 1. Đọc `astro.config.ts` / `next.config.js` — tìm `rehypePlugins` hoặc `remarkPlugins`
> 2. Nếu thấy plugin custom slug → đọc logic hàm đó
> 3. Nếu không có plugin → mặc định là `github-slugger`
>
> **Dự án này (blog.khaizinam / Astro)** dùng hàm `cleanSlugify` định nghĩa trong `astro.config.ts`:
> ```js
> text.toLowerCase()
>   .normalize("NFD")
>   .replace(/[\u0300-\u036f]/g, "") // bỏ dấu tiếng Việt
>   .replace(/[đĐ]/g, "d")
>   .replace(/[^a-z0-9\s-]/g, "") // bỏ ký tự đặc biệt (bao gồm — & : ? !)
>   .trim()
>   .replace(/\s+/g, "-")
>   .replace(/-+/g, "-")
> ```
> Ví dụ: `"Cấu trúc JWT — Header, Payload"` → `"cau-truc-jwt--header-payload"` → sau `-+` → `"cau-truc-jwt-header-payload"`
>
> **KHÔNG dùng custom `{#id}` trong file .md** vì `rehypeCleanSlugs` sẽ ghi đè ID theo hàm trên.

### Bước 3 — Chạy Checklist 10 nhóm
Xem chi tiết tại `references/checklist.md`

Với mỗi tiêu chí: đánh dấu ✅ Đạt / ⚠️ Cần cải thiện / ❌ Thiếu

### Bước 4 — Tính điểm & Phân loại

Mỗi tiêu chí: Đạt = 1 điểm, Cần cải thiện = 0.5 điểm, Thiếu = 0 điểm

**Thang đánh giá:**
| Điểm % | Kết luận |
|--------|----------|
| ≥ 85% | 🟢 Tốt — tinh chỉnh nhỏ |
| 70–84% | 🟡 Khá — optimize có chọn lọc |
| 55–69% | 🟠 Trung bình — cải thiện đáng kể |
| < 55% | 🔴 Yếu — cần viết lại hoặc cấu trúc lại |

### Bước 5 — Xuất báo cáo
Theo format OUTPUT FORMAT bên dưới.

---

## OUTPUT FORMAT

```
## 📊 KẾT QUẢ AUDIT: [Tên/URL bài viết]

**Keyword chính phát hiện:** [keyword]
**Loại trang:** [Blog / Landing / Product]
**Tổng điểm:** X/Y điểm ([Z]%) — [🟢🟡🟠🔴 Đánh giá]

---

## 📋 Table of Contents
[Nếu bài chưa có TOC → xuất TOC đề xuất đầy đủ]
[Nếu đã có → ghi "✅ Đã có TOC" + nhận xét ngắn]

---

## 🔍 Điểm từng nhóm

| Nhóm | Điểm | Trạng thái |
|------|------|------------|
| 1. Search Intent & Keyword | X/5 | 🟢/🟡/🟠/🔴 |
| 2. Title & Meta Description | X/6 | |
| 3. Table of Contents | X/4 | |
| 4. Cấu trúc bài viết | X/6 | |
| 5. Văn phong tiếng Việt & UX | X/6 | |
| 6. EEAT | X/6 | |
| 7. FAQ | X/5 | |
| 8. Internal & External Linking | X/4 | |
| 9. Hình ảnh & Media | X/4 | |
| 10. Technical SEO On-page | X/5 | |

---

## 🚨 Vấn đề ưu tiên cao (cần sửa ngay)
1. [Vấn đề cụ thể] → [Đề xuất sửa cụ thể]
2. ...

## ⚠️ Cần cải thiện (nên làm)
1. ...

## ✅ Điểm tốt (giữ nguyên)
- ...

---

## 📝 Đề xuất sửa chi tiết

### Title & Meta
- Title hiện tại: "..."
- Đề xuất: "..."
- Meta hiện tại: "..."
- Đề xuất: "..."

### Cấu trúc Heading đề xuất
[Xuất lại cấu trúc H1/H2/H3 chuẩn SEO]

### FAQ đề xuất thêm
[Nếu thiếu FAQ, xuất 3–5 câu hỏi từ PAA/search intent]
```

---

## LƯU Ý ĐẶC BIỆT

- Luôn viết đề xuất cụ thể, KHÔNG chỉ nói "cần cải thiện" chung chung
- Với bài tiếng Việt: kiểm tra lỗi chính tả phổ biến (dấu thanh sai, i/y, d/gi/r)
- Nếu bài quá ngắn (<600 từ cho blog): cảnh báo thin content
- Nếu không có thông tin tác giả: ưu tiên flag lên vì ảnh hưởng EEAT
- Table of Contents là BẮT BUỘC cho bài > 1000 từ

## ĐỌC THÊM
- `references/checklist.md` — Checklist đầy đủ 10 nhóm, tất cả tiêu chí chi tiết
- `references/vn-seo-notes.md` — Đặc thù SEO thị trường Việt Nam