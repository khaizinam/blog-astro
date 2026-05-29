# Checklist SEO Content Audit — 10 Nhóm Tiêu Chí

## Mục lục
- [Nhóm 1: Search Intent & Keyword](#nhom-1)
- [Nhóm 2: Title & Meta Description](#nhom-2)
- [Nhóm 3: Table of Contents](#nhom-3)
- [Nhóm 4: Cấu trúc bài viết](#nhom-4)
- [Nhóm 5: Văn phong tiếng Việt & UX](#nhom-5)
- [Nhóm 6: EEAT](#nhom-6)
- [Nhóm 7: FAQ](#nhom-7)
- [Nhóm 8: Internal & External Linking](#nhom-8)
- [Nhóm 9: Hình ảnh & Media](#nhom-9)
- [Nhóm 10: Technical SEO On-page](#nhom-10)
- [Thang điểm tổng hợp](#thang-diem)

---

## Nhóm 1: Search Intent & Keyword (5 tiêu chí) {#nhom-1}

| # | Tiêu chí | Điểm | Ghi chú khi audit |
|---|----------|------|-------------------|
| 1.1 | Search intent đúng loại? (Informational / Navigational / Commercial / Transactional) | /1 | So sánh với top 3 SERP |
| 1.2 | Keyword chính xuất hiện trong 100 từ đầu? | /1 | Đếm vị trí xuất hiện đầu tiên |
| 1.3 | Keyword chính xuất hiện tự nhiên, mật độ 0.5–2%? | /1 | Không nhồi nhét, không thiếu |
| 1.4 | Có keyword phụ / LSI / semantic liên quan? | /1 | Ít nhất 3–5 biến thể |
| 1.5 | Nội dung trả lời đúng câu hỏi người dùng thực sự tìm kiếm? | /1 | Kiểm tra PAA Google |

**Tổng nhóm 1: /5**

---

## Nhóm 2: Title & Meta Description (6 tiêu chí) {#nhom-2}

| # | Tiêu chí | Điểm | Ghi chú khi audit |
|---|----------|------|-------------------|
| 2.1 | Title dài 50–60 ký tự (lý tưởng 55)? | /1 | Đếm ký tự bao gồm dấu cách |
| 2.2 | Keyword chính nằm đầu title (trong 3 từ đầu)? | /1 | |
| 2.3 | Title hấp dẫn, có trigger word (cách, hướng dẫn, bí quyết, top, so sánh...)? | /1 | |
| 2.4 | Meta description dài 140–160 ký tự? | /1 | |
| 2.5 | Meta description có keyword + lợi ích rõ + CTA ngầm? | /1 | |
| 2.6 | Title và description KHÔNG bị trùng lặp với trang khác trên cùng site? | /1 | |

**Tổng nhóm 2: /6**

**Tiêu chuẩn nhanh:**
- Title quá ngắn (< 40 ký tự): ❌ Lãng phí không gian
- Title quá dài (> 65 ký tự): ❌ Bị cắt trên SERP
- Meta < 120 ký tự: ⚠️ Thiếu thông tin
- Meta > 165 ký tự: ❌ Bị cắt trên SERP

---

## Nhóm 3: Table of Contents — TOC (4 tiêu chí) {#nhom-3}

> **Lưu ý:** TOC là BẮT BUỘC cho bài > 1000 từ. Nếu chưa có → tạo ngay.

| # | Tiêu chí | Điểm | Ghi chú khi audit |
|---|----------|------|-------------------|
| 3.1 | Bài có Table of Contents không? (BẮT BUỘC nếu > 1000 từ) | /1 | Nếu không → tạo TOC đề xuất |
| 3.2 | TOC có anchor link dẫn đến từng section? | /1 | `#id-heading` chuẩn |
| 3.3 | TOC phản ánh đúng cấu trúc heading thực tế trong bài? | /1 | Không thừa/thiếu heading |
| 3.4 | TOC được đặt ở đầu bài, sau lead paragraph? | /1 | Không chôn vào giữa bài |

**Tổng nhóm 3: /4**

**Khi tạo TOC đề xuất, cần:**
1. Liệt kê tất cả H2 trong bài
2. Liệt kê H3 quan trọng (có thể skip H3 nhỏ)
3. Dùng tiếng Việt có dấu trong text, slug không dấu trong anchor
4. Đặt ngay sau đoạn intro (~2–3 câu đầu bài)

**Ví dụ TOC chuẩn:**
```markdown
## Mục lục
- [1. Điện năng lượng mặt trời là gì?](#dien-nang-luong-mat-troi)
- [2. Lợi ích khi lắp đặt](#loi-ich)
  - [2.1 Tiết kiệm điện](#tiet-kiem-dien)
  - [2.2 Bảo vệ môi trường](#bao-ve-moi-truong)
- [3. Chi phí và thời gian hoàn vốn](#chi-phi)
- [4. Câu hỏi thường gặp](#faq)
- [Kết luận](#ket-luan)
```

---

## Nhóm 4: Cấu trúc bài viết (6 tiêu chí) {#nhom-4}

| # | Tiêu chí | Điểm | Ghi chú khi audit |
|---|----------|------|-------------------|
| 4.1 | Có H1 duy nhất, chứa keyword chính? | /1 | Không được có 2 H1 |
| 4.2 | H2/H3 phân cấp logic, không nhảy cấp (H2 → H4)? | /1 | |
| 4.3 | Đoạn văn ngắn 2–4 câu, dễ đọc trên mobile? | /1 | Không có đoạn > 6 câu |
| 4.4 | Dùng bullet/list/bảng đúng chỗ (liệt kê > 3 items)? | /1 | |
| 4.5 | Độ dài bài phù hợp với top 3 cùng keyword (không thin, không bloat)? | /1 | Blog info: 1200–2500 từ |
| 4.6 | Có lead paragraph mạnh (hook trong 2–3 câu đầu, nêu vấn đề người đọc)? | /1 | |

**Tổng nhóm 4: /6**

**Độ dài chuẩn tham khảo (tiếng Việt):**
| Loại trang | Độ dài khuyến nghị |
|------------|-------------------|
| Blog thông tin | 1.200 – 2.500 từ |
| Pillar page / Guide | 2.500 – 5.000 từ |
| Product page | 500 – 1.200 từ |
| Landing page | 800 – 1.500 từ |
| News / Tin tức | 400 – 800 từ |

---

## Nhóm 5: Văn phong tiếng Việt & UX (6 tiêu chí) {#nhom-5}

| # | Tiêu chí | Điểm | Ghi chú khi audit |
|---|----------|------|-------------------|
| 5.1 | Đúng chính tả, dấu câu tiếng Việt chuẩn? | /1 | Kiểm tra: d/gi/r, i/y, ô/o, ư/u |
| 5.2 | Không dùng câu dịch máy, cấu trúc ngây ngô? | /1 | Flag câu có cấu trúc đảo ngữ bất thường |
| 5.3 | Phong cách phù hợp đối tượng? | /1 | Phổ thông ≠ chuyên ngành |
| 5.4 | Không lạm dụng "chúng tôi", "quý khách", buzzword sáo rỗng? | /1 | |
| 5.5 | Có ví dụ, số liệu, bối cảnh Việt Nam thực tế (giá VNĐ, tên tỉnh thành, EVN...)? | /1 | |
| 5.6 | Ngôn ngữ tự nhiên, gần gũi như người thật nói chuyện? | /1 | |

**Tổng nhóm 5: /6**

**Lỗi chính tả phổ biến cần check:**
- Sai dấu thanh: "cảm ơn" → "cảm ơn" ✓
- Sai i/y: "kỉ niệm" / "kỷ niệm" (cả hai đều dùng được)
- Nhầm d/gi: "dành" vs "giành" (nghĩa khác nhau)
- Dùng sai "hoàn toàn" thay "hoàn thiện"
- Câu dịch máy: "Trong thế giới của..." / "Trong bài viết này, chúng ta sẽ..."

---

## Nhóm 6: EEAT (6 tiêu chí) {#nhom-6}

> Experience · Expertise · Authoritativeness · Trustworthiness

| # | Tiêu chí | Điểm | Ghi chú khi audit |
|---|----------|------|-------------------|
| 6.1 | Có tên tác giả, bio, chức danh chuyên môn hiển thị? | /1 | Quan trọng với YMYL topics |
| 6.2 | Có trích dẫn nguồn uy tín (.gov, .edu, báo lớn VN, nghiên cứu)? | /1 | |
| 6.3 | Có số liệu cụ thể, nghiên cứu, case study, dữ liệu thực? | /1 | Không phỏng đoán |
| 6.4 | Thể hiện kinh nghiệm thực tế / góc nhìn người trong ngành? | /1 | |
| 6.5 | Có ngày đăng + ngày cập nhật bài rõ ràng? | /1 | |
| 6.6 | Tránh claim tuyệt đối không có căn cứ ("tốt nhất", "số 1", "duy nhất")? | /1 | |

**Tổng nhóm 6: /6**

**Nguồn trích dẫn uy tín cho thị trường Việt:**
- Chính phủ: chinhphu.vn, moit.gov.vn, evn.com.vn
- Báo lớn: vnexpress.net, tuoitre.vn, thanhnien.vn, baodautu.vn
- Nghiên cứu: scholar.google.com, các trường ĐH Việt Nam
- Số liệu ngành: VAMA, GSO (Tổng cục Thống kê), Bộ Công Thương

---

## Nhóm 7: FAQ (5 tiêu chí) {#nhom-7}

| # | Tiêu chí | Điểm | Ghi chú khi audit |
|---|----------|------|-------------------|
| 7.1 | Có phần FAQ trả lời People Also Ask của Google? | /1 | Tối thiểu 3 câu hỏi |
| 7.2 | FAQ dùng schema FAQPage markup? | /1 | Kiểm tra trong source HTML |
| 7.3 | Câu hỏi FAQ xuất phát từ nhu cầu thực (Google Suggest, PAA, forum)? | /1 | Không đặt câu hỏi giả tạo |
| 7.4 | Mỗi câu trả lời trong FAQ ngắn gọn, đủ ý (50–200 từ)? | /1 | |
| 7.5 | Có CTA rõ ràng sau bài (đọc thêm, liên hệ, mua ngay, tải về)? | /1 | |

**Tổng nhóm 7: /5**

**Cách tìm câu hỏi FAQ thực tế:**
1. Google keyword → xem "People Also Ask"
2. Google Suggest (gợi ý khi gõ)
3. "keyword + là gì", "keyword + bao nhiêu tiền", "keyword + có tốt không"
4. Forum: reddit, webtretho, tinhte, otofun (tùy ngành)

---

## Nhóm 8: Internal & External Linking (4 tiêu chí) {#nhom-8}

| # | Tiêu chí | Điểm | Ghi chú khi audit |
|---|----------|------|-------------------|
| 8.1 | Có 2–5 internal link đến bài liên quan / pillar page? | /1 | Không để "orphan page" |
| 8.2 | Anchor text đa dạng, tự nhiên, có keyword? | /1 | Không dùng "click here", "xem thêm" chung chung |
| 8.3 | Có ít nhất 1 external link uy tín (nofollow nếu thương mại)? | /1 | |
| 8.4 | Không có broken link (404)? | /1 | |

**Tổng nhóm 8: /4**

---

## Nhóm 9: Hình ảnh & Media (4 tiêu chí) {#nhom-9}

| # | Tiêu chí | Điểm | Ghi chú khi audit |
|---|----------|------|-------------------|
| 9.1 | Ảnh có alt text chứa keyword tự nhiên? | /1 | Không nhồi keyword trong alt |
| 9.2 | Ảnh đã nén, dùng định dạng WebP hoặc AVIF? | /1 | |
| 9.3 | Có ít nhất 1 ảnh gốc (không phải stock ảnh generic)? | /1 | |
| 9.4 | Tên file ảnh có nghĩa, chứa keyword? | /1 | Không phải IMG_001.jpg |

**Tổng nhóm 9: /4**

---

## Nhóm 10: Technical SEO On-page (5 tiêu chí) {#nhom-10}

| # | Tiêu chí | Điểm | Ghi chú khi audit |
|---|----------|------|-------------------|
| 10.1 | URL ngắn, có keyword, viết thường, dùng dấu gạch ngang? | /1 | /ten-bai-viet không phải /TenBaiViet |
| 10.2 | Canonical tag đúng, không self-duplicate? | /1 | |
| 10.3 | Schema markup phù hợp (Article, FAQ, HowTo, Product, BreadcrumbList)? | /1 | |
| 10.4 | Core Web Vitals pass: LCP < 2.5s, CLS < 0.1, INP < 200ms? | /1 | Kiểm tra PageSpeed Insights |
| 10.5 | Bài mobile-friendly, text không bị cắt, button đủ lớn? | /1 | |

**Tổng nhóm 10: /5**

---

## Thang điểm tổng hợp {#thang-diem}

| Nhóm | Tổng điểm tối đa |
|------|-----------------|
| 1. Search Intent & Keyword | 5 |
| 2. Title & Meta Description | 6 |
| 3. Table of Contents | 4 |
| 4. Cấu trúc bài viết | 6 |
| 5. Văn phong tiếng Việt & UX | 6 |
| 6. EEAT | 6 |
| 7. FAQ | 5 |
| 8. Internal & External Linking | 4 |
| 9. Hình ảnh & Media | 4 |
| 10. Technical SEO On-page | 5 |
| **TỔNG** | **51** |

**Thang đánh giá:**
| Điểm % | Màu | Kết luận |
|--------|-----|----------|
| ≥ 85% (44+/51) | 🟢 | Tốt — tinh chỉnh nhỏ |
| 70–84% (36–43/51) | 🟡 | Khá — optimize có chọn lọc |
| 55–69% (28–35/51) | 🟠 | Trung bình — cải thiện đáng kể |
| < 55% (< 28/51) | 🔴 | Yếu — cần viết lại / cấu trúc lại |