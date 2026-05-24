---
title: "Session vs JWT Interview Guide: Everything You Need to Answer With Confidence and Depth"
author: "Nguyễn Hữu Khải - khaizinam"
pubDatetime: 2026-04-02T12:17:09.000Z
slug: session-vs-jwt-phong-van
lang: en
translationKey: post-214
featured: false
draft: false
tags:
  - "SeriesPhongVan"
description: "You know what Session and JWT are — but do you get stuck when the interviewer asks a follow-up? This guide breaks down the full mechanics, a direct head-to-head comparison, and the most common interview questions on Session vs JWT, so you can answer with genuine depth instead of reciting a definition."
---

You know what Session and JWT are — but do you get stuck when the interviewer asks a follow-up? This guide breaks down the full mechanics, a direct head-to-head comparison, and the most common interview questions on Session vs JWT, so you can answer with genuine depth instead of reciting a definition.

In most backend junior interviews, authentication questions are almost guaranteed. "Session or JWT — which would you choose and why?" looks straightforward but is one of the clearest filters between candidates who truly understand the topic and those who've only memorized the surface.

### Table of Contents

1\. [The core problem: why is authentication tricky?](#the-core-problem-why-is-authentication-tricky)

2\. [How Session works — from request to response](#how-session-works-from-request-to-response)

3\. [How JWT works — anatomy of a token](#how-jwt-works-anatomy-of-a-token)

4\. [Direct comparison: Session vs JWT across key criteria](#direct-comparison-session-vs-jwt-across-key-criteria)

5\. [When to use Session, when to use JWT](#when-to-use-session-when-to-use-jwt)

6\. [Real-world case study](#real-world-case-study)

7\. [Common mistakes when answering this question](#common-mistakes-when-answering-this-question)

8\. [Quick FAQ](#quick-faq)

* * *

#### The Core Problem: Why Is Authentication Tricky?

HTTP is a **stateless** protocol — every request is completely independent, and the server has no memory of who you are from the previous request. This is by design to make the web scalable, but it creates a real problem: how does the server know that this request is coming from an already-logged-in user?

The answer is that state must be stored somewhere — either server-side (Session), or client-side in a self-contained token (JWT). Each approach solves the same problem with entirely different trade-offs, and understanding those trade-offs is exactly what interviewers want to see.

This article is a companion to Backend Junior Interview Questions: The Complete Guide Covering APIs, Databases, Auth, and Caching. If you haven't read that yet, start there to get the full picture of what to prepare.

#### How Session Works — From Request to Response

##### The login flow with Session

When a user logs in successfully, the server creates a **session record** stored in memory (RAM), a database, or Redis — containing information like user ID, role, and expiration time. The server then generates a random **session ID** (typically a long hex string), sends it back to the client via the Set-Cookie header. The client stores this cookie and automatically sends it with every subsequent request.

On each request, the server reads the session ID from the cookie, looks it up in the session store, finds the user data, and confirms the request is valid. If the session ID isn't found or has expired, the server returns 401.

##### Session strengths

*   **Instant revocation:** Want to log a user out across all devices? Delete the session record from the store — effective immediately. This is Session's biggest advantage that JWT simply cannot match.
*   **Payload not exposed:** The client only holds a meaningless session ID — no user information leaks to the client side.
*   **Simpler to implement:** Most frameworks include session middleware out of the box — less code, fewer opportunities for mistakes.

##### Session weaknesses

*   **Stateful — harder to scale:** If you have 3 server instances, a request hitting server A creates the session there, but the next request hitting server B won't find it. Solutions include sticky sessions or a centralized session store (Redis) — both add cost and complexity.
*   **Server memory overhead:** 1 million concurrent users means 1 million session records to store and manage.
*   **CSRF vulnerability:** Cookies are automatically sent with every request, including requests from malicious sites — requires CSRF tokens to protect against.

#### How JWT Works — Anatomy of a Token

##### The structure of a JWT

A JWT (JSON Web Token) consists of three parts separated by dots: **Header.Payload.Signature** — all Base64URL encoded.

The **Header** contains the signing algorithm (typically HS256 or RS256) and token type. The **Payload** contains claims — user information such as user\_id, role, email, and expiration time (exp). The **Signature** is the result of signing the Header + Payload with a secret key — this is what prevents tampering.

Critical to understand: **the Payload is NOT encrypted — it is only encoded.** Anyone with the token can decode and read the payload. Only the Signature is cryptographically signed — if someone modifies the payload, the signature becomes invalid and the server will reject the token.

##### The login flow with JWT

User logs in → server creates a JWT, signs it with the secret key, returns it to the client → client stores the token (typically in localStorage or an httpOnly cookie) → every subsequent request sends the token in the Authorization header: `Bearer` → server receives the token, verifies the signature using the secret key, decodes the payload to get user information — all without any database or session store lookup.

##### JWT strengths

*   **Stateless — scales easily:** Any server instance can verify a JWT as long as it has the secret key — no shared session store needed, no sticky sessions required.
*   **Cross-domain friendly:** JWT is easier to use in microservice architectures or when the frontend and backend are on different domains — no CORS cookie restriction issues.
*   **Self-contained:** The server doesn't need to query a database to identify the user — reduces latency and database load.

##### JWT weaknesses

*   **Cannot revoke before expiry:** This is JWT's biggest weakness. If a token is stolen or a user is banned, you cannot immediately invalidate that token — you must wait for it to expire naturally. Common workarounds: use short-lived access tokens (15 minutes) plus longer-lived refresh tokens, or maintain a token blacklist (though this reintroduces statefulness).
*   **Payload is readable:** Never store sensitive data (password hashes, card numbers, etc.) in a JWT payload — anyone can decode and read it.
*   **Larger token size:** A JWT is typically 200-500 bytes versus a session ID of ~32 bytes — more bandwidth consumed on every request.

#### Direct Comparison: Session vs JWT Across Key Criteria

##### State storage

**Session:** Stateful — server maintains session store. **JWT:** Stateless — client holds the token, server stores nothing.

##### Revocation capability

**Session:** Instant — delete the session record and it's done. **JWT:** Cannot revoke before exp — requires a blacklist or access/refresh token pattern as a workaround.

##### Scalability

**Session:** Requires centralized store (Redis) when scaling to multiple servers. **JWT:** Natively stateless — horizontal scaling is straightforward with no shared store needed.

##### Payload security

**Session:** Client knows nothing about session data — only holds the ID. **JWT:** Payload is decodable by anyone — never store sensitive data there.

##### Architecture fit

**Session:** Monolithic apps, same-domain frontend/backend, use cases requiring instant revocation (banking, admin panels). **JWT:** Microservices, mobile apps, cross-domain scenarios, third-party API access.

#### When to Use Session, When to Use JWT

This is the question many interviewers actually want to hear your answer to — not "JWT is better" or "Session is outdated," but genuine use-case reasoning.

**Use Session when:** Traditional web application on the same domain, need to log users out instantly across all devices (financial apps, banking, admin systems), no complex horizontal scaling requirement, or using a framework with strong session support like Laravel, Rails, or Django.

**Use JWT when:** Microservice architecture where multiple services need to verify the user, mobile apps (cookies don't work well), Single Page Application with a separate API, need to grant tokens to third-party services, or system that needs horizontal scaling without managing a centralized session store.

**Use both (hybrid):** A common production pattern is to use Session for the main web app (because instant revocation is required) and JWT for mobile APIs or third-party integrations. This is a "senior-level" answer that junior candidates rarely think of — but mentioning it will make a strong impression.

#### Real-World Case Study

Hung was interviewing for a backend junior position at a fintech company building a mobile banking application. The interviewer asked: "Would you use Session or JWT to authenticate users in our mobile app, and why?"

Hung's answer: "For a mobile app, I'd choose JWT with an access/refresh token pattern. Mobile clients don't handle cookies as naturally as browsers do, and JWT is a better fit for stateless authentication over a REST API. However, since this is a financial application, I'd use short-lived access tokens — 15 minutes — combined with refresh tokens stored in the device's secure storage. If suspicious activity is detected, the refresh token can be revoked server-side to force re-authentication."

The interviewer followed up: "What if the user loses their phone?" — Hung responded: "Implement a revoke-all-tokens endpoint for that user — essentially maintaining a refresh token blacklist in Redis with appropriate TTL, or using a token version number in the database. This is a point where we accept adding some statefulness back in order to guarantee security."

**Result: Hung received strong positive feedback — not because he picked the "right" answer, but because he demonstrated trade-off reasoning and edge case handling. That's exactly the mindset backend engineers need to show.**

#### Common Mistakes When Answering This Question

*   **Saying "JWT is more secure than Session" without explanation:** This is incorrect. Session can be just as secure as JWT when implemented properly. Both have different security strengths and weaknesses. Fix: always say "it depends on the use case and implementation" rather than making absolute security claims.
*   **Confusing encode with encrypt in JWT:** JWT payload is Base64URL encoded — not encrypted. Many juniors say "JWT encrypts user information" — this is completely wrong. Fix: remember clearly — encode = anyone can decode it, encrypt = requires a key to decrypt.
*   **Not knowing JWT payload is readable:** Saying "I store the password in the JWT payload because it's encrypted" is a serious red flag. Fix: never store sensitive information in the payload; only store non-sensitive identifiers like user\_id and role.
*   **Not knowing how to revoke a JWT:** When the interviewer asks "how do you log a user out from all devices with JWT?" — silence is not an option. Fix: prepare at least two approaches — blacklisting tokens in Redis with TTL, or using a token version/generation number in the database.
*   **Storing JWT in localStorage without mentioning XSS risk:** localStorage is vulnerable to XSS attacks reading the token. A better approach is httpOnly cookies — but those require CSRF protection. Knowing this trade-off is a clear green flag. Fix: always mention the storage trade-off when discussing JWT.
*   **Not mentioning the access/refresh token pattern:** Knowing only about access tokens without refresh tokens means missing an important part of production auth flows. Fix: study and practice implementing the full access + refresh token flow before your interview.
*   **Picking one side absolutely without considering use case:** "I always use JWT" or "Session is the right way" are both weak answers. Fix: start with "It depends on the system requirements..." then analyze the specific context.

#### Quick FAQ

##### Q: Is JWT the same as OAuth?

**A:** No — these are two different concepts that are commonly confused. JWT is a token format — a way to encode and sign information. OAuth 2.0 is an authorization framework — a protocol for granting access rights. JWT is frequently used as the format for access tokens within OAuth 2.0, but OAuth doesn't require JWT — opaque tokens are a valid alternative. Understanding this distinction will set you apart from candidates who use the terms interchangeably.

##### Q: Where should JWT be stored — localStorage or Cookie?

**A:** This is one of the most debated questions in web security. localStorage is easy to implement but vulnerable to XSS attacks reading the token. httpOnly Cookie protects against XSS but requires CSRF protection and has cross-domain limitations. The most common production approach: httpOnly, Secure, SameSite=Strict cookie for web apps; platform secure storage (Keychain on iOS / Keystore on Android) for mobile apps. There's no perfect answer — every approach has trade-offs.

##### Q: What's the difference between HS256 and RS256 in JWT?

**A:** HS256 uses HMAC with a single shared secret key for both signing and verification — simple, but every server that verifies tokens must know the secret. RS256 uses an RSA key pair — the private key signs, the public key verifies — better suited for microservices because you only need to distribute the public key while keeping the private key secure on the auth server. For simple single-server systems, HS256 is fine. For microservices or third-party verification, RS256 is the better choice.

##### Q: What is a refresh token and why is it necessary?

**A:** JWT access tokens typically have a short lifespan (5-15 minutes) to minimize the damage window if stolen. But you can't force users to re-login every 15 minutes — this is where refresh tokens come in. A refresh token is a separate, longer-lived token (7-30 days), stored securely. When the access token expires, the client uses the refresh token to obtain a new access token silently, without requiring the user to enter their password again. Refresh tokens are stored server-side and can be revoked at any time.

##### Q: Do Node.js and PHP interviews ask about Session/JWT differently?

**A:** The concepts are the same, but implementation details differ. For PHP/Laravel interviews, expect questions about Laravel Sanctum vs Passport, session driver configuration (file, database, Redis), and cookie encryption. For Node.js, questions typically focus on express-session, the jsonwebtoken library, and middleware patterns.

#### Final Thoughts

**Session and JWT are not opponents in a competition — they are two tools solving the same problem in different ways, each appropriate for a different context.** Interviewers don't want to hear you pick the "right" one — they want to see that you know why you're picking it and why the other approach could also be right in a different situation.

Before your backend interview, implement both from scratch — a mini app using Session, and one using JWT with the full access/refresh token flow. Hands-on experience will help you answer every follow-up question naturally, in a way that no amount of memorization can replicate.

21/04/2026

> See more: 
> 
> *   [Session vs JWT: Full Theory](/en/session-vs-jwt-toan-bo-ly-thuyet)
> *   [Session vs JWT Interview](/en/session-vs-jwt-phong-van)
> *   [Common JWT Interview Questions](/en/cau-hoi-phong-van-jwt-thuong-gap)
> *   [Session vs JWT: Which One Should Developers Choose?](/en/session-vs-jwt-developer-nen-chon-cai-nao)
> *   [JWT Security Best Practices](/en/jwt-security-best-practices)
