---
title: "ReactJS Junior Interview Questions: Hooks, Virtual DOM, and State — Complete Guide With Answers"
author: "Nguyễn Hữu Khải - khaizinam"
pubDatetime: 2026-04-04T11:36:05.000Z
slug: cau-hoi-phong-van-reactjs-junior-hooks-virtual-dom-state-tong-hop-day-du-kem-dap-an
lang: en
translationKey: post-215
featured: false
draft: false
tags:
  - "SeriesPhongVan"
description: "Preparing for a ReactJS junior interview but unsure where to focus? This guide compiles 25+ of the most commonly asked ReactJS junior interview questions — from Virtual DOM and Hooks to State management and performance — with in-depth analysis so you can answer confidently in any technical round."
---

### **ReactJS Junior Interview Questions: Hooks, Virtual DOM, and State — Complete Guide With Answers**

Preparing for a ReactJS junior interview but unsure where to focus? This guide compiles 25+ of the most commonly asked ReactJS junior interview questions — from Virtual DOM and Hooks to State management and performance — with in-depth analysis so you can answer confidently in any technical round.

ReactJS is the most widely used frontend framework in Vietnam's job market, and it's also where the gap between "knows how to use it" and "understands why it works" is widest. Interviewers don't ask whether you can write a component — they ask whether you understand how React works internally, why re-renders happen, and whether you've ever optimized performance. This guide helps you close that gap.

### Table of Contents

1\. [React fundamentals and Virtual DOM](#react-fundamentals-and-virtual-dom)

2\. [Hooks questions — useState, useEffect, useCallback, useMemo](#hooks-questions)

3\. [State and Props questions](#state-and-props-questions)

4\. [Component lifecycle and re-render questions](#component-lifecycle-and-re-render-questions)

5\. [State management — Context vs Redux](#en-rx5)

6\. [Real-world case study](#real-world-case-study)

7\. [Common mistakes when answering ReactJS questions](#common-mistakes-when-answering-reactjs-questions)

8\. [Quick FAQ](#quick-faq)

* * *

#### React Fundamentals and Virtual DOM

##### What is the Virtual DOM and why does React use it?

The real DOM is slow to manipulate directly — every time you update a node, the browser must reflow and repaint all or part of the page. The Virtual DOM is a lightweight in-memory copy of the real DOM, stored as a JavaScript object tree.

When state changes, React creates a new Virtual DOM, compares it against the previous Virtual DOM through a process called **diffing**, finds the minimal set of differences, then only updates those specific parts in the real DOM — this is called **reconciliation**. The result is fewer real DOM operations and a faster UI.

**What to emphasize in your answer:** Virtual DOM is not magic that makes everything faster in absolute terms — it's a trade-off. For small apps, the diffing overhead can actually be slower than direct DOM manipulation. React shines when the UI is complex and many components update simultaneously.

##### What is React Fiber — do juniors need to know it?

React Fiber is the completely rewritten reconciliation architecture introduced in React 16. Before Fiber, reconciliation was synchronous — once started it couldn't be interrupted, causing UI to block on complex updates. Fiber breaks work into small units (fiber nodes), allowing React to pause, reprioritize, or abandon work mid-way.

For juniors, deep implementation knowledge isn't needed — but knowing that Fiber is the foundation for Concurrent Features (Suspense, useTransition) is a clear bonus if the interviewer asks "what's new in recent React versions?"

##### How does the key prop work in list rendering?

When rendering a list, React uses **key** to identify each element during diffing. Keys tell React which elements were added, removed, or moved — allowing it to minimize real DOM updates.

The most common mistake: using array index as the key. When a list is sorted or filtered, indices change even though the underlying data hasn't — causing React to re-render the wrong components. **Keys must be stable, unique identifiers — typically IDs from your database.**

#### Hooks Questions

##### How does useState work — why is setState asynchronous?

useState returns a pair: the current state value and a setter function. When you call the setter, React doesn't update the state immediately — it **schedules** a re-render. Within the same event handler, multiple setState calls may be batched together and trigger only a single re-render (React 18 auto-batching).

This is why the following code doesn't work as expected:

const \[count, setCount\] = useState(0);
setCount(count + 1);
setCount(count + 1); // still 1, not 2

The correct fix: use the functional update form — `setCount(prev => prev + 1)` — to always work with the most current value.

##### useEffect — how does the dependency array work?

useEffect takes two arguments: a callback function and a dependency array. React compares the dependency array after each render:

*   **No dependency array:** Effect runs after every render.
*   **Empty array \[\]:** Effect runs only once after the first render (equivalent to componentDidMount).
*   **Array with values \[a, b\]:** Effect runs again when a or b changes.

**Cleanup function:** If the effect returns a function, React calls it before running the next effect or when the component unmounts — use this to clear intervals, cancel fetches, and unsubscribe from event listeners.

##### useCallback and useMemo — when should you actually use them?

**useMemo** memoizes a computed value: `const result = useMemo(() => expensiveCalc(a, b), [a, b])` — only recalculates when a or b changes. Use when you have an expensive computation happening during render.

**useCallback** memoizes a function: `const fn = useCallback(() => doSomething(a), [a])` — returns the same function reference if dependencies haven't changed. Use when passing callbacks down to child components wrapped with React.memo to prevent unnecessary re-renders.

**Important:** Don't use useCallback/useMemo everywhere — both have their own overhead. Use them only when you have a measurable performance problem, not as a default best practice.

##### What is useRef used for?

useRef has two primary use cases: accessing a DOM element directly (`ref.current` points to the DOM node), and storing a mutable value that **does not trigger a re-render** when changed. The second use case is frequently overlooked — very useful for storing previous values, tracking interval IDs, or holding state that doesn't need to appear in the UI.

##### What is a Custom Hook and when should you create one?

A Custom Hook is a JavaScript function starting with "use" that can call other Hooks internally. Its main purpose: **extracting logic out of components for reuse**. Examples: useFetch, useLocalStorage, useDebounce, useWindowSize. Create a Custom Hook when you notice the same logic (a combination of useState + useEffect) repeating across multiple components.

#### State and Props Questions

##### What is the difference between State and Props?

**Props** are data passed from a parent component down to a child — read-only; the child component cannot modify them directly. **State** is data managed by the component itself — it can change through the setter function, and every change triggers a re-render.

A great interviewer question: "When should you put state in the parent vs the child?" — the principle is **lifting state up**: put state in the lowest component in the tree that all consumers need. If only the child needs it, keep it there. If multiple sibling components need it, lift it to the closest common parent.

##### What are Controlled vs Uncontrolled components?

**Controlled component:** The input's value is driven by React state — every keystroke calls onChange, updates state, triggers re-render, and the input reflects the new value. React is the single source of truth.

**Uncontrolled component:** The value is managed by the DOM — use useRef to read the value when needed. Simpler for basic forms, but harder to integrate with complex validation logic. Most form libraries (React Hook Form, Formik) use uncontrolled components under the hood for better performance.

#### Component Lifecycle and Re-render Questions

##### When does React re-render a component?

A component re-renders in four cases: its own state changes, props change, subscribed context changes, or its parent re-renders. The fourth case is critical and often overlooked — **when a parent re-renders, all child components re-render by default**, even if their props haven't changed.

To prevent unnecessary re-renders: wrap child components with **React.memo** — the component only re-renders when its props actually change (shallow comparison). Combine with useCallback to ensure function props don't change reference on every parent render.

##### How do React.memo, PureComponent, and shouldComponentUpdate differ?

All three serve the same purpose — preventing unnecessary re-renders — but in different contexts. **React.memo** is a Higher Order Component for functional components, comparing props with shallow equality. **PureComponent** is the class component equivalent of React.memo. **shouldComponentUpdate** is a lifecycle method in class components that allows custom comparison logic — most flexible, but easiest to introduce bugs if implemented incorrectly.

#### State Management Questions

##### What is the Context API and when should you use it?

Context API solves the problem of **prop drilling** — passing props through multiple layers of intermediate components that don't actually use them. Context creates a "channel" that lets any component in the tree subscribe and read values without threading props manually.

Context works well for: theme (dark/light mode), locale, current authenticated user — things that change rarely but many components need to read. **Not ideal** for frequently changing state because every time the context value changes, all consumers re-render.

##### Redux vs Context API — when do you actually need Redux?

Context API is sufficient for most small to medium applications. Redux makes more sense when: state is complex with many interdependent slices, you need time-travel debugging (Redux DevTools), many different actions transform the same state, or a large team needs clear conventions for state management.

A mature answer: **"I don't reach for Redux by default. I start with useState and Context, and only add Redux when state management genuinely becomes complex and difficult to debug."**

#### Real-World Case Study

Linh was interviewing for a junior Frontend Developer role at an e-commerce startup. The interviewer showed her a piece of React code and asked: "Does this component have any performance issues?"

function ProductList({ products, onAddToCart }) {
  return (
{products.map((p, index) => (
  );
}

Linh identified three issues: using `index` as the key instead of `p.id`, the inline arrow function `() => onAddToCart(p.id)` creating a new function reference on every render causing ProductCard to re-render even if wrapped with React.memo, and for a long product list, virtualization (react-window) should be considered.

The interviewer followed up: "How would you fix it?" — Linh proposed using `p.id` as the key, wrapping the callback with useCallback, and adding React.memo to ProductCard. **Result: Linh received an offer above the initial proposal — specifically because she demonstrated performance-aware code review thinking, not just feature-writing ability.**

For more on how to handle technical deep-dives in interviews, read [Junior IT Interview Tips A-Z](/en/junior-it-interview-tips-the-complete-a-z-guide-to-getting-hired) — covering how to reason out loud and handle questions that go deeper than you expected.

#### Common Mistakes When Answering ReactJS Questions

*   **Describing Virtual DOM incorrectly as "faster than real DOM":** Virtual DOM isn't always faster — it's an abstraction layer that helps React batch and optimize updates. Fix: explain the diffing and reconciliation mechanism correctly, and acknowledge the trade-off.
*   **Knowing not to use index as key without explaining why:** Many juniors know the rule but can't explain the reason. Fix: remember — when a list reorders, indices change, causing React to re-render the wrong components and producing hard-to-debug behavior.
*   **Using useCallback and useMemo everywhere:** Premature optimization is an anti-pattern. Both hooks carry overhead — memory for memoized values and comparison cost. Fix: only use them when you've measured an actual performance problem, not as a default.
*   **Confusing useEffect cleanup with componentWillUnmount:** The cleanup function runs not only on unmount but before every time the effect re-runs. Fix: understand that cleanup fires whenever dependencies change, not only when the component unmounts.
*   **Not knowing the difference between state management options:** Saying "I use Redux for every project" without knowing when Context is sufficient signals inexperience. Fix: understand the trade-offs of each option and when to escalate to a more complex solution.
*   **Not knowing React.memo uses shallow comparison:** React.memo doesn't deep compare — if a prop is an object or array, a changed reference triggers a re-render even if the values are identical. Fix: understand shallow vs deep comparison and know when a custom comparator is needed.
*   **Not knowing about auto-batching in React 18:** Before React 18, batching only happened inside event handlers. React 18 auto-batches all setState calls including those in async functions and setTimeout. Fix: update your knowledge on React 18 features — interviewers at modern companies frequently ask about this.

#### Quick FAQ

##### Q: Do ReactJS junior interviews require knowledge of Redux Toolkit?

**A:** If the job description mentions Redux, learn Redux Toolkit (RTK) rather than vanilla Redux — RTK is the officially recommended way to use Redux today, with far less boilerplate and much better developer experience. Knowing RTK without vanilla Redux is completely fine — most new projects use RTK. What matters more is understanding when you need Redux and why, not memorizing the API surface.

##### Q: Do interviewers ask about React Server Components?

**A:** For junior roles, RSC isn't a required topic — but knowing the basic concept is an advantage if you're applying to companies using Next.js 13+. Knowing that RSC renders on the server, has no state or effects, and reduces client bundle size is sufficient for junior-level questions. Don't worry if you haven't used it in production yet.

##### Q: How does useLayoutEffect differ from useEffect?

**A:** useEffect runs after the browser has painted — it doesn't block the UI. useLayoutEffect runs after DOM updates but before the browser paints — it blocks the UI until the effect completes. Use useLayoutEffect when you need to read layout from the DOM and immediately make mutations to prevent visual flickering (e.g., tooltip positioning, animations). In the vast majority of cases, useEffect is sufficient and preferred.

##### Q: What is an Error Boundary and when do you need one?

**A:** An Error Boundary is a class component that catches JavaScript errors anywhere in its child component tree, logs the error, and displays a fallback UI instead of crashing the entire application. Currently only implementable as a class component (no hook equivalent yet). Use them around important, independent UI sections — widgets, dashboard panels, feeds — so an error in one section doesn't bring down the whole page.

##### Q: What does Strict Mode do in React — is it worth knowing for interviews?

**A:** React Strict Mode is a wrapper component that helps detect unintended side effects in development — it intentionally double-invokes certain lifecycle methods and hooks to surface problems. Key thing to know: if you see useEffect running twice in development, that's Strict Mode, not a bug. Strict Mode has no effect on production builds. Interviewers occasionally ask about this to see whether candidates get confused by the double-invocation behavior.

#### Final Thoughts

**A ReactJS junior interview doesn't just test whether you can write components — it tests whether you understand why React works the way it does.** Virtual DOM, Hooks lifecycle, re-render mechanics, and state management trade-offs are the four core areas you must know before walking into any frontend technical interview.

Your next step: build a small project — a todo app with filtering and sorting — using only useState, useEffect, useCallback, and Context API, with no external state management library. Then refactor it to add Redux Toolkit. This hands-on process will give you genuine intuition about when each solution fits better — and that's exactly what interviewers want to hear.

Also read [Backend Junior Interview Questions](/en/backend-junior-interview-questions-the-complete-guide-covering-apis-databases-auth-and-caching) if you're preparing for a fullstack role or want to understand the API layer that your React frontend will consume.
