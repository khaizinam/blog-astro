---
title: "Tôi đã bỏ Antigravity quay về với Codex và VSCode"
author: "Nguyễn Hữu Khải"
pubDatetime: 2026-05-25 02:00:00
slug: antigravity-ide-2-0-that-vong-quay-ve-vscode
lang: vi
translationKey: post-241
featured: true
draft: false
tags:
  - "NgoaiLe"
description: "Không phải vì tôi chưa thử đủ, không phải vì tôi ngại học tool mới. Mà vì tôi ngồi nhìn `htop` 20 phút và thấy `antigravity-server` đang ăn RAM như thể đang train model ngay trên máy mình - trong khi tôi chỉ đang viết một cái API đơn giản."
ogImage: "https://cdn.khaizinam.io.vn/blog-folder/2026-05/antigravity-2-0.jpg"
---

Chiều hôm nay tôi gỡ Antigravity khỏi máy.

Không phải vì tôi chưa thử đủ, không phải vì tôi ngại học tool mới. Mà vì tôi ngồi nhìn `htop` 20 phút và thấy `antigravity-server` đang ăn RAM như thể đang train model ngay trên máy mình - trong khi tôi chỉ đang viết một cái API đơn giản.

![Tôi đã bỏ Antigravity quay về với Codex và VSCode](https://cdn.khaizinam.io.vn/blog-folder/2026-05/antigravity-2-0.jpg)

Máy giật. Quạt chạy ầm. IDE lag đến mức gõ chữ hiện sau 2 giây. Đó không phải là môi trường để làm việc. Đó là môi trường để mất kiên nhẫn.

**Mục lục**

- [1. Antigravity là gì - và tại sao nó hấp dẫn ban đầu](#1-antigravity-la-gi-va-tai-sao-no-hap-dan-ban-dau)
- [2. Chuyện xảy ra hôm nay: ép update bằng cách bóp hiệu năng](#2-chuyen-xay-ra-hom-nay-ep-update-bang-cach-bop-hieu-nang)
- [3. Vấn đề thật sự: Gemini model đang đi xuống](#3-van-de-that-su-gemini-model-dang-di-xuong)
- [4. Tôi quay về gì và tại sao](#4-toi-quay-ve-gi-va-tai-sao)
- [5. Cộng đồng đang phàn nàn gì](#5-cong-dong-dang-phan-nan-gi)
- [6. Nếu bạn vẫn muốn quay lại Antigravity 1.xx để dùng hết token](#6-neu-ban-van-muon-quay-lai-antigravity-1xx-de-dung-het-token)
- [7. Kết](#7-ket)

---

## 1. Antigravity là gì - và tại sao nó hấp dẫn ban đầu

Antigravity là AI IDE do Google ra mắt cuối 2025, được xây dựng trên nền **VS Code fork** (thông qua codebase từ team Windsurf cũ mà Google thâu tóm). Về kỹ thuật, nó là một Electron app, dùng TypeScript làm core, giao tiếp với Gemini models qua API. Không có gì magic ở đây - về bản chất nó cũng giống Cursor hay Windsurf, chỉ là Google thay model bằng Gemini và thêm vào kiến trúc multi-agent "Plan → Build → Verify".

![Antigravity là gì - và tại sao nó hấp dẫn ban đầu](https://cdn.khaizinam.io.vn/blog-folder/2026-05/agy2-layout.jpg)

Lý do nhiều dev thử dùng nó? Vì Google free. Vì nó agentic. Vì lúc demo thì trông rất ngầu.

Nhưng thực tế dùng thì khác.

---

## 2. Chuyện xảy ra hôm nay: ép update bằng cách bóp hiệu năng

Sáng nay tôi dùng Antigravity v1 như bình thường. Đến chiều thì mọi thứ thay đổi. IDE bắt đầu lag liên tục. Check `htop` thì thấy `antigravity-server` ngốn RAM leo thang không dừng. Máy gần như đứng hình.

Lúc đầu tôi nghĩ do dự án. Xong tôi tắt tất cả, mở project mới, kết quả y như cũ.

Ngoài lag chung, còn có một bug cực kỳ phiền toái: **Ctrl + V bị hang hoàn toàn**. Bạn copy code từ đâu đó, muốn paste vào IDE, nhưng paste không vào. Phải spam Ctrl + V liên tục 5-6 lần, mỗi lần chờ khoảng 1-2 giây, mới paste được một lần. Nó không fail ngay, nó chỉ đơn giản là không có phản hồi. Như IDE đang bận xử lý cái gì đó invisible. Thật mà nói, đó là trải nghiệm user tệ nhất - vì việc paste là hành động cơ bản, xảy ra 50 lần/giờ, và mỗi lần bạn phải spam 5-6 lần thì sự tích tụ của sự bực bội là khổng lồ.

Sau khi search thì thấy mình không cô đơn. Google vừa push Antigravity 2.0 sau Google I/O 2026 - và cộng đồng đang nổi giận. Không phải vì tính năng mới, mà vì cách họ làm:

- **Giao diện 2.0 ban đầu xóa sổ built-in IDE**, đẩy user vào một cái chat interface trống rỗng, khiến hầu hết dev tưởng Google đã khai tử editor.
- **Conversation history bị mất** sau update - data bị kẹt trong một backup folder.
- **Gemini usage quota bị siết**, rồi sau đó bị siết thêm, rồi sau đó Google phải "xin lỗi" bằng cách reset quota vì backlash quá lớn.

Phải đến khi Google employee lên X thừa nhận "chúng tôi đáng lẽ phải rõ ràng hơn từ đầu" thì họ mới push thêm một patch để restore nút "Open IDE". Một nút. Cần cả một patch khẩn cấp để restore lại cái nút đó.

Và rồi cái thông báo này xuất hiện trong IDE của tôi:

> **Quotas Increased**
> *"If you are on a paid plan, your Gemini quota has been reset for the week and increased by 3x moving forward. Keep building!"*

Đọc xong tôi ngồi im một lúc.

Họ ép bạn update bằng cách làm IDE v1 lag đến mức không dùng được. Sau khi bạn chịu đựng xong cái rollout thảm họa - mất IDE, mất conversation history, máy giật liên tục - thì họ thưởng cho bạn bằng... quota tăng 3x. Như kiểu bồi thường sau tai nạn bằng một voucher giảm giá.

Đây không phải là cách một sản phẩm trưởng thành vận hành. Đây là vết nứt trong product strategy của Google: họ có compute, có model, có distribution - nhưng họ đang treat developer như con tin thay vì như người dùng cần được respect.

Đây là kiểu rollout mà nếu một startup nhỏ làm, cộng đồng đã review 1 sao hàng loạt. Vì Google làm thì nó trở thành "chaotic but fixable". Nhưng với tôi - một dev dùng tool để kiếm sống - "fixable sau khi xong workflow của tao" không phải là tiêu chuẩn chấp nhận được.

---

## 3. Vấn đề thật sự: Gemini model đang đi xuống

Đây mới là lý do cốt lõi tôi không muốn ở lại Antigravity - dù IDE có tốt đến đâu.

Gemini Flash và Gemini Pro trong thời gian gần đây nhận được vô số phàn nàn từ cộng đồng dev:

**Loop rác tốn token.** Gõ một prompt đơn giản, model gọi request vòng lặp liên tục - tool call → error → retry → tool call → error - trước khi ra được kết quả, hoặc không ra được gì cả. Token bốc khói trong khi bạn chờ.

**Code sai ngày càng nhiều.** Không phải "sai theo kiểu sáng tạo", mà sai theo kiểu tự tin gọi API không tồn tại, viết syntax không valid, rồi khi lỗi thì bắt đầu tự mắng bản thân theo kiểu:

> *"I quit. I am clearly not capable of solving this problem. The code is cursed. I have made so many mistakes that I can no longer be trusted."*

Câu trên là Gemini thật sự nói với một user đang debug. Không phải tôi bịa.

Google's AI lead Logan Kilpatrick gọi đây là "annoying infinite looping bug" - nhưng cái bug này đã tồn tại đủ lâu để trở thành meme trong cộng đồng.

**Stability crisis hậu I/O 2026.** Trên Google AI Developers Forum, thread tiêu đề *"The 2026 Stability Crisis: Gemini has become the most unreliable frontier AI"* ghi nhận: kể từ đầu tháng 4 và nhất là sau I/O 2026, Gemini liên tục bị stuck ở "Thinking…" vô tận, API timeout không rõ lý do, và output chất lượng giảm rõ rệt so với các tháng trước.

So sánh với Codex (dùng GPT-4o/o3) và Claude - sự khác biệt trong 2 tuần gần đây là rõ. Không phải tuyệt đối, nhưng đủ để cảm nhận trong workflow hàng ngày.

---

## 4. Tôi quay về gì và tại sao

**VSCode + Codex CLI** cho flow coding chính. Không có Electron agent nặng nề, không có background server ngốn RAM. Codex chạy từ terminal, context rõ ràng, kiểm soát được hoàn toàn. Và tốt nhất là - Codex hiện tại đang free gói Plus (ChatGPT Plus free bạn nào), nên tôi không ngại gì để quay về dùng thử. Nếu không ổn định, tôi có thể chuyển sang tool khác mà không mất tiền.

**Claude** cho những task cần reasoning: refactor logic phức tạp, review architecture, viết test case. Claude 4 Sonnet hiện tại đang ở trạng thái tốt nhất từ trước đến nay - và quan trọng hơn, nó ổn định.

Thành thật mà nói: tôi không chống AI IDE. Cursor vẫn là tool tôi recommend cho team. Nhưng có sự khác biệt lớn giữa một AI IDE giúp bạn code nhanh hơn, và một AI IDE ăn RAM + đẩy update ép buộc + dùng model đang trong giai đoạn unstable.

---

## 5. Cộng đồng đang phàn nàn gì

Dưới đây là một số bình luận tiêu biểu từ cộng đồng lập trình (chủ yếu từ Reddit) sau update Antigravity 2.0:

**IshuPrabhakar** *(OP):*
> Giờ tui tìm không ra cái trình soạn thảo kiểu VS Code ngày xưa nữa. Bản cập nhật Antigravity 2.0 giờ đỉnh của chóp luôn. Hôm qua tui thức gần 2 tiếng khuya để mò xem cái setup cũ đi đâu mất. Mở IDE còn không được nữa.

**disarm:**
> Tôi đã tải IDE về nhưng khi mở lên, tôi chỉ thấy cửa sổ quản lý agent... Tôi đã gỡ cài đặt và quay lại phiên bản cũ hoạt động tốt. Tôi phát mệt với cách họ tung ra các bản cập nhật. Sẽ tìm các giải pháp khác.

**Royal_Bath_4113:**
> Cái "2.0" đó đó, chào mừng đến với hội coder "thích" thế giới này... đúng là rác rưởi vãi.

**polysoma:**
> Hình ảnh trong bình luận: cái tùy chọn 'cho phép truy cập tất cả dữ liệu' là bắt buộc để tiếp tục (dù sau này bạn có thể chọn không tham gia), tệ thật. Quay lại VSCode thôi.

Những phàn nàn này không phải vô cớ. Chúng phản ánh một vấn đề khách quan: **Google đã ưu tiên tính năng AI agent hơn là trải nghiệm editor cơ bản mà developer cần hàng ngày**.

---

## 6. Nếu bạn vẫn muốn quay lại Antigravity 1.xx để dùng hết token

Nếu bạn chưa sẵn sàng bỏ hoàn toàn, hoặc muốn tiếp tục tối ưu hóa token miễn phí của tháng, đây là cách để quay trở lại version 1.xx mà không bị ép update:

**Bước 1: Xóa bản Antigravity 2.0 hiện tại**
- Trên Mac: Mở Applications, tìm Antigravity, kéo vào Trash (hoặc cmd + delete)
- Trên Linux: `sudo apt remove antigravity` hoặc xóa thủ công tùy theo cách cài
- Trên Windows: Control Panel → Add/Remove Programs → Antigravity → Uninstall

**Bước 2: Tải Antigravity 1.xx mới nhất từ trang chủ**
- Truy cập [antigravity.google/download](https://antigravity.google/download)
- Scroll xuống, tìm phần "Antigravity IDE (Version 1.x)" hoặc "Previous Versions"
- Tải phiên bản 1.xx mới nhất (không phải 2.0)
- Cài đặt bình thường

**Bước 3: Tắt tính năng auto-update**
- Mở Antigravity IDE 1.xx
- Vào **Settings** (Ctrl+,)
- Tìm mục "Updates" hoặc "Automatic Updates"
- Chuyển đổi sang **"Manual"** hoặc **"Disabled"**
- Lưu lại

**Bước 4: Xác nhận**
- Restart IDE
- Kiểm tra không có thông báo update nào hiện lên
- Yên tâm dùng hết token của tháng

Mẹo thêm: Nếu bạn muốn chắc chắn hơn, có thể tắt hoàn toàn connection đến update server bằng cách thêm rule vào firewall hoặc hosts file, nhưng việc tắt trong Settings là đủ với hầu hết trường hợp.

**May mắn!** 🍀

---

## 7. Kết

Nếu bạn đang dùng Antigravity và cũng gặp tình trạng lag, RAM spike, hay IDE biến mất sau update 2.0 - bạn không bị ảo. Đây là vấn đề thật, đang được thừa nhận, và Google đang vá từng bước.

Nhưng trong lúc chờ Google ổn định lại cả IDE lẫn model, tôi không có lý do gì để ngồi đợi trên một máy đang giật.

VSCode vẫn ở đây. Codex vẫn ở đây. Claude vẫn ở đây.

Đó là đủ.

---

*Bạn đang dùng AI IDE nào trong 2026? Comment bên dưới.*