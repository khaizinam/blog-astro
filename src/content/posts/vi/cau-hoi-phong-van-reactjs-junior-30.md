---
title: "Câu Hỏi Phỏng Vấn ReactJS Junior: 30+ Câu Thực Tế Kèm Đáp Án Chuẩn 2026"
author: KhaiziNam
pubDatetime: 2026-04-09T10:55:30.000Z
slug: cau-hoi-phong-van-reactjs-junior-30
lang: vi
translationKey: post-220
featured: false
draft: false
tags:
  - "SeriesPhongVan"
description: "Tổng hợp 30+ câu hỏi phỏng vấn ReactJS junior hay gặp nhất năm 2026 — từ Virtual DOM, hooks, state management đến performance optimization — kèm đáp án chi tiết và ví dụ code giúp bạn tự tin vượt qua mọi vòng technical interview.Bạn đã học React được vài tháng, build được project, nhưng mỗi lần vào phỏng vấn lại bị hỏi những thứ không có trong tutorial nào bạn từng đọc? \"useEffect cleanup function"
---

### Câu hỏi phỏng vấn ReactJS junior: 30+ câu thực tế kèm đáp án chuẩn cho developer 2026

Tổng hợp 30+ câu hỏi phỏng vấn ReactJS junior hay gặp nhất năm 2026 — từ Virtual DOM, hooks, state management đến performance optimization — kèm đáp án chi tiết và ví dụ code giúp bạn tự tin vượt qua mọi vòng technical interview.

Bạn đã học React được vài tháng, build được project, nhưng mỗi lần vào phỏng vấn lại bị hỏi những thứ không có trong tutorial nào bạn từng đọc? "useEffect cleanup function hoạt động thế nào?", "Tại sao không nên mutate state trực tiếp?", "Reconciliation là gì?" — đây chính xác là những câu phân biệt người chỉ biết dùng React với người thực sự hiểu React. Bài viết này tổng hợp 30+ câu hỏi phỏng vấn ReactJS junior thực tế nhất, phân loại theo độ khó, kèm đáp án đủ sâu để bạn không chỉ trả lời được mà còn gây ấn tượng với interviewer.

Nội dung bài viết:

*   [1\. Bản chất React — Câu hỏi nền tảng bắt buộc phải nắm](#ban-chat)
*   [2\. React Hooks — Phần được hỏi nhiều nhất](#hooks)
*   [3\. State, Props và Component Design](#state-props)
*   [4\. Performance Optimization](#performance)
*   [5\. Ecosystem — Router, State Management](#ecosystem)
*   [6\. 6 sai lầm phổ biến khi trả lời phỏng vấn ReactJS](#sai-lam)
*   [7\. FAQ — Câu hỏi thường gặp nhất](#faq)

* * *

#### 1\. Bản chất React — Câu hỏi nền tảng bắt buộc phải nắm

##### 1.1 Virtual DOM là gì và tại sao React dùng nó?

Virtual DOM là một bản sao nhẹ của DOM thực, được lưu trong bộ nhớ JavaScript. Khi state thay đổi, React tạo ra một Virtual DOM mới, so sánh với Virtual DOM cũ (quá trình gọi là **diffing**), tìm ra sự khác biệt tối thiểu, rồi chỉ cập nhật đúng những phần thay đổi trên DOM thực (quá trình gọi là **reconciliation**).

Tại sao cần làm vậy? Thao tác trực tiếp trên DOM thực rất chậm vì mỗi lần thay đổi DOM, trình duyệt phải tính toán lại layout và repaint. Virtual DOM giảm thiểu số lần và phạm vi thao tác DOM thực xuống mức tối thiểu.

Câu trả lời gây ấn tượng thêm: đề cập rằng React 18 đã introduce **Concurrent Rendering** — React có thể ưu tiên cập nhật quan trọng hơn (như input của user) trước các cập nhật ít quan trọng hơn (như fetch data), giúp UI luôn responsive.

##### 1.2 Reconciliation hoạt động như thế nào?

Reconciliation là thuật toán React dùng để quyết định phần nào của DOM cần cập nhật. React dùng hai giả định để tối ưu từ O(n³) xuống O(n):

*   Hai element khác type sẽ tạo ra tree hoàn toàn khác — React unmount cái cũ, mount cái mới.
*   Prop **key** giúp React xác định element nào trong list là cùng một item qua các lần render.

Đây là lý do tại sao dùng index làm key trong list là anti-pattern: khi list reorder, key không thay đổi nhưng content thay đổi — React không biết item đã di chuyển, dẫn đến bug khó tìm.

##### 1.3 JSX là gì — nó có phải HTML không?

JSX là syntax extension cho JavaScript, trông giống HTML nhưng thực ra là syntactic sugar cho **React.createElement()**. Babel compile JSX thành JavaScript thuần. Ví dụ:

**Hello**

được compile thành **React.createElement('div', {className: 'box'}, 'Hello')**. Đây là lý do dùng **className** thay vì **class** — vì class là reserved keyword trong JavaScript.

#### 2\. React Hooks — Phần được hỏi nhiều nhất trong phỏng vấn

##### 2.1 useState — Những điều interviewer hay test

Không chỉ "useState dùng để làm gì" — interviewer sẽ test sâu hơn:

**Câu hỏi: Tại sao không nên mutate state trực tiếp?**

// SAI — mutate state trực tiếp
const \[user, setUser\] = useState({ name: 'An', age: 25 });
user.age = 26; // React không biết state đã thay đổi, không re-render
setUser(user); // Vẫn không re-render vì reference không đổi

// ĐÚNG — tạo object mới
setUser({ ...user, age: 26 }); // Spread tạo object mới → React detect thay đổi → re-render

**Câu hỏi: useState cập nhật bất đồng bộ — xử lý thế nào?**

// Vấn đề: state cũ trong closure
const \[count, setCount\] = useState(0);

// SAI — dùng stale state
const handleClick = () => {
  setCount(count + 1); // count có thể là giá trị cũ nếu gọi nhiều lần
  setCount(count + 1); // Vẫn chỉ tăng 1, không phải 2
};

// ĐÚNG — dùng functional update
const handleClick = () => {
  setCount(prev => prev + 1); // Luôn dùng giá trị mới nhất
  setCount(prev => prev + 1); // Tăng 2 như mong đợi
};

##### 2.2 useEffect — Câu hỏi phức tạp nhất về hooks

**Dependency array:**

// Không có dependency array — chạy sau mỗi render
useEffect(() => { console.log('Runs every render'); });

// Array rỗng — chạy một lần sau mount (tương đương componentDidMount)
useEffect(() => { fetchData(); }, \[\]);

// Có dependency — chạy khi dependency thay đổi
useEffect(() => { fetchUser(userId); }, \[userId\]);

**Cleanup function — hay bị hỏi nhất:**

useEffect(() => {
  const subscription = dataStream.subscribe(handler);
  const timer = setInterval(tick, 1000);

  // Cleanup: chạy trước khi effect chạy lại, hoặc khi component unmount
  return () => {
    subscription.unsubscribe(); // Tránh memory leak
    clearInterval(timer);       // Tránh timer chạy sau khi unmount
  };
}, \[dataStream\]);

Câu hỏi hay gặp: "Khi nào cleanup function chạy?" — Trả lời: cleanup chạy trong hai trường hợp: (1) trước khi effect chạy lại do dependency thay đổi, (2) khi component unmount. Nếu thiếu cleanup với subscription hay setInterval, component unmount rồi nhưng callback vẫn chạy → memory leak và lỗi "Can't perform a React state update on an unmounted component".

##### 2.3 useCallback và useMemo — Khi nào dùng, khi nào không?

// useMemo — cache kết quả tính toán nặng
const expensiveValue = useMemo(() => {
  return heavyComputation(data); // Chỉ tính lại khi data thay đổi
}, \[data\]);

// useCallback — cache function reference (thường dùng với React.memo)
const handleSubmit = useCallback((formData) => {
  onSubmit(formData);
}, \[onSubmit\]); // Chỉ tạo function mới khi onSubmit thay đổi

Câu trả lời gây ấn tượng: không phải lúc nào cũng nên dùng useCallback/useMemo — chúng có overhead của chính mình (lưu cache, so sánh dependency). Chỉ dùng khi: (1) tính toán thực sự nặng, (2) function truyền vào React.memo component, (3) là dependency của useEffect khác.

##### 2.4 useRef — Hai use case quan trọng

// Use case 1: Truy cập DOM element trực tiếp
const inputRef = useRef(null);
const focusInput = () => inputRef.current.focus();
return ;

// Use case 2: Lưu giá trị không trigger re-render
const renderCount = useRef(0);
useEffect(() => {
  renderCount.current += 1; // Tăng counter nhưng không re-render
});

// Khác với useState: thay đổi ref.current KHÔNG trigger re-render

##### 2.5 Custom Hooks — Điểm cộng lớn trong phỏng vấn

// Custom hook: tách logic khỏi component
function useFetch(url) {
  const \[data, setData\] = useState(null);
  const \[loading, setLoading\] = useState(true);
  const \[error, setError\] = useState(null);

  useEffect(() => {
    let cancelled = false; // Tránh race condition

    setLoading(true);
    fetch(url)
      .then(res => res.json())
      .then(data => { if (!cancelled) setData(data); })
      .catch(err => { if (!cancelled) setError(err); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; }; // Cleanup: cancel nếu URL thay đổi
  }, \[url\]);

  return { data, loading, error };
}

// Dùng trong component
function UserProfile({ userId }) {
  const { data: user, loading, error } = useFetch(\`/api/users/${userId}\`);
  if (loading) return ;
  if (error) return ;
  return {user.name};
}

#### 3\. State, Props và Component Design

##### 3.1 State lifting — Khi nào và cách làm đúng

Khi hai component anh em cần share state, giải pháp là "lift state up" — đưa state lên component cha chung gần nhất, rồi truyền xuống qua props. Đây là câu hỏi kiểm tra hiểu biết về data flow một chiều (unidirectional data flow) trong React.

// Trước: state nằm trong ChildA, ChildB không đọc được
// Sau khi lift state lên Parent:
function Parent() {
  const \[selectedId, setSelectedId\] = useState(null);
  return ( <> );
}

##### 3.2 Controlled vs Uncontrolled Components

**Controlled**: React hoàn toàn kiểm soát giá trị của form element qua state. Mọi thay đổi phải qua setState — single source of truth.

// Controlled — React kiểm soát value
const \[email, setEmail\] = useState('');
return  setEmail(e.target.value)} />;

**Uncontrolled**: DOM tự quản lý giá trị, React đọc khi cần qua ref. Ít code hơn nhưng khó validate real-time và tích hợp với state phức tạp.

// Uncontrolled — DOM tự quản lý, đọc khi submit
const emailRef = useRef();
const handleSubmit = () => console.log(emailRef.current.value);
return ;

##### 3.3 React.memo — Tránh re-render không cần thiết

// Không có React.memo: re-render mỗi khi Parent render, dù props không đổi
const ExpensiveChild = ({ data }) => {data};

// Có React.memo: chỉ re-render khi props thực sự thay đổi (shallow compare)
const ExpensiveChild = React.memo(({ data }) => {data});

// Lưu ý: React.memo dùng shallow comparison — object/array mới tạo mỗi render
// vẫn trigger re-render dù giá trị không đổi → cần useCallback/useMemo kết hợp

#### 4\. Performance Optimization — Câu hỏi phân biệt junior và mid-level

##### 4.1 Code Splitting với React.lazy và Suspense

// Không có code splitting: toàn bộ bundle tải một lần → load time chậm
// Có code splitting: tải chunk theo nhu cầu

const Dashboard = React.lazy(() => import('./Dashboard'));
const Analytics = React.lazy(() => import('./Analytics'));

function App() {
  return ( );
}
// Dashboard.js và Analytics.js được tải riêng khi user navigate đến route đó

##### 4.2 List Virtualization — Render danh sách lớn

Render 10.000 item trong DOM cùng lúc là thảm họa performance. Giải pháp: virtualization — chỉ render những item đang visible trong viewport. Thư viện phổ biến: **react-window** hoặc **react-virtual**.

import { FixedSizeList } from 'react-window';

// Chỉ render ~20 row visible thay vì 10.000 row

{({ index, style }) => (Row {index}: {data\[index\].name})} 

##### 4.3 Tránh Prop Drilling với Context API

// Tạo context
const ThemeContext = React.createContext('light');

// Provider ở component cha
function App() {
  const \[theme, setTheme\] = useState('light');
  return (
    
       {/\* Không cần truyền theme qua props nữa \*/}
    
  );
}

// Consume ở bất kỳ component con nào, dù sâu đến đâu
function Button() {
  const { theme } = useContext(ThemeContext);
  return <button>Click me</button>;
}

Lưu ý quan trọng hay bị hỏi: Context không phải state management — mỗi khi context value thay đổi, tất cả component dùng useContext đó đều re-render. Với state phức tạp và update thường xuyên, dùng Zustand hoặc Redux Toolkit thay vì Context.

#### 5\. Ecosystem — React Router và State Management

##### 5.1 React Router v6 — Những thay đổi cần biết

// React Router v6 — cú pháp mới
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';

function App() {
  return ( );
}

function UserDetail() {
  const { id } = useParams();           // Lấy route param
  const navigate = useNavigate();       // Thay useHistory
  return <button> navigate(-1)}>Back</button>;
}

##### 5.2 Khi nào dùng Redux, khi nào Context là đủ?

Đây là câu hỏi interviewer dùng để test tư duy kiến trúc. Câu trả lời theo framework:

*   **Dùng useState + useContext**: State đơn giản, ít component dùng chung, update không thường xuyên. Ví dụ: theme, language, user auth status.
*   **Dùng Zustand hoặc Redux Toolkit**: State phức tạp, nhiều component update cùng lúc, cần devtools debug, cần middleware (async actions, logging). Ví dụ: shopping cart, realtime data, complex form state.

Redux Toolkit (RTK) là cách viết Redux hiện đại — giảm boilerplate đáng kể so với Redux vanilla. RTK Query còn tích hợp sẵn data fetching và caching, cạnh tranh trực tiếp với React Query.

Để chuẩn bị phỏng vấn kỹ thuật toàn diện hơn, xem thêm bài [Câu hỏi phỏng vấn Backend Junior](/cau-hoi-phong-van-backend-junior-tong-hop-day-du-tu-database-den-api-auth-va-cache) để nắm phần authentication và API design thường xuất hiện song song với React trong các buổi phỏng vấn Fullstack.

#### 6\. 6 sai lầm phổ biến khi trả lời phỏng vấn ReactJS

1.  **Giải thích Virtual DOM sai — nói nó "nhanh hơn DOM thực"** → Fix: Virtual DOM không nhanh hơn DOM thực về mặt tuyệt đối. Nó nhanh hơn vì giảm số lần thao tác DOM thực không cần thiết. Một thao tác DOM thực trực tiếp vẫn nhanh hơn qua Virtual DOM.
2.  **Không biết giải thích tại sao cần cleanup trong useEffect** → Fix: nắm rõ memory leak và stale closure — đây là lý do thực tế quan trọng hơn nhiều so với việc thuộc syntax.
3.  **Dùng useCallback/useMemo mọi nơi vì nghĩ "tối ưu là luôn tốt"** → Fix: memoization có chi phí — lưu cache, so sánh dependency. Chỉ dùng khi có profiling cho thấy vấn đề thực sự.
4.  **Nói key trong list chỉ để "React không warning"** → Fix: key là cơ chế giúp React identify element nào là cùng một item trong reconciliation. Hiểu sai dẫn đến dùng index làm key — một anti-pattern phổ biến.
5.  **Không phân biệt được controlled và uncontrolled component** → Fix: đây là câu hỏi cơ bản nhưng nhiều junior bỏ qua. Nắm rõ trade-off của từng cái để chọn đúng theo context.
6.  **Không có ý kiến về khi nào dùng Redux vs Context** → Fix: interviewer hỏi câu này để test tư duy — không có câu trả lời tuyệt đối đúng, nhưng phải có framework để quyết định. Trả lời "tùy project" mà không giải thích là điểm trừ lớn.

#### 7\. FAQ — Câu hỏi thường gặp nhất khi phỏng vấn ReactJS

##### 7.1 React 18 có gì mới cần biết khi phỏng vấn?

Ba điểm quan trọng nhất: (1) **Automatic Batching** — React 18 tự động batch nhiều setState calls trong async functions, giảm số lần re-render. Trước React 18, chỉ batch trong event handlers. (2) **Concurrent Features** — useTransition và useDeferredValue cho phép mark một số update là "non-urgent", giữ UI responsive trong khi xử lý heavy update. (3) **Suspense trên server** — hỗ trợ streaming SSR với React Server Components.

##### 7.2 useEffect vs useLayoutEffect — khi nào dùng cái nào?

useEffect chạy bất đồng bộ sau khi browser đã paint — phù hợp cho data fetching, subscription, logging. useLayoutEffect chạy đồng bộ sau DOM mutation nhưng trước khi browser paint — phù hợp khi cần đọc layout từ DOM (ví dụ: tính toán vị trí tooltip, scroll position) để tránh flicker. Trong hầu hết trường hợp, useEffect là đủ và được khuyến nghị. useLayoutEffect chỉ dùng khi thấy visual flicker với useEffect.

##### 7.3 Error Boundary là gì và implement thế nào?

Error Boundary là class component bắt JavaScript error trong cây component con, log lỗi, và hiển thị fallback UI thay vì crash toàn bộ app. Phải là class component vì cần lifecycle getDerivedStateFromError và componentDidCatch — chưa có hook tương đương. Thư viện **react-error-boundary** cung cấp wrapper tiện lợi hơn. Đặc biệt quan trọng trong production để tránh blank screen khi có lỗi bất ngờ.

##### 7.4 Tại sao không gọi hooks trong điều kiện hay vòng lặp?

React theo dõi hooks theo thứ tự gọi — không phải theo tên. Mỗi lần render, React expect hooks được gọi theo đúng thứ tự như lần trước. Nếu gọi hook trong if/else hay loop, thứ tự có thể thay đổi giữa các lần render → React ghép nhầm state vào hook sai → bug khó tìm và khó debug. Đây là lý do tồn tại "Rules of Hooks".

##### 7.5 Forwardref dùng để làm gì?

Bình thường, ref không được truyền qua props như prop thông thường — React đặc biệt xử lý ref. forwardRef cho phép component nhận ref từ cha và forward xuống DOM element bên trong. Dùng phổ biến khi build component library (ví dụ: custom Input component cần expose ref để cha có thể focus/blur). React 19 đã simplify bằng cách cho phép truyền ref như prop thông thường — nhưng forwardRef vẫn cần biết cho codebase React 18 trở xuống.

#### Tổng kết và bước tiếp theo

Để vượt qua phỏng vấn ReactJS junior, bạn cần nắm bốn trụ cột: hiểu bản chất Virtual DOM và reconciliation (không chỉ thuộc định nghĩa), hooks thực sự hoạt động thế nào (đặc biệt useEffect cleanup và stale closure), khi nào tối ưu performance (không phải mọi lúc), và tư duy kiến trúc về state management. Cách chuẩn bị hiệu quả nhất: build một project nhỏ thực tế có đủ các pattern này — fetch data với custom hook, form với controlled component, list dài với virtualization, shared state với Context. Không gì thay thế được kinh nghiệm tự tay làm và debug. Đọc thêm bài [Tips phỏng vấn Junior IT: A-Z từ chuẩn bị đến offer](/tips-phong-van-junior-it-tong-hop-a-z-de-ban-vuot-qua-moi-vong) để chuẩn bị toàn diện hơn cho buổi phỏng vấn sắp tới.
