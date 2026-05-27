---
title: "Viết CV Bằng LaTeX Trên Overleaf Cho Fresher IT"
author: "Nguyễn Hữu Khải - khaizinam"
pubDatetime: 2026-05-26T19:19:43.000Z
slug: cach-tao-cv-bang-latex
lang: vi
featured: false
draft: false
tags:
  - "NgoaiLe"
description: "Hướng dẫn viết CV bằng LaTeX trên Overleaf cho fresher IT: chọn template, dùng AI đúng cách, giữ CV gọn 1 trang và tránh lan man."
ogImage: "https://cdn.khaizinam.io.vn/blog-folder/2026-05/cv-latex-1.jpg"
---

Viết CV bằng LaTeX hợp với người đi IT vì bố cục gọn, PDF sạch, link rõ và rất dễ giữ CV trong 1 trang. Nếu bạn đang loay hoay với Word, Canva, hoặc muốn dùng AI để hỗ trợ nhưng sợ CV bị dài và rối, bài này đi thẳng vào cách làm trên Overleaf, cách viết prompt AI và những lỗi cần tránh trước khi gửi cho HR.

![CV IT bằng Latex trên OverLeaf - Khaizinam Blog](https://cdn.khaizinam.io.vn/blog-folder/2026-05/cv-latex-1.jpg)

Nếu bạn muốn đi tiếp theo đúng mạch xây hồ sơ, xem thêm [CV IT 1 Trang Hay 3 Trang: Bài Học Đắt Giá Khi Để AI Build CV Giúp Bạn](/cv-it-junior-bi-reject), [Cover Letter Fresher IT: Cách Viết Để Được Gọi Phỏng Vấn](/cover-letter-fresher-it) và [Portfolio cho dev junior - cần có gì để được chú ý](/portfolio-developer-junior).

### Mục lục

1. [Vì sao nên viết CV bằng LaTeX](#ban-chat)
2. [Overleaf là gì và nên dùng khi nào](#overleaf)
3. [Chuẩn bị gì trước khi bắt đầu](#chuan-bi)
4. [Cách viết CV bằng LaTeX trên Overleaf](#thuc-thi)
5. [Prompt AI để viết nội dung CV](#prompt-ai)
6. [Những lỗi cần tránh](#sai-lam)
7. [FAQ](#faq)

<a id="ban-chat"></a>
### 1. Vì sao nên viết CV bằng LaTeX

LaTeX phù hợp với CV kỹ thuật vì nó cho bố cục ổn định, khoảng cách đồng nhất, tiêu đề rõ và PDF xuất ra rất sạch. Khi bạn thêm hay bớt một dòng, layout không bị vỡ như nhiều file Word tự chỉnh tay.

Điểm mạnh của LaTeX không phải là "làm CV đẹp tự động", mà là giúp bạn kiểm soát phần trình bày tốt hơn. Với người làm IT, điều này quan trọng vì CV thường cần ngắn, gọn, có link GitHub, có dự án, và không được rối mắt.

LaTeX cũng hợp khi bạn muốn:

* Giữ CV trong 1 trang mà vẫn còn chỗ cho dự án và kỹ năng.
* Tạo nhiều phiên bản CV theo từng job mà không phải chỉnh lại toàn bộ file.
* Chèn link GitHub, LinkedIn, portfolio, email một cách sạch sẽ.
* Xuất PDF đồng nhất trên mọi máy.

Điều cần nói rõ: LaTeX không cứu được một CV nội dung yếu. Nếu bullet point dài, chung chung, hoặc nhồi quá nhiều công nghệ không liên quan, bản CV vẫn sẽ tệ dù trình bày tốt.

<a id="overleaf"></a>
### 2. Overleaf là gì và nên dùng khi nào

Overleaf là trình soạn thảo LaTeX chạy trên web. Bạn không cần cài TeX local, có thể mở template, sửa nội dung, xem PDF ngay trong trình duyệt và xuất file sau khi hoàn tất.

Với người mới bắt đầu, Overleaf là cách nhanh nhất để viết CV bằng LaTeX. Theo tài liệu chính thức của Overleaf, gói free có thể tạo project, chia sẻ và làm việc trên các project cơ bản mà không cần cài đặt gì thêm. Tham khảo: [Overleaf free plan](https://www.overleaf.com/learn/how-to/Is_Overleaf_free_to_use%3F) và [Overleaf docs](https://docs.overleaf.com/getting-started/free-and-premium-plans).

Nếu bạn chỉ viết một CV cá nhân, bản miễn phí thường đã đủ để bắt đầu. Phần đáng làm kỹ không phải là nâng cấp gói, mà là chọn template phù hợp và viết nội dung cho gọn.

<a id="chuan-bi"></a>
### 3. Chuẩn bị gì trước khi bắt đầu

Trước khi mở Overleaf, hãy chuẩn bị sẵn:

* Thông tin cá nhân: tên, email, số điện thoại, GitHub, LinkedIn, portfolio.
* Học vấn: trường, ngành, thời gian học, GPA nếu đủ tốt.
* Kỹ năng: chỉ giữ những gì bạn thật sự dùng được.
* Dự án: 2 đến 3 dự án tốt nhất, mỗi dự án có mô tả, vai trò, công nghệ, kết quả.
* Mục tiêu ứng tuyển: fresher backend, frontend, fullstack, intern hoặc junior.

CV fresher nên ưu tiên 1 trang. Nếu nội dung còn thiếu, hãy thêm chất lượng cho bullet point và kết quả thay vì kéo dài sang 2 đến 3 trang.

![Viết CV bằng latex trên OverLeaf - Khaizinam Blog](https://cdn.khaizinam.io.vn/blog-folder/2026-05/cv-latex-2.jpg)

<a id="thuc-thi"></a>
### 4. Cách viết CV bằng LaTeX trên Overleaf

Quy trình cơ bản:

1. Mở Overleaf và tạo một project mới.
2. Chọn template resume/CV có bố cục tối giản.
3. Thay thông tin mẫu bằng thông tin của bạn.
4. Thêm dự án theo công thức: hành động + công nghệ + kết quả.
5. Compile PDF và kiểm tra lại toàn bộ text.
6. Xuất bản PDF sau khi đã đọc lại lần cuối.

Nếu bạn muốn tự viết từ đầu, một khung LaTeX tối thiểu có thể trông như sau:

```latex
\documentclass[10pt,a4paper]{article}
\usepackage[margin=0.7in]{geometry}
\usepackage{hyperref}
\usepackage{enumitem}

\begin{document}

\begin{center}
    {\LARGE NGUYEN VAN A}\\
    \href{mailto:email@gmail.com}{email@gmail.com} \textbar{}
    0901-234-567 \textbar{}
    \href{https://github.com/yourprofile}{github.com/yourprofile}
\end{center}

\section*{SKILLS}
\begin{itemize}[leftmargin=*]
    \item JavaScript, TypeScript, React, Node.js, MySQL
\end{itemize}

\section*{PROJECTS}
\textbf{Task Manager} \hfill \href{https://github.com/yourprofile/task-manager}{GitHub}
\begin{itemize}[leftmargin=*]
    \item Xay dung ung dung quan ly cong viec voi React va Node.js.
    \item Toi uu giao dien va API de luu du lieu theo tung user.
\end{itemize}

\end{document}
```

Đây chỉ là khung mẫu. Khi làm thật, bạn nên rút bớt những phần không cần thiết và giữ nội dung sát đúng job mục tiêu.

<a id="prompt-ai"></a>
### 5. Prompt AI để viết nội dung CV

AI hữu ích nhất ở 3 chỗ: tạo khung LaTeX, viết lại bullet point cho ngắn hơn, và audit lần cuối để cắt phần lan man. Không nên để AI tự quyết toàn bộ CV.

Nếu bạn đang hoàn thiện bộ hồ sơ ứng tuyển, hãy đọc thêm [portfolio developer junior](/portfolio-developer-junior) để biết nên đưa project nào vào, và [cover letter fresher IT](/cover-letter-fresher-it) để nối CV với một thư giới thiệu ngắn gọn, đúng trọng tâm.

Prompt 1, tạo khung LaTeX:

```text
Hãy tạo một file LaTeX CV IT cho fresher, bố cục 1 trang, tối giản, có các phần:
thông tin cá nhân, học vấn, kỹ năng, dự án, hoạt động.
Ưu tiên trình bày sạch, dễ đọc, có hyperlink cho email, GitHub, LinkedIn.
Không dùng quá nhiều màu sắc, không làm layout quá phức tạp.
```

Prompt 2, viết lại bullet dự án:

```text
Viết lại 3 bullet point cho dự án sau theo công thức:
hành động + công nghệ + kết quả.
Giữ mỗi bullet ngắn, rõ, không thổi phồng.
Nếu có chỗ nào nghe chung chung hoặc dài dòng, hãy cắt bớt.

[dán nội dung dự án vào đây]
```

Prompt 3, audit cuối cùng:

```text
Hãy audit CV này như một HR cho vị trí fresher IT.
Tìm chỗ nào quá dài, nhồi keyword, nghe phóng đại, hoặc không rõ đóng góp thật.
Đề xuất chỗ cần rút gọn để CV giữ trong 1 trang.
Sau đó tóm tắt thành checklist những việc tôi cần sửa tay.

[dán CV vào đây]
```

Nguyên tắc nên giữ là: AI hỗ trợ, bạn duyệt. Nếu AI viết quá tay, nó có thể biến CV thành một bản dài, nhiều chữ nhưng thiếu trọng tâm.

<a id="sai-lam"></a>
### 6. Những lỗi cần tránh

* CV dài 3 đến 4 trang cho fresher. HR thường không có thời gian để đọc một bản quá dài nếu nội dung chưa đủ mạnh.
* Để AI toàn quyền quyết định. AI nên gợi ý, còn bạn phải chốt lại số liệu, dự án và mức độ thật của kinh nghiệm.
* Nhồi keyword công nghệ. Nếu phần kỹ năng và dự án bị lặp quá nhiều từ khóa, CV sẽ rối và mất tự nhiên.
* Trang trí quá tay. Màu sắc, icon, khung viền hoặc cột quá nhiều làm CV nặng và khó đọc.
* Link lỗi. GitHub, LinkedIn, portfolio phải mở được ngay, không để đến lúc nộp mới phát hiện sai.
* Không đọc lại lần cuối. Sau khi AI xong, hãy nhìn lại thành quả một lượt nữa trước khi xuất PDF và gửi đi.
* Chỉ chăm phần CV mà bỏ qua cover letter và portfolio. Với fresher, bộ ba này thường nên đi cùng nhau; nếu thiếu một phần, hồ sơ dễ bị hụt lực.

<a id="faq"></a>
### 7. FAQ

##### CV fresher nên dài bao nhiêu trang?

Thường là 1 trang. Nếu bạn mới ra trường, điều HR cần nhất là thông tin liên hệ, kỹ năng chính, 2 đến 3 dự án tốt nhất và link liên quan. Đừng kéo dài sang 2 đến 3 trang chỉ vì muốn nhét thêm nội dung.

##### Có nên để AI viết toàn bộ CV không?

Không nên. AI có thể hỗ trợ viết LaTeX, viết lại bullet point và phát hiện chỗ lan man, nhưng bạn vẫn phải tự kiểm tra từng dòng. CV là thứ phản ánh đúng năng lực và vai trò thật của bạn.

##### Có nên nhồi nhiều keyword công nghệ để qua ATS không?

Không. Keyword nên xuất hiện tự nhiên trong phần kỹ năng và dự án. Nhồi quá nhiều làm CV rối, thiếu tin cậy và khó đọc hơn.

##### Overleaf có đủ để làm CV không?

Có. Với CV cá nhân, gói free thường đã đủ để bắt đầu. Quan trọng hơn là chọn template phù hợp, viết nội dung gọn và kiểm tra lại PDF trước khi dùng.

##### Tại sao không dùng Canva cho nhanh?

Canva tiện cho thiết kế, nhưng với CV kỹ thuật, LaTeX thường cho PDF sạch hơn, link rõ hơn và bố cục ổn định hơn. Nếu mục tiêu là hồ sơ gọn, nghiêm túc và dễ đọc, LaTeX là lựa chọn hợp hơn.

#### Tổng kết

Viết CV bằng LaTeX là cách hợp lý nếu bạn muốn một bản CV gọn, rõ, dễ kiểm soát và phù hợp với người đi IT. Overleaf giúp bạn bắt đầu nhanh, còn AI giúp tăng tốc phần nội dung, nhưng người quyết định cuối cùng vẫn là bạn.

Điểm quan trọng nhất là đừng để CV dài lan man. Hãy giữ nó ngắn nhưng đủ, đọc lại thành quả trước khi gửi, và chỉ dùng AI như một trợ lý để chỉnh cho tốt hơn.
