---
title: "Câu Hỏi Phỏng Vấn ReactJS Junior: Hooks, Virtual DOM, State - Tổng Hợp Đầy Đủ Kèm Đáp Án"
author: "Nguyễn Hữu Khải - khaizinam"
pubDatetime: 2026-04-04T11:36:05.000Z
slug: cau-hoi-phong-van-reactjs-junior-hooks-virtual-dom-state-tong-hop-day-du-kem-dap-an
lang: vi
translationKey: post-215
featured: false
draft: false
tags:
  - "SeriesPhongVan"
description: "Chuẩn bị phỏng vấn ReactJS junior nhưng không biết trọng tâm nằm ở đâu? Bài viết tổng hợp 25+ câu hỏi phỏng vấn ReactJS junior thực tế nhất - từ Virtual DOM, Hooks, State management đến performance - kèm phân tích sâu để bạn trả lời tự tin, không bị hỏi khó ở bất kỳ vòng kỹ thuật nào."
---

Chuẩn bị phỏng vấn ReactJS junior nhưng không biết trọng tâm nằm ở đâu? Bài viết tổng hợp 25+ câu hỏi phỏng vấn ReactJS junior thực tế nhất - từ Virtual DOM, Hooks, State management đến performance - kèm phân tích sâu để bạn trả lời tự tin, không bị hỏi khó ở bất kỳ vòng kỹ thuật nào.

ReactJS là framework frontend phổ biến nhất Việt Nam hiện tại, và cũng là nơi có khoảng cách lớn nhất giữa "biết dùng" và "hiểu tại sao". Interviewer không hỏi bạn có viết được component không - họ hỏi bạn hiểu React hoạt động bên trong ra sao, tại sao re-render xảy ra, và bạn đã từng tối ưu performance chưa. Bài viết này sẽ giúp bạn lấp đầy khoảng cách đó.

### Mục Lục

1\. [Bản chất React và Virtual DOM](#ban-chat-react-va-virtual-dom)

2\. [Câu hỏi về Hooks - useState, useEffect, useCallback, useMemo](#cau-hoi-ve-hooks)

3\. [Câu hỏi về State và Props](#cau-hoi-ve-state-va-props)

4\. [Câu hỏi về Component lifecycle và re-render](#cau-hoi-ve-component-lifecycle-va-re-render)

5\. [Câu hỏi về State management - Context vs Redux](#cau-hoi-ve-state-management)

6\. [Case study thực tế](#case-study-thuc-te)

7\. [Sai lầm phổ biến khi trả lời câu hỏi ReactJS](#sai-lam-pho-bien-khi-tra-loi-cau-hoi-reactjs)

8\. [Hỏi đáp nhanh](#hoi-dap-nhanh)

* * *

#### Bản Chất React Và Virtual DOM

##### Virtual DOM là gì và tại sao React dùng nó?

DOM thật (Real DOM) rất chậm để thao tác trực tiếp - mỗi lần update một node, browser phải reflow và repaint toàn bộ hoặc một phần trang. Virtual DOM là một bản sao nhẹ của DOM thật, được lưu trong bộ nhớ JavaScript.

Khi state thay đổi, React tạo một Virtual DOM mới, so sánh với Virtual DOM cũ thông qua quá trình gọi là **diffing**, tìm ra điểm khác biệt tối thiểu, rồi chỉ cập nhật đúng những phần đó trên DOM thật - quá trình này gọi là **reconciliation**. Kết quả là ít thao tác DOM thật hơn, UI nhanh hơn.

**Điểm cần nhấn mạnh khi trả lời:** Virtual DOM không phải magic làm mọi thứ nhanh hơn tuyệt đối - nó là sự đánh đổi. Với ứng dụng nhỏ, overhead của diffing đôi khi còn chậm hơn thao tác DOM trực tiếp. React tỏa sáng khi UI phức tạp, nhiều component update cùng lúc.

##### React Fiber là gì - có cần biết khi phỏng vấn junior không?

React Fiber là kiến trúc reconciliation được viết lại hoàn toàn từ React 16. Trước Fiber, reconciliation là synchronous - một khi bắt đầu thì không thể dừng, làm UI bị block nếu update phức tạp. Fiber chia công việc thành các đơn vị nhỏ (fiber nodes), cho phép React tạm dừng, ưu tiên lại, hoặc hủy bỏ giữa chừng.

Với junior, không cần hiểu sâu implementation - nhưng biết Fiber là nền tảng cho Concurrent Features (Suspense, useTransition) là điểm cộng rõ ràng nếu interviewer hỏi "React có gì mới trong các version gần đây?"

##### Key prop trong list rendering hoạt động thế nào?

Khi render một danh sách, React dùng **key** để identify từng element trong quá trình diffing. Key giúp React biết element nào được thêm, xóa, hoặc di chuyển - từ đó tối thiểu số lần update DOM thật.

Sai lầm phổ biến nhất: dùng index của array làm key. Khi list bị sort hoặc filter, index thay đổi nhưng data không đổi - React sẽ re-render nhầm. **Key phải là stable, unique identifier - thường là ID từ database.**

#### Câu Hỏi Về Hooks

##### useState hoạt động như thế nào - tại sao setState là async?

useState trả về một cặp: giá trị state hiện tại và một setter function. Khi gọi setter, React không cập nhật state ngay lập tức - nó **schedule** một re-render. Trong cùng một event handler, nhiều setState calls có thể được batch lại và chỉ trigger một lần re-render duy nhất (React 18 auto-batching).

Đây là lý do đoạn code sau không hoạt động như mong đợi:

const \[count, setCount\] = useState(0);
setCount(count + 1);
setCount(count + 1); // vẫn là 1, không phải 2

Fix đúng: dùng functional update form - `setCount(prev => prev + 1)` - để luôn làm việc với giá trị mới nhất.

##### useEffect - dependency array hoạt động thế nào?

useEffect nhận hai tham số: một callback function và một dependency array. React so sánh dependency array sau mỗi render:

*   **Không có dependency array:** Effect chạy sau mỗi render.
*   **Array rỗng \[\]:** Effect chỉ chạy một lần sau lần render đầu tiên (tương đương componentDidMount).
*   **Array có giá trị \[a, b\]:** Effect chạy lại khi a hoặc b thay đổi.

**Cleanup function:** Nếu effect return về một function, React gọi function đó trước khi chạy effect tiếp theo hoặc khi component unmount - dùng để clear interval, cancel fetch, unsubscribe event listener.

##### useCallback và useMemo - khi nào cần dùng?

**useMemo** memoize kết quả tính toán: `const result = useMemo(() => expensiveCalc(a, b), [a, b])` - chỉ tính lại khi a hoặc b thay đổi. Dùng khi có computation nặng trong render.

**useCallback** memoize một function: `const fn = useCallback(() => doSomething(a), [a])` - trả về cùng một function reference nếu dependency không đổi. Dùng khi truyền callback xuống child component đã được wrapped bằng React.memo để tránh re-render không cần thiết.

**Quan trọng:** Đừng dùng useCallback/useMemo cho mọi thứ - chúng có overhead riêng. Chỉ dùng khi có vấn đề performance thực sự đo được, không dùng như "best practice" mặc định.

##### useRef dùng để làm gì?

useRef có hai use case chính: truy cập DOM element trực tiếp (`ref.current` trỏ đến DOM node), và lưu một giá trị có thể thay đổi mà **không trigger re-render** khi thay đổi. Use case thứ hai thường bị bỏ qua - rất hữu ích để lưu previous value, track interval ID, hoặc lưu trạng thái không cần hiển thị lên UI.

##### Custom Hook là gì và khi nào nên tạo?

Custom Hook là một JavaScript function bắt đầu bằng "use" và có thể gọi các Hook khác bên trong. Mục đích chính: **tách logic ra khỏi component để tái sử dụng**. Ví dụ: useFetch, useLocalStorage, useDebounce, useWindowSize. Nên tạo Custom Hook khi thấy cùng một logic (kết hợp useState + useEffect) lặp lại ở nhiều component khác nhau.

#### Câu Hỏi Về State Và Props

##### State và Props khác nhau thế nào?

**Props** là dữ liệu được truyền từ component cha xuống con - read-only, component con không được sửa trực tiếp. **State** là dữ liệu do component tự quản lý - có thể thay đổi thông qua setter function, và mỗi lần thay đổi sẽ trigger re-render.

Một câu hỏi hay của interviewer: "Khi nào đặt state ở component cha, khi nào đặt ở component con?" - nguyên tắc là **lift state up**: chỉ đặt state ở component thấp nhất trong cây component mà tất cả consumer cần nó. Nếu chỉ component con dùng, để state ở đó. Nếu nhiều component cùng cấp cần, lift lên component cha chung.

##### Controlled vs Uncontrolled component là gì?

**Controlled component:** Giá trị của input được điều khiển bởi React state - mỗi keystroke gọi onChange, cập nhật state, re-render, input hiển thị giá trị mới. React là "single source of truth".

**Uncontrolled component:** Giá trị được quản lý bởi DOM - dùng useRef để đọc giá trị khi cần. Đơn giản hơn cho form đơn giản, nhưng khó integrate với validation logic phức tạp. Hầu hết form library (React Hook Form, Formik) dùng uncontrolled components bên dưới vì performance tốt hơn.

#### Câu Hỏi Về Component Lifecycle Và Re-render

##### React re-render khi nào?

Component re-render trong bốn trường hợp: state thay đổi, props thay đổi, context thay đổi, hoặc component cha re-render. Điểm thứ tư quan trọng và hay bị bỏ qua - **khi component cha re-render, tất cả component con mặc định cũng re-render**, kể cả khi props không thay đổi.

Để ngăn re-render không cần thiết: dùng **React.memo** để wrap component con - component chỉ re-render khi props thực sự thay đổi (shallow comparison). Kết hợp với useCallback để đảm bảo function props cũng không thay đổi reference.

##### React.memo, PureComponent, và shouldComponentUpdate khác nhau thế nào?

Cả ba đều có mục đích giống nhau - ngăn re-render không cần thiết - nhưng dùng ở các ngữ cảnh khác nhau. **React.memo** là Higher Order Component dùng cho functional component, so sánh props bằng shallow equality. **PureComponent** là class component tương đương với React.memo. **shouldComponentUpdate** là lifecycle method trong class component cho phép custom logic so sánh - linh hoạt nhất nhưng cũng dễ bug nhất nếu implement sai.

#### Câu Hỏi Về State Management

##### Context API là gì và khi nào dùng?

Context API giải quyết vấn đề **prop drilling** - truyền props qua nhiều tầng component trung gian không cần dùng đến. Context tạo một "kênh" cho phép component bất kỳ trong cây subscribe và đọc giá trị mà không cần truyền qua props.

Context phù hợp cho: theme (dark/light mode), ngôn ngữ, thông tin user đang đăng nhập - những thứ ít thay đổi và nhiều component cần đọc. **Không phù hợp** cho state thay đổi thường xuyên vì mỗi lần context value thay đổi, tất cả consumer đều re-render.

##### Redux vs Context API - khi nào cần Redux?

Context API đủ dùng cho hầu hết ứng dụng vừa và nhỏ. Redux phù hợp hơn khi: state phức tạp với nhiều slice liên quan nhau, cần time-travel debugging (Redux DevTools), nhiều action transform cùng một state, hoặc team lớn cần convention rõ ràng về cách manage state.

Một câu trả lời trưởng thành: **"Tôi không mặc định dùng Redux. Tôi bắt đầu với useState và Context, chỉ thêm Redux khi state management thực sự trở nên phức tạp và khó debug."**

#### Case Study Thực Tế

Linh ứng tuyển vị trí Frontend Developer junior tại một startup e-commerce. Interviewer cho xem một đoạn code React và hỏi: "Component này có vấn đề gì về performance không?"

```plaintext
function ProductList({ products, onAddToCart }) {
  return (
      {products.map((p, index) => (  onAddToCart(p.id)}
        />
      ))}
    
  );
}
```

Linh chỉ ra được ba vấn đề: dùng `index` làm key thay vì `p.id`, arrow function inline `() => onAddToCart(p.id)` tạo function mới mỗi lần render nên ProductCard sẽ re-render kể cả khi đã wrap bằng React.memo, và nếu products list dài cần xem xét virtualization (react-window).

Interviewer hỏi thêm: "Bạn sẽ fix như thế nào?" - Linh đề xuất dùng `p.id` làm key, wrap callback bằng useCallback, và thêm React.memo cho ProductCard. **Kết quả: Linh được nhận vào với mức lương cao hơn offer ban đầu vì cho thấy tư duy performance từ code review, không chỉ biết viết feature.**

Để chuẩn bị tốt hơn cho phần tư duy kỹ thuật, đọc thêm [Tips phỏng vấn junior IT A-Z](/tips-phong-van-junior-it-tong-hop-a-z-de-ban-vuot-qua-moi-vong) về cách xử lý câu hỏi kỹ thuật khi bị hỏi sâu hơn dự kiến.

#### Sai Lầm Phổ Biến Khi Trả Lời Câu Hỏi ReactJS

*   **Giải thích Virtual DOM sai - nói nó "nhanh hơn DOM thật":** Virtual DOM không phải lúc nào cũng nhanh hơn - nó là abstraction layer giúp React tối ưu batch updates. Cách fix: giải thích đúng cơ chế diffing và reconciliation, nhắc đến trade-off.
*   **Không biết tại sao không nên dùng index làm key:** Nhiều junior biết "không nên dùng index" nhưng không giải thích được tại sao. Cách fix: nhớ rõ - khi list bị reorder, index thay đổi khiến React re-render sai component, dẫn đến bug khó debug.
*   **Dùng useCallback và useMemo cho mọi thứ:** Premature optimization là anti-pattern. Cả hai hooks đều có overhead - memory cho memoized value và comparison cost. Cách fix: chỉ dùng khi đo được performance problem thực sự, không dùng "cho chắc".
*   **Nhầm useEffect cleanup với componentWillUnmount:** Cleanup function chạy không chỉ khi unmount mà còn trước mỗi lần effect chạy lại. Cách fix: hiểu rõ cleanup chạy khi dependency thay đổi, không chỉ khi component unmount.
*   **Không phân biệt được state management options:** Nói "tôi dùng Redux cho mọi project" mà không biết khi nào Context đủ dùng là dấu hiệu thiếu kinh nghiệm. Cách fix: hiểu rõ trade-off của từng option và khi nào upgrade lên giải pháp phức tạp hơn.
*   **Không biết React.memo hoạt động bằng shallow comparison:** React.memo không deep compare - nếu prop là object hay array, reference thay đổi là re-render kể cả value giống nhau. Cách fix: hiểu shallow vs deep comparison, biết khi nào cần custom comparator.
*   **Không biết auto-batching trong React 18:** Trước React 18, batching chỉ xảy ra trong event handlers. React 18 auto-batch mọi setState kể cả trong async function và setTimeout. Cách fix: cập nhật kiến thức về React 18 features - interviewer ở các công ty hiện đại thường hỏi về điều này.

#### Hỏi Đáp Nhanh

##### Hỏi: Phỏng vấn ReactJS junior có cần biết Redux Toolkit không?

**Đáp:** Nếu job description đề cập Redux, hãy học Redux Toolkit (RTK) thay vì Redux thuần - RTK là cách Redux khuyến nghị dùng hiện tại, ít boilerplate hơn nhiều và dễ hiểu hơn. Biết RTK mà không biết Redux thuần cũng không sao - hầu hết dự án mới đều dùng RTK. Quan trọng hơn là hiểu khi nào cần Redux và tại sao, không phải thuộc lòng API.

##### Hỏi: Interviewer có hay hỏi về React Server Components không?

**Đáp:** Với vị trí junior, RSC chưa phải câu hỏi bắt buộc - nhưng biết khái niệm cơ bản là lợi thế nếu apply vào công ty dùng Next.js 13+. Biết RSC render trên server, không có state hay effect, và tại sao nó giúp giảm bundle size là đủ cho cấp junior. Đừng lo nếu chưa dùng thực tế.

##### Hỏi: useLayoutEffect khác useEffect ở điểm nào?

**Đáp:** useEffect chạy sau khi browser đã paint - không block UI. useLayoutEffect chạy sau DOM update nhưng trước khi browser paint - block UI cho đến khi effect hoàn thành. Dùng useLayoutEffect khi cần đọc layout từ DOM và thực hiện mutation ngay lập tức để tránh flickering (ví dụ: tooltip positioning, animation). Trong hầu hết trường hợp, useEffect là đủ và được ưu tiên.

##### Hỏi: Error Boundary là gì và khi nào cần dùng?

**Đáp:** Error Boundary là class component bắt JavaScript errors trong cây component con, log lỗi, và hiển thị fallback UI thay vì crash toàn bộ ứng dụng. Hiện tại chỉ có thể implement bằng class component (chưa có hook tương đương). Cần dùng ở những phần UI quan trọng và độc lập - widget, dashboard panel, feed - để lỗi ở một phần không làm sập toàn bộ trang.

##### Hỏi: Strict Mode trong React có tác dụng gì trong phỏng vấn cần biết không?

**Đáp:** React Strict Mode là wrapper component giúp phát hiện side effects không mong muốn trong development - nó cố tình gọi một số lifecycle methods và hooks hai lần để expose vấn đề. Quan trọng cần biết: nếu bạn thấy useEffect chạy hai lần trong development, đó là Strict Mode, không phải bug. Strict Mode không ảnh hưởng production build. Interviewer thỉnh thoảng hỏi để xem bạn có bị confuse bởi behavior này không.

#### Tổng Kết

**Phỏng vấn ReactJS junior không chỉ kiểm tra bạn có viết được component không - mà kiểm tra bạn hiểu tại sao React hoạt động theo cách nó hoạt động.** Virtual DOM, Hooks lifecycle, re-render mechanism, và state management trade-off là bốn nhóm kiến thức cốt lõi bạn phải nắm vững trước khi bước vào bất kỳ buổi phỏng vấn frontend nào.

Bước tiếp theo: tự build một mini project - ví dụ một todo app có filter và sort - chỉ dùng useState, useEffect, useCallback, và Context API mà không dùng bất kỳ thư viện state management nào. Sau đó refactor để thêm Redux Toolkit. Quá trình này sẽ cho bạn cảm nhận thực tế về khi nào mỗi giải pháp phù hợp hơn, và đó là thứ interviewer muốn nghe nhất.

Đọc thêm [Câu hỏi phỏng vấn backend junior](/cau-hoi-phong-van-backend-junior-tong-hop-day-du-tu-database-den-api-auth-va-cache) nếu bạn đang chuẩn bị cho vị trí fullstack hoặc muốn hiểu phần API mà ReactJS frontend sẽ consume.
