---
title: "Backend Junior Interview Questions: The Complete Guide Covering APIs, Databases, Auth, and Caching"
author: KhaiziNam
pubDatetime: 2026-04-01T13:48:29.000Z
slug: cau-hoi-phong-van-backend-junior-tong-hop-day-du-tu-database-den-api-auth-va-cache
lang: en
translationKey: post-211
featured: false
draft: false
tags:
  - "SeriesPhongVan"
description: "Preparing for a backend junior interview but not sure where to focus? This guide compiles 30+ of the most commonly asked backend junior interview questions — from REST API design and databases to authentication and caching — with in-depth analysis and suggested answers to help you pass every technical round with confidence."
---

### **Backend Junior Interview Questions: The Complete Guide Covering APIs, Databases, Auth, and Caching**

Preparing for a backend junior interview but not sure where to focus? This guide compiles 30+ of the most commonly asked backend junior interview questions — from REST API design and databases to authentication and caching — with in-depth analysis and suggested answers to help you pass every technical round with confidence.

Backend junior is one of the broadest roles in IT interviews. It's not just one language or one framework — interviewers want to see whether you understand how systems work, how data flows, and whether you think about security from the start or bolt it on as an afterthought. This guide gives you that full picture.

### Table of Contents

1\. [What backend junior interviews actually test](#en-bk1)

2\. [REST API and API design questions](#en-bk2)

3\. [Database and SQL questions](#en-bk3)

4\. [Authentication and security questions](#en-bk4)

5\. [Caching and performance questions](#en-bk5)

6\. [Case study: a real backend interview](#en-bk6)

7\. [Common mistakes when answering backend questions](#en-bk7)

8\. [Quick FAQ](#en-bk8)

* * *

#### What Backend Junior Interviews Actually Test

Many candidates prepare for backend interviews by memorizing theory — REST definitions, basic SQL queries, a few lines about JWT. This approach usually collapses the moment the interviewer asks one follow-up question: **"Have you actually done this in a real project?"**

A backend junior interview is not a memory test. It's a conversation to assess whether you have systems thinking — whether you've considered edge cases, whether you know why you'd choose one approach over another, and most importantly, whether you can explain it clearly to someone else.

The technical structure of a backend junior interview typically revolves around four pillars: **API design**, **database**, **authentication**, and **caching/performance**. Nail these four areas and you've covered 80% of what most interviews will ask.

#### REST API and API Design Questions

##### What is REST and what are its core principles?

This is the most common opening question. A weak answer lists definitions. A strong answer explains **why** REST was designed this way — Stateless makes scaling easier, resource-based URLs make APIs more readable, HTTP verbs carry clear semantic meaning.

Five principles to know cold: Stateless, Client-Server, Cacheable, Uniform Interface, Layered System. Bonus points for mentioning Code-on-Demand.

##### HTTP methods — when do you use PUT vs PATCH?

**PUT** replaces the entire resource. If you PUT a user record without the email field, the email gets deleted. **PATCH** only updates the fields you send. In practice, most modern APIs use PATCH for updates because it's less risky and saves bandwidth. Interviewers appreciate when you mention this trade-off.

##### HTTP status codes — the ones you must know

You don't need to memorize all 50+, but you must be clear on: 200 (OK), 201 (Created), 204 (No Content), 400 (Bad Request — client error), 401 (Unauthorized — not authenticated), 403 (Forbidden — authenticated but no permission), 404 (Not Found), 409 (Conflict), 422 (Unprocessable Entity), 429 (Too Many Requests), 500 (Server Error).

The most common mistake: confusing 401 and 403. **401 means "Who are you?" (not authenticated). 403 means "I know who you are, but you're not allowed in here" (no permission).**

##### API versioning — how do you avoid breaking old clients?

Three common approaches: URL versioning (`/api/v1/users`), Header versioning (`Accept: application/vnd.app.v1+json`), Query param (`?version=1`). URL versioning is most widely used because it's easy to debug and understand. A common follow-up: "How would you deprecate a version?" — standard answer: announce in advance, keep old version for at least 6 months, and return a Deprecation header in responses.

##### What is idempotency and why does it matter?

A request is idempotent if calling it multiple times produces the same result. GET, PUT, and DELETE are idempotent. POST is not — POST creates new records, so calling it twice creates two records. Understanding idempotency helps you design safe retry logic in distributed systems, a topic many juniors overlook entirely.

#### Database and SQL Questions

##### How do database indexes work?

An index is an auxiliary data structure (typically a B-Tree) that helps the database find data quickly without scanning the entire table. **Key trade-off to mention:** indexes speed up SELECT but slow down INSERT/UPDATE/DELETE because the database must update the index as well. Don't index every column — only index columns that frequently appear in WHERE, JOIN, or ORDER BY clauses.

##### JOIN types — how do INNER, LEFT, RIGHT, and FULL OUTER differ?

**INNER JOIN**: returns only rows that exist in both tables. **LEFT JOIN**: returns all rows from the left table, NULL where there's no match on the right. **RIGHT JOIN**: the reverse. **FULL OUTER JOIN**: returns all rows from both tables, NULL on whichever side has no match.

Interviewers typically give you a simple schema and ask you to write a query. Don't just study theory — practice writing real queries on SQLFiddle or DB Fiddle.

##### What is a transaction and what does ACID mean?

A transaction is a group of operations executed as an atomic unit. ACID is four properties that guarantee data integrity: **Atomicity** (all succeed or all rollback), **Consistency** (data always remains in a valid state), **Isolation** (transactions don't interfere while running), **Durability** (committed data survives crashes).

##### What is the N+1 problem and how do you fix it?

N+1 occurs when you query a list of N items, then for each item you fire another query to fetch related data — N+1 queries total. With N=100, you're hitting the database 101 times instead of 2. Fix: use **eager loading** (JOIN or IN clause to fetch all related data in one query), or use the DataLoader pattern in GraphQL contexts.

##### SQL vs NoSQL — when do you choose which?

SQL fits when your data is structured, you need ACID transactions, and relationships between tables are complex (finance, e-commerce, ERP). NoSQL fits when data is unstructured or semi-structured, you need horizontal scaling, or your schema needs to stay flexible (real-time analytics, diverse product catalogs, chat). The correct answer is always "it depends on the use case" — but you must explain the reasoning clearly.

#### Authentication and Security Questions

##### Session vs JWT — what's the core difference?

**Session** is stateful — the server stores session state, the client only holds a session ID. **JWT** is stateless — all user information is encoded in the token itself, and the server stores nothing. JWT scales more easily because any server instance can verify the token without a shared session store. JWT's downside: you cannot instantly invalidate a token before it expires.

For a deep dive, read [Session vs JWT Interview Guide — full theory and real questions](https://khaizinam.com/session-vs-jwt-phong-van) before your interview.

##### What is OAuth 2.0 — explain the basic flow?

OAuth 2.0 is an authorization framework that allows an application to access a user's resources on another service without knowing the password. The most common flow (Authorization Code): user redirects to authorization server → logs in and grants permission → receives authorization code → exchanges code for access token → uses access token to call the API. This is how "Sign in with Google/Facebook" works.

##### How do you protect an API against common attacks?

*   **SQL Injection:** Use prepared statements or an ORM — never concatenate user input directly into SQL queries.
*   **XSS:** Sanitize and escape all output, use Content-Security-Policy headers.
*   **CSRF:** Use CSRF tokens or the SameSite cookie attribute.
*   **Rate limiting:** Limit requests per IP/user to protect against brute force and DDoS.
*   **HTTPS:** Always use TLS — never transmit sensitive data over plain HTTP.

#### Caching and Performance Questions

##### What is caching and what cache layers exist in a web system?

A cache is an intermediate storage layer that serves data faster by avoiding repeated computation or database queries. Common cache layers in web systems: **Browser cache** (Cache-Control headers), **CDN cache** (Cloudflare, AWS CloudFront), **Application cache** (Redis, Memcached), **Database cache** (query cache, buffer pool).

##### What is Redis used for in a backend system?

Redis is an in-memory data store known for extreme speed, typically used for: caching (reducing database load), session storage (replacing server-side sessions), rate limiting (INCR + EXPIRE), pub/sub messaging, and job queues. **Key point to mention:** Redis is volatile by default — if the server restarts without persistence configured, data is lost. For critical data, use RDB snapshots or AOF logging.

##### Cache invalidation — the hardest problem in caching?

Cache invalidation is the decision of when and how to clear or update stale data in your cache. Three common strategies: **TTL (Time-To-Live)** — cache automatically expires after a set period; **Cache-aside** — the application manages it, reads from cache first, misses fall back to the DB then write into cache; **Write-through** — every write to the DB simultaneously updates the cache. No strategy is perfect — each has its own trade-offs.

##### What is database connection pooling and why is it necessary?

Each database connection is expensive — handshake time, memory allocation, thread overhead. Creating a new connection for every request is extremely costly. A connection pool maintains a set of reusable connections shared across requests. Misconfigured connection pools are one of the most common reasons backends crash under sudden traffic spikes.

#### Case Study: A Real Backend Interview

Tuan applied for a backend junior role at a fintech startup. Their tech stack was Node.js, PostgreSQL, and Redis. The technical interview ran 75 minutes with a senior backend engineer.

First 15 minutes: REST API and HTTP questions. Tuan answered HTTP methods and status codes well, but stumbled on idempotency — initially confusing it with stateless. He acknowledged the mistake and corrected his explanation. **Green flag: honest self-correction instead of defending a wrong answer.**

Next 30 minutes: live SQL coding. The interviewer provided a schema with users, orders, and order\_items tables, then asked for a query to fetch the top 5 users by total order value in the previous month. Tuan took 8 minutes but arrived at a correct query using GROUP BY, SUM, and LIMIT. Follow-up: "Does this query use an index?" — Tuan correctly identified which columns should be indexed and why.

Final section: design an endpoint to process payments. Tuan proactively mentioned an idempotency key to prevent double-charging when clients retry — a detail that made a strong impression because most junior candidates never think of it. **Result: passed and received an offer of 12M VND — above the company's initial proposal, partly because of the strength of the interview.**

#### Common Mistakes When Answering Backend Questions

*   **Giving theory without real examples:** "REST is stateless" lands weaker than "In project X, we chose JWT over sessions because we needed to deploy across multiple servers without a shared session store." Fix: always connect concepts to real experience, even if it's a personal project.
*   **Confusing 401 and 403:** This mistake appears in roughly 40% of junior candidates. Fix: remember simply — 401 is "Who are you?" (not authenticated), 403 is "I know who you are, but you're not allowed in" (no permission).
*   **Not stating trade-offs in comparisons:** When asked SQL vs NoSQL, "SQL is better" or "NoSQL is better" are both wrong. Fix: always answer in the format "It depends — when A, use X because... when B, use Y because..."
*   **Going silent when you don't know:** Silence is the worst signal in a technical interview. Fix: think out loud — "I haven't worked directly with this, but based on what I know about X, I would expect..."
*   **Not clarifying ambiguous requirements:** When asked to "design an API for an ordering system," don't dive in immediately. Ask: "How many requests per second does this need to handle? Does it need to support mobile?" Clarifying requirements is a senior skill — not a junior weakness.
*   **Listing technologies without explaining why:** "I used Redis for caching" is weaker than "I used Redis because this query took 200ms and was called 500 times/minute — caching reduced database load significantly." Fix: for every technical decision, provide context and reasoning.
*   **Ignoring security when designing APIs:** Interviewers notice whether you proactively mention authentication, authorization, and input validation. Fix: for every endpoint you design, ask yourself "Who can call this? What does the input need to validate?"

#### Quick FAQ

##### Q: Do backend junior interviews require knowledge of system design?

**A:** At the junior level, system design is usually not the core requirement — but knowing the basics is a real advantage. Interviewers may ask you to "design a simple API" or "what would you do differently if this system had a million users?" You don't need to answer at senior level, but showing you're thinking about scalability is a clear green flag.

##### Q: Should I learn both SQL and NoSQL before a backend interview?

**A:** Prioritize SQL first — most systems still use relational databases and SQL questions appear in almost every backend interview. For NoSQL, understanding Redis at the cache and session level is sufficient for junior roles. MongoDB or Cassandra are only necessary if the job description explicitly mentions them.

##### Q: What if I can't remember a specific SQL syntax during the interview?

**A:** Acknowledge it and explain the logic. "I don't remember the exact syntax for window functions, but I know they're used for running totals and rankings within a partition — I'd use ROW\_NUMBER() OVER (PARTITION BY...)" — this shows you understand the concept even if you don't have the syntax memorized, which interviewers value far more than silence.

##### Q: Do backend junior candidates need to understand microservices?

**A:** Knowing the concept is necessary; deep expertise is not required. You should understand what microservices are, the trade-offs versus monolith, and why microservices aren't always the right choice. That's enough for a junior-level interview. Hands-on experience with microservices typically comes after 1–2 years of working in production environments.

##### Q: Do backend interviews commonly ask about Docker and CI/CD?

**A:** Increasingly yes, especially at product companies and startups. You should know what Docker is, the difference between images and containers, and be able to write a simple Dockerfile. For CI/CD, understanding the concept and having used GitHub Actions or GitLab CI at least once is sufficient. If you haven't tried it yet, set up a simple pipeline before your next interview — it gives you something concrete to talk about.

#### Final Thoughts

**Backend junior interviews assess your systems thinking far more than your ability to recite definitions.** Master the four core areas — API design, database, authentication, and caching — then practice explaining each topic in your own words, connected to projects you've actually built.

Don't try to memorize every possible question. Instead, understand each topic deeply enough to answer the interviewer's follow-up question after your first answer — that's what separates candidates who get hired from those who don't.

Next step: work through the [Session vs JWT interview guide](https://khaizinam.com/session-vs-jwt-phong-van) and practice writing real SQL queries on at least 20 problems on LeetCode or HackerRank's SQL track before your interview.
