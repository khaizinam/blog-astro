---
description: Work flow fix URL SEO content
---

# SEO Content Editing Workflow

Khi nhận được yêu cầu thêm, sửa, xoá nội dung bài viết (Markdown/Astro), hãy luôn thực hiện các bước sau để đảm bảo chuẩn SEO và tránh các án phạt từ công cụ tìm kiếm:

## 1. Quản lý URL & Redirect (Chống lỗi 404 và mất điểm SEO)
- Khi có bất kỳ yêu cầu nào liên quan đến **sửa đổi slug** (URL) của bài viết, hoặc **xoá bài viết**, BẮT BUỘC phải thực hiện cấu hình redirect 301.
- Bạn phải cập nhật đồng thời ở **2 nơi**:
  1. File `_redirects.txt` ở thư mục gốc của dự án (`/var/www/blog.khaizinam/_redirects.txt`).
  2. Block `redirects:` trong file `/var/www/blog.khaizinam/astro.config.ts`.src/content/posts/
- **Cú pháp redirect 301**:
  ```
  /url-cu /url-moi 301
  /url-cu/ /url-moi/ 301
  ```
- **Lưu ý**: Cần thêm cả bản có dấu `/` (trailing slash) và không có dấu `/` ở cuối. Nếu là bài đa ngôn ngữ (tiếng Anh), đừng quên tiền tố `/en/`.
- **Cập nhật Internal Links**: BẤT CỨ KHI NÀO có hành động thay đổi URL (slug) hoặc xoá bài, Agent BẮT BUỘC phải check (sử dụng công cụ grep_search) toàn bộ kho lưu trữ `src/content/posts` xem có bất kỳ bài viết nào khác đang trỏ internal link về URL cũ hay không. Nếu có, bắt buộc phải update lại sang URL mới để loại bỏ mọi liên kết hỏng.

## 2. Tiêu chuẩn Tiêu đề (Title) - Tối đa 70 ký tự
- **Quy tắc**: Thẻ `title` trong Markdown phải đảm bảo độ dài lý tưởng dưới 70 ký tự để không bị cắt cụt trên Google/Bing.
- **Hành động bắt buộc**: 
  1. Khi sửa hoặc tạo title mới, hãy đếm số ký tự của title.
  2. Nếu vượt quá 70 ký tự, hãy cảnh báo cho user biết.
  3. **LUÔN LUÔN đề xuất** cho user 2-3 lựa chọn tiêu đề mới đáp ứng tiêu chí < 70 ký tự, đồng thời phân tích lý do tại sao nó phù hợp với Search Intent (mục đích tìm kiếm) của người dùng hiện tại.

## 3. Tiêu chuẩn Mô tả (Description) - Tối đa 160 ký tự
- **Quy tắc**: Thẻ `description` trong Markdown phải giới hạn trong khoảng 140 - 160 ký tự.
- **Hành động bắt buộc**:
  1. Nếu description quá dài, nó sẽ bị search engine cắt bỏ và thay bằng nội dung ngẫu nhiên trong bài. Nếu quá ngắn, sẽ mất cơ hội chèn từ khoá (keyword).
  2. Khi viết description, hãy chèn các LSI keywords (từ khóa liên quan) hoặc các stack/công nghệ cụ thể để tăng CTR.
  3. **Đề xuất** cho user các phiên bản description tối ưu, rõ ràng và đánh trúng tâm lý người đọc.

## 4. Kiểm tra sự tồn tại của file bị nhân bản
- Nếu đổi tên file (rename file) hoặc đổi slug bằng terminal, hãy đảm bảo IDE của user không tự động lưu lại bản nháp và tạo ra 1 file rác mang tên cũ. Hãy dùng lệnh kiểm tra số lượng file (hoặc check sự tồn tại) và xóa bỏ file cũ nếu cần thiết.
