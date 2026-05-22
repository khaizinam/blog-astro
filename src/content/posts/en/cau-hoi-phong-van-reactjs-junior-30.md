---
title: "ReactJS Junior Interview Questions: 30+ Real Questions With Answers 2026"
author: KhaiziNam
pubDatetime: 2026-04-09T10:55:30.000Z
slug: cau-hoi-phong-van-reactjs-junior-30
lang: en
translationKey: post-220
featured: false
draft: false
tags:
  - "SeriesPhongVan"
description: "30+ of the most commonly asked ReactJS junior interview questions in 2026 — covering Virtual DOM, hooks, state management, and performance optimization — with detailed answers and code examples to help you confidently pass any technical interview. You've been learning React for a few months, you've built projects, but every time you walk into an interview you get asked things no tutorial ever cove"
---

### ReactJS junior interview questions: 30+ real questions with detailed answers for developers in 2026

30+ of the most commonly asked ReactJS junior interview questions in 2026 — covering Virtual DOM, hooks, state management, and performance optimization — with detailed answers and code examples to help you confidently pass any technical interview.

You've been learning React for a few months, you've built projects, but every time you walk into an interview you get asked things no tutorial ever covered? "How does useEffect cleanup work?", "Why shouldn't you mutate state directly?", "What is reconciliation?" — these are exactly the questions that separate people who just use React from people who truly understand it. This article covers 30+ of the most practical ReactJS junior interview questions, organized by difficulty, with answers deep enough to not just answer the question but to impress the interviewer.

Table of Contents:

*   [1\. React Fundamentals — Questions You Must Know Cold](#fundamentals)
*   [2\. React Hooks — The Most Frequently Asked Section](#hooks-en)
*   [3\. State, Props, and Component Design](#state-props-en)
*   [4\. Performance Optimization](#performance-en)
*   [5\. Ecosystem — Router and State Management](#ecosystem-en)
*   [6\. 6 Common Mistakes When Answering ReactJS Interview Questions](#mistakes-en)
*   [7\. FAQ — Most Frequently Asked Questions](#faq-en)

* * *

#### 1\. React Fundamentals — Questions You Must Know Cold

##### 1.1 What Is the Virtual DOM and Why Does React Use It?

The Virtual DOM is a lightweight in-memory copy of the real DOM. When state changes, React creates a new Virtual DOM, compares it against the previous one (a process called **diffing**), finds the minimum set of differences, then updates only the changed parts of the real DOM (a process called **reconciliation**).

Why bother? Direct DOM manipulation is slow because every DOM change forces the browser to recalculate layout and repaint. The Virtual DOM minimizes the number and scope of real DOM operations.

Answer that makes an impression: mention that React 18 introduced **Concurrent Rendering** — React can now prioritize more important updates (like user input) over less critical ones (like data fetching), keeping the UI always responsive.

##### 1.2 How Does Reconciliation Work?

Reconciliation is the algorithm React uses to decide which parts of the DOM need updating. React uses two assumptions to optimize the process from O(n³) down to O(n):

*   Two elements of different types produce completely different trees — React unmounts the old one and mounts the new one.
*   The **key** prop helps React identify which item in a list corresponds to which across renders.

This is why using index as a key is an anti-pattern: when a list reorders, the key doesn't change but the content does — React doesn't know an item has moved, leading to hard-to-find bugs.

##### 1.3 What Is JSX — Is It the Same as HTML?

JSX is a syntax extension for JavaScript that looks like HTML but is actually syntactic sugar for **React.createElement()**. Babel compiles JSX into plain JavaScript. For example:

**Hello**

compiles to **React.createElement('div', {className: 'box'}, 'Hello')**. This is why you use **className** instead of **class** — because class is a reserved keyword in JavaScript.

#### 2\. React Hooks — The Most Frequently Asked Section in Interviews

##### 2.1 useState — What Interviewers Actually Test

It's not just "what does useState do" — interviewers probe deeper:

**Question: Why shouldn't you mutate state directly?**

// WRONG — mutating state directly
const \[user, setUser\] = useState({ name: 'Alice', age: 25 });
user.age = 26; // React doesn't know state changed, won't re-render
setUser(user); // Still won't re-render — same reference

// CORRECT — create a new object
setUser({ ...user, age: 26 }); // Spread creates new object → React detects change → re-render

**Question: useState updates are asynchronous — how do you handle that?**

// Problem: stale state in closure
const \[count, setCount\] = useState(0);

// WRONG — using stale state
const handleClick = () => {
  setCount(count + 1); // count may be stale if called multiple times
  setCount(count + 1); // Still only increments by 1, not 2
};

// CORRECT — use functional update
const handleClick = () => {
  setCount(prev => prev + 1); // Always uses the latest value
  setCount(prev => prev + 1); // Increments by 2 as expected
};

##### 2.2 useEffect — The Most Complex Hook Questions

**Dependency array:**

// No dependency array — runs after every render
useEffect(() => { console.log('Runs every render'); });

// Empty array — runs once after mount (equivalent to componentDidMount)
useEffect(() => { fetchData(); }, \[\]);

// With dependencies — runs when dependencies change
useEffect(() => { fetchUser(userId); }, \[userId\]);

**Cleanup function — the most commonly tested:**

useEffect(() => {
  const subscription = dataStream.subscribe(handler);
  const timer = setInterval(tick, 1000);

  // Cleanup: runs before the effect re-runs, or when component unmounts
  return () => {
    subscription.unsubscribe(); // Prevents memory leak
    clearInterval(timer);       // Prevents timer running after unmount
  };
}, \[dataStream\]);

Common follow-up: "When does the cleanup function run?" — Answer: cleanup runs in two cases: (1) before the effect re-runs due to a dependency change, (2) when the component unmounts. Missing cleanup with subscriptions or setInterval means callbacks keep running after the component is gone → memory leak and "Can't perform a React state update on an unmounted component" errors.

##### 2.3 useCallback and useMemo — When to Use, When Not To

// useMemo — cache result of expensive computation
const expensiveValue = useMemo(() => {
  return heavyComputation(data); // Only recomputes when data changes
}, \[data\]);

// useCallback — cache function reference (usually paired with React.memo)
const handleSubmit = useCallback((formData) => {
  onSubmit(formData);
}, \[onSubmit\]); // Only creates new function when onSubmit changes

Answer that impresses: you shouldn't always use useCallback/useMemo — they have their own overhead (storing cache, comparing dependencies). Only use them when: (1) the computation is genuinely expensive, (2) the function is passed to a React.memo component, (3) it's a dependency of another useEffect.

##### 2.4 useRef — Two Important Use Cases

// Use case 1: Direct DOM access
const inputRef = useRef(null);
const focusInput = () => inputRef.current.focus();
return ;

// Use case 2: Store a value without triggering re-render
const renderCount = useRef(0);
useEffect(() => {
  renderCount.current += 1; // Increments counter but doesn't re-render
});

// Unlike useState: changing ref.current does NOT trigger a re-render

##### 2.5 Custom Hooks — A Major Interview Bonus Point

// Custom hook: extract logic out of components
function useFetch(url) {
  const \[data, setData\] = useState(null);
  const \[loading, setLoading\] = useState(true);
  const \[error, setError\] = useState(null);

  useEffect(() => {
    let cancelled = false; // Prevents race conditions

    setLoading(true);
    fetch(url)
      .then(res => res.json())
      .then(data => { if (!cancelled) setData(data); })
      .catch(err => { if (!cancelled) setError(err); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; }; // Cleanup: cancel if URL changes
  }, \[url\]);

  return { data, loading, error };
}

// Usage in component
function UserProfile({ userId }) {
  const { data: user, loading, error } = useFetch(\`/api/users/${userId}\`);
  if (loading) return ;
  if (error) return ;
  return {user.name};
}

#### 3\. State, Props, and Component Design

##### 3.1 State Lifting — When and How to Do It Correctly

When two sibling components need to share state, the solution is to "lift state up" — move the state to their nearest common ancestor, then pass it down via props. This question tests understanding of React's unidirectional data flow.

// Before: state lives in ChildA, ChildB can't read it
// After lifting state to Parent:
function Parent() {
  const \[selectedId, setSelectedId\] = useState(null);
  return (
    <>
      
       {/\* ChildB can now read it \*/}
    
  );
}

##### 3.2 Controlled vs Uncontrolled Components

**Controlled**: React fully controls the form element's value through state. Every change must go through setState — single source of truth.

// Controlled — React owns the value
const \[email, setEmail\] = useState('');
return  setEmail(e.target.value)} />;

**Uncontrolled**: The DOM manages its own value; React reads it when needed via ref. Less code but harder to validate in real-time and harder to integrate with complex state.

// Uncontrolled — DOM manages it, read on submit
const emailRef = useRef();
const handleSubmit = () => console.log(emailRef.current.value);
return ;

##### 3.3 React.memo — Preventing Unnecessary Re-renders

// Without React.memo: re-renders every time Parent renders, even if props haven't changed
const ExpensiveChild = ({ data }) =>
{data};
// With React.memo: only re-renders when props actually change (shallow compare)
const ExpensiveChild = React.memo(({ data }) => 
{data});
// Important: React.memo uses shallow comparison — a new object/array created each render
// still triggers re-render even if values are the same → pair with useCallback/useMemo

#### 4\. Performance Optimization — Questions That Separate Junior From Mid-Level

##### 4.1 Code Splitting With React.lazy and Suspense

// Without code splitting: entire bundle loads at once → slow initial load
// With code splitting: load chunks on demand

const Dashboard = React.lazy(() => import('./Dashboard'));
const Analytics = React.lazy(() => import('./Analytics'));

function App() {
  return ( );
}
// Dashboard.js and Analytics.js are loaded separately when the user navigates there

##### 4.2 List Virtualization — Rendering Large Datasets

Rendering 10,000 items in the DOM simultaneously is a performance disaster. The solution: virtualization — render only the items currently visible in the viewport. Popular libraries: **react-window** or **react-virtual**.

import { FixedSizeList } from 'react-window';
// Renders only ~20 visible rows instead of 10,000
{({ index, style }) => (Row {index}: {data\[index\].name})}

##### 4.3 Avoiding Prop Drilling With Context API

// Create context
const ThemeContext = React.createContext('light');

// Provider at parent level
function App() {
  const \[theme, setTheme\] = useState('light');
  return (
    
       {/\* No need to pass theme through props anymore \*/}
    
  );
}

// Consume in any deeply nested component
function Button() {
  const { theme } = useContext(ThemeContext);
  return <button>Click me</button>;
}

Important caveat interviewers often ask about: Context is not a state management solution — every time a context value changes, every component using that useContext re-renders. For complex state with frequent updates, use Zustand or Redux Toolkit instead of Context.

#### 5\. Ecosystem — React Router and State Management

##### 5.1 React Router v6 — Changes You Need to Know

// React Router v6 — updated syntax
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';

function App() {
  return ();
}

function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();       // Replaces useHistory
  return <button> navigate(-1)}>Back</button>;
}

##### 5.2 When to Use Redux vs When Is Context Enough?

Interviewers use this question to test architectural thinking. A framework for answering:

*   **Use useState + useContext**: Simple state, few components sharing it, infrequent updates. Examples: theme, language, user auth status.
*   **Use Zustand or Redux Toolkit**: Complex state, many components updating simultaneously, need devtools for debugging, need middleware (async actions, logging). Examples: shopping cart, realtime data, complex form state.

Redux Toolkit (RTK) is the modern way to write Redux — dramatically less boilerplate than vanilla Redux. RTK Query adds built-in data fetching and caching, directly competing with React Query for many use cases.

To prepare for the full technical interview including authentication and API design questions that often come up alongside React in Fullstack roles, check out [Backend Junior Interview Questions](/en/cau-hoi-phong-van-backend-junior-tong-hop-day-du-tu-database-den-api-auth-va-cache).

#### 6\. 6 Common Mistakes When Answering ReactJS Interview Questions

1.  **Explaining Virtual DOM incorrectly — saying it's "faster than the real DOM"** → Fix: Virtual DOM isn't faster in absolute terms. It's faster because it reduces unnecessary real DOM operations. A direct real DOM operation is still faster than going through Virtual DOM.
2.  **Not being able to explain why cleanup is needed in useEffect** → Fix: internalize memory leaks and stale closures — the practical reasons matter far more than memorizing syntax.
3.  **Using useCallback/useMemo everywhere because "optimization is always good"** → Fix: memoization has its own cost — storing cache, comparing dependencies. Only use it when profiling shows a real problem.
4.  **Saying keys in lists are just "to avoid React warnings"** → Fix: keys are the mechanism React uses to identify which item is which during reconciliation. Misunderstanding this leads to using index as key — a common anti-pattern with real consequences.
5.  **Not being able to distinguish controlled from uncontrolled components** → Fix: this is a fundamental question many juniors skip. Know the tradeoffs of each to choose the right one in context.
6.  **Having no opinion on when to use Redux vs Context** → Fix: interviewers ask this to test judgment — there's no single right answer, but you must have a decision framework. Answering "it depends on the project" without elaborating is a significant mark against you.

#### 7\. FAQ — Most Frequently Asked ReactJS Interview Questions

##### 7.1 What's new in React 18 that's worth knowing for interviews?

Three key points: (1) **Automatic Batching** — React 18 automatically batches multiple setState calls inside async functions, reducing re-renders. Before React 18, batching only happened inside event handlers. (2) **Concurrent Features** — useTransition and useDeferredValue let you mark certain updates as "non-urgent," keeping the UI responsive while processing heavy updates. (3) **Server-side Suspense** — streaming SSR support with React Server Components.

##### 7.2 useEffect vs useLayoutEffect — When to Use Which?

useEffect runs asynchronously after the browser has painted — right for data fetching, subscriptions, logging. useLayoutEffect runs synchronously after DOM mutations but before the browser paints — right when you need to read layout from the DOM (e.g., calculating tooltip position, scroll position) to prevent visual flicker. In the vast majority of cases, useEffect is sufficient and preferred. Use useLayoutEffect only when you observe visual flicker with useEffect.

##### 7.3 What Is an Error Boundary and How Do You Implement One?

An Error Boundary is a class component that catches JavaScript errors in its child component tree, logs them, and displays a fallback UI instead of crashing the entire app. It must be a class component because it requires the getDerivedStateFromError and componentDidCatch lifecycle methods — there's no hook equivalent yet. The **react-error-boundary** library provides a more convenient wrapper. Critical in production to prevent blank screens when unexpected errors occur.

##### 7.4 Why Can't You Call Hooks Inside Conditions or Loops?

React tracks hooks by their call order — not by name. On every render, React expects hooks to be called in exactly the same order as the previous render. If a hook is called inside an if/else or loop, the order can change between renders → React maps state to the wrong hook → subtle bugs that are very hard to trace. This is the entire reason the "Rules of Hooks" exist.

##### 7.5 What Is forwardRef Used For?

Normally, ref can't be passed through props like a regular prop — React handles ref specially. forwardRef lets a component receive a ref from its parent and forward it to a DOM element inside it. Commonly used when building component libraries (for example, a custom Input component that needs to expose a ref so the parent can focus or blur it). React 19 simplified this by allowing ref to be passed as a regular prop — but forwardRef is still important to know for React 18 and below codebases.

#### Summary & Next Steps

To pass a ReactJS junior interview, you need to own four pillars: understanding Virtual DOM and reconciliation at a conceptual level (not just reciting definitions), how hooks actually work internally (especially useEffect cleanup and stale closures), when to optimize performance (not everywhere), and architectural thinking about state management. The most effective way to prepare: build a small real project that incorporates all these patterns — data fetching with a custom hook, forms with controlled components, long lists with virtualization, shared state with Context. Nothing replaces the experience of building and debugging it yourself. Also check out [Junior IT Interview Tips: A-Z from Preparation to Offer](/en/tips-phong-van-junior-it-tong-hop-a-z-de-ban-vuot-qua-moi-vong) to round out your preparation for the full interview process.
