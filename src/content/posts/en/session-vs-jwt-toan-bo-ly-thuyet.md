---
title: "Session vs JWT: The Complete Theory and Most Common Interview Questions Every Junior Developer Must Know"
author: "Nguyễn Hữu Khải - khaizinam"
pubDatetime: 2026-03-19T19:26:34.000Z
slug: session-vs-jwt-toan-bo-ly-thuyet
lang: en
translationKey: post-204
featured: true
draft: false
tags:
  - "SeriesPhongVan"
description: "Nearly 100% of backend interviews include questions about authentication — and the most classic question is still: \"How do you distinguish Session from JWT, and when do you use each?\" It sounds familiar, but many Juniors answer it wrong or only half-right."
---

Nearly 100% of backend interviews include questions about authentication — and the most classic question is still: "How do you distinguish Session from JWT, and when do you use each?" It sounds familiar, but many Juniors answer it wrong or only half-right. This article consolidates all the core theory, provides a deep analysis of every key difference, and lists the real interview questions that come up around this topic — with detailed answers so you won't be caught off guard.

### Table of Contents

1\. [The Nature of Authentication — Why Do We Need Session or JWT?](#the-nature-of-authentication-why-do-we-need-session-or-jwt)

2\. [What Is a Session — How It Works and Where It's Stored](#what-is-a-session-how-it-works-and-where-its-stored)

3\. [What Is JWT — Structure, Mechanism, and Where It's Stored](#what-is-jwt-structure-mechanism-and-where-its-stored)

4\. [Detailed Comparison: Session vs JWT — Similarities and Differences](#detailed-comparison-session-vs-jwt-similarities-and-differences)

5\. [When to Use Session, When to Use JWT](#when-to-use-session-when-to-use-jwt)

6\. [Real Interview Questions and How to Answer Them Correctly](#real-interview-questions-and-how-to-answer-them-correctly)

7\. [Common Mistakes When Implementing and Answering Interview Questions](#common-mistakes-when-implementing-and-answering-interview-questions)

8\. [FAQ — The Deepest Questions About Session and JWT](#faq-the-deepest-questions-about-session-and-jwt)

* * *

#### The Nature of Authentication — Why Do We Need Session or JWT?

Before comparing, you need to understand why this problem exists. **HTTP is stateless** — each request is completely independent; the server doesn't automatically remember that you logged in on a previous request. After a user enters the correct username and password, the server needs a mechanism to **prove the user's identity** on subsequent requests without forcing them to log in again.

This is the problem of **Authentication State Management** — and there are two schools of thought that are completely different in philosophy:

*   **Server-side state (Session):** The server stores the login state; the client only holds a "claim ticket" to look it up.
*   **Client-side state (JWT):** The server stores nothing; all information is encoded and sent back for the client to hold.

Understanding this philosophy correctly is the foundation for answering every related interview question. Every difference between Session and JWT stems from this fundamental architectural choice.

#### What Is a Session — How It Works and Where It's Stored

![What Is a Session — How It Works and Where It's Stored](https://cdn.khaizinam.io.vn/blogs/session-la-gi.jpg)

What Is a Session — How It Works and Where It's Stored

**Session** is a mechanism in which the server creates a record storing the user's login state, assigns it a unique random ID (Session ID), then sends that Session ID back to the client via a cookie. On subsequent requests, the client sends the Session ID along — the server uses that ID to look up the session record and identify who the user is.

##### Step-by-Step Session Flow

1.  User sends POST /login with username + password.
2.  Server validates credentials; if correct, creates a session record: `{ user_id: 42, role: "admin", created_at: "..." }`
3.  Server stores the session record in storage (file, database, Redis...) with a random Session ID as the key, e.g.: `abc123xyz`
4.  Server returns a response with the header `Set-Cookie: session_id=abc123xyz; HttpOnly; Secure`
5.  The browser automatically saves the cookie and sends it along with every subsequent request.
6.  Server receives the request, reads the cookie to get the session\_id, looks it up in storage → knows this is user 42 with the admin role.
7.  On logout, the server deletes the session record from storage → that Session ID is immediately invalidated.

##### Where Is Session Stored — Server Side

This is the most commonly asked interview question in the Session section. Session data is stored **server-side**, not client-side. The client only holds the Session ID (a meaningless random string). There are multiple storage options for session data:

*   **File system:** The default in many frameworks (PHP defaults to saving files at `/tmp/sess_abc123`). Simple, no additional configuration needed. Downside: cannot be shared across multiple server instances — meaning it cannot scale horizontally.
*   **Database (MySQL/PostgreSQL):** Stored in a `sessions` table. Easy to query, audit, and force logout. Downside: each request requires a DB query — adding latency.
*   **Redis (most popular in production):** In-memory, extremely fast, supports automatic TTL expiry, easy to scale, shareable across multiple server instances. This is the standard choice for production systems that need horizontal scaling. Laravel uses `SESSION_DRIVER=redis`.
*   **Memcached:** Similar to Redis but with fewer features. Less common in newer projects.

##### Where Is the Session ID Stored — Client Side

On the client side, the Session ID is stored in a **cookie**. The cookie should be set with security flags:

*   **HttpOnly:** JavaScript cannot read this cookie → prevents XSS attacks from stealing the Session ID.
*   **Secure:** Only sent over HTTPS, not HTTP → prevents man-in-the-middle attacks.
*   **SameSite=Strict or Lax:** Restricts the cookie from being sent with cross-site requests → reduces CSRF risk.

// Laravel session config — config/session.php
'driver'    => env('SESSION\_DRIVER', 'redis'),
'lifetime'  => 120,          // minutes
'expire\_on\_close' => false,
'encrypt'   => true,         // encrypt session data before storing
'cookie'    => 'laravel\_session',
'secure'    => true,         // HTTPS only
'http\_only' => true,         // not readable by JS
'same\_site' => 'lax',

#### What Is JWT — Structure, Mechanism, and Where It's Stored

![What Is JWT — Structure, Mechanism, and Where It's Stored](https://cdn.khaizinam.io.vn/blogs/jwt-la-gi.jpg)

What Is JWT — Structure, Mechanism, and Where It's Stored

**JWT (JSON Web Token)** — pronounced "jot" — is an open standard ([RFC 7519](https://datatracker.ietf.org/doc/html/rfc7519)) that defines how to securely transmit information between parties as a digitally signed JSON object. The key point: **the server stores nothing** — all information lives inside the token; the server only needs to verify the signature to authenticate.

##### The Structure of a JWT

A JWT consists of 3 parts, separated by dots: `Header.Payload.Signature`

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
.
eyJ1c2VyX2lkIjo0Miwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzE2MDAwMDAwfQ
.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV\_adQssw5c

Each part is Base64Url encoded JSON:

**Header:** Contains the token type and signing algorithm.

{ "alg": "HS256", "typ": "JWT" }

**Payload (Claims):** Contains user information and metadata. The payload is **not encrypted** — only Base64 encoded, so anyone can decode it. Never store sensitive information like passwords here.

{ "user\_id": 42, "role": "admin", "exp": 1716000000, "iat": 1715913600 }

**Signature:** Created by signing the Header + Payload with a secret key. This is the part that ensures the token cannot be forged — if anyone modifies the Payload, the signature will no longer match.

HMACSHA256(base64(header) + "." + base64(payload), SECRET\_KEY)

##### Step-by-Step JWT Flow

1.  User sends POST /login with credentials.
2.  Server validates credentials, creates a JWT with a payload containing user\_id, role, exp (expiry time), signed with the secret key.
3.  Server returns the token to the client. **The server stores nothing.**
4.  Client stores the token and sends it along with every subsequent request in the header: `Authorization: Bearer <token>`
5.  Server receives the request, verifies the signature using the secret key → if valid, reads the payload and knows this is user 42.
6.  No need to query a database or any storage to authenticate.

##### Where Is JWT Stored — Client Side

This is a question many people answer incorrectly. JWT is stored **client-side**, and there are multiple options with different trade-offs:

*   **localStorage / sessionStorage:** Simple, easy for JavaScript to read. But this is the **least secure option** — an XSS attack can steal the token directly via `localStorage.getItem('token')`. Not recommended for production apps handling sensitive data.
*   **HttpOnly Cookie:** More secure because JavaScript cannot read it, protecting against XSS. However, cookies are automatically sent with requests → CSRF protection must be added. This is how many modern SPAs store JWTs.
*   **In-memory (JavaScript variable):** Most secure — not persisted anywhere, XSS cannot access it. Downside: refreshing the page loses the token and the user must log in again. Often combined with a Refresh Token stored in an HttpOnly Cookie to solve this problem.

There is no perfect option — each trades off between security, UX, and implementation complexity. This is why this question appears more often in senior interviews than junior ones.

##### Access Token and Refresh Token

In practice, JWTs are typically used in pairs to balance security and UX:

*   **Access Token:** Short-lived (15 minutes to 1 hour). Sent with every API request. If leaked, the damage is limited to a short window of time.
*   **Refresh Token:** Long-lived (7 to 30 days). Stored in an HttpOnly cookie. Only used to request a new Access Token when the Access Token expires. Not used for API calls.

// Laravel Sanctum / Passport — creating tokens
$user = User::find(1);
// Access token — expires after 60 minutes
$accessToken = $user->createToken('access-token', \['\*'\], now()->addHour())->plainTextToken;
// Refresh token — expires after 30 days
$refreshToken = $user->createToken('refresh-token', \['refresh'\], now()->addDays(30))->plainTextToken;

#### Detailed Comparison: Session vs JWT — Similarities and Differences

##### Similarities

*   Both solve the problem of maintaining login state over stateless HTTP.
*   Both support setting an expiry time.
*   Both require HTTPS to protect against being stolen in transit.
*   Both are authentication mechanisms — not authorization mechanisms (Authorization is a separate layer on top).

##### Core Differences

*   **State storage:** Session stores state server-side (stateful). JWT stores no state server-side (stateless). This is the most fundamental difference.
*   **Scalability:** Session requires shared storage (Redis) when scaling horizontally — multiple servers need access to the same session store. JWT does not — each server independently verifies using the secret key.
*   **Revocation:** Sessions can be revoked immediately by deleting the record on the server. JWTs cannot be revoked before expiry without a blacklist — this is JWT's biggest weakness.
*   **Size:** A Session ID is a short string (~32 characters). A JWT is much longer (hundreds of characters) because it carries a payload — sending it with every request consumes more bandwidth.
*   **Contained information:** A Session ID contains no information — it's just a key for lookup. A JWT contains user information in its payload — the server can read it immediately without a DB query.
*   **Cross-domain:** Cookies (Session) are restricted by the Same-Origin Policy — difficult to use cross-domain. JWT in the Authorization header has no such restriction — suitable for APIs called from multiple domains.
*   **Server load:** Session requires I/O (Redis/DB lookup) on every request. JWT only requires cryptographic verification — faster, no I/O needed.
*   **Best suited for:** Session suits traditional web apps (server-rendered, monolith). JWT suits APIs, SPAs, mobile apps, and microservices.

#### When to Use Session, When to Use JWT

This question has no absolute answer — it depends on the specific requirements of the system. However, there are clear principles to guide the decision:

##### Use Session When

*   **Traditional server-rendered web app:** MVC monoliths like Laravel Blade, Rails, Django — Session + Cookie is the natural choice and is supported out of the box by the framework.
*   **Immediate revocation is required:** Banking systems, admin panels, healthcare — anywhere that needs to force logout a user immediately upon detecting anomalies. With Session, just delete the record and it's done.
*   **Session data changes frequently:** User roles and permissions change constantly — with Session, the server reads the latest data on every request. With JWT, once the token is signed it cannot be updated until it expires.
*   **Single domain only:** The app doesn't need to share authentication across multiple domains or subdomains — Session is sufficient and simpler.
*   **Small team, simple project:** Session has fewer footguns — fewer points of failure when implementing, suitable when security matters but the team lacks experience with JWT.

##### Use JWT When

*   **API for mobile apps or SPAs:** Mobile apps don't have native browser cookies — JWT in the Authorization header is the standard. SPAs calling APIs from different domains — JWT isn't subject to Same-Origin restrictions.
*   **Microservices:** Service A needs to authenticate requests from Service B without both sharing the same session store. JWT allows each service to verify independently using a public key.
*   **Horizontal scaling without shared storage:** Serverless functions, edge computing, multiple server instances not sharing Redis — stateless JWT requires no shared storage.
*   **Third-party authentication (OAuth 2.0 / OIDC):** Google, Facebook, and GitHub login all use JWT (ID Token in OpenID Connect). If you're integrating SSO or OAuth, you'll be working with JWT.
*   **Public API for external developers:** JWT-based API keys make it easy to embed scope and expiry information without server lookups.

##### Cases Where Using Both Together Makes Sense

This is a pattern few Juniors know but is very common in practice: **Session for the web app, JWT for the API**. For example: an e-commerce system has a web app (using Session + Cookie) and a mobile app + third-party API (using JWT). Both share the same backend but use different authentication mechanisms depending on the client type.

In Laravel, this is why both `auth:sanctum` (supporting both Session-based and Token-based auth) and `auth:api` (pure JWT) exist.

#### Real Interview Questions and How to Answer Them Correctly

This section is compiled from real experience — questions that actually appear in interviews, not textbook questions.

##### Question 1: "Can you explain how Session and JWT differ?"

This is the opening question. Answer by leading with the **architectural philosophy** first, then move to technical details:

"Session is stateful — the server stores the login state, and the client only holds an ID to look it up. JWT is stateless — the server stores nothing; all information is embedded in a token that the client holds, and the server only verifies the signature. This fundamental difference leads to trade-offs in scalability, revocation, and suitability for different types of applications."

##### Question 2: "Where is a Session stored? Where is a JWT stored?"

This question has two layers that need to be answered clearly — server side and client side:

"Session data is stored server-side — it can be in a file, a database, or Redis. The client only stores the Session ID in a cookie. JWT stores nothing on the server. On the client side, JWT can be stored in localStorage, sessionStorage, or an HttpOnly cookie — each option has different security trade-offs. The most secure approach is in-memory combined with a Refresh Token in an HttpOnly cookie."

##### Question 3: "If a user is banned, how do you invalidate their JWT immediately?"

This is a trap question — many Juniors don't know this is an inherent weakness of JWT. The correct answer:

"JWT cannot be revoked before expiry in a purely stateless way. There are two approaches: First, use a short-lived access token (15 minutes) — if a user is banned, the token expires on its own within 15 minutes. Second, maintain a JWT blacklist in Redis — when revoking, store the jti (JWT ID) in the blacklist; each request checks whether the jti is on the blacklist. The second approach essentially makes JWT semi-stateful, losing some of its original advantages."

##### Question 4: "Why shouldn't you store JWT in localStorage?"

"localStorage can be read by any JavaScript running on the page — including malicious code injected via XSS. If the app is hit by XSS, an attacker can run `localStorage.getItem('token')` and grab the JWT immediately. In contrast, an HttpOnly cookie cannot be read by JavaScript — XSS cannot access it. However, HttpOnly cookies are more vulnerable to CSRF, so CSRF token protection must also be added."

##### Question 5: "Can the JWT payload be read? Is it secure?"

"The JWT payload is only Base64Url encoded, not encrypted — anyone can decode it. The security of JWT does not rely on keeping the payload secret; it relies on the signature — which ensures the payload hasn't been tampered with. Therefore, never store sensitive information like passwords or credit card details in the JWT payload."

##### Question 6: "When would you use Session vs JWT? If you're building an internal admin panel, which would you choose?"

"For an internal admin panel, I'd use Session. The reason: admin panels are typically server-rendered web apps or SPAs on the same domain, with no cross-domain authentication requirements. More importantly, admins need the ability to revoke sessions immediately — if a compromised account is detected, you need to log it out right away, not wait for a token to expire. Session allows that simply and securely."

##### Question 7: "What's the difference between HS256 and RS256 in JWT?"

Less common for Juniors, but if asked:

"HS256 uses a symmetric key — the same secret key is used to both sign and verify. Every party that needs to verify must know the secret key — not ideal when multiple services need to verify independently. RS256 uses an asymmetric key pair — a private key to sign (known only to the auth server), and a public key to verify (which any service can hold). Microservices typically use RS256 because services only need the public key to verify without ever knowing the private key."

#### Common Mistakes When Implementing and Answering Interview Questions

*   **Mistake 1: Storing passwords or sensitive information in the JWT payload.** The payload is only Base64 encoded, not encrypted — anyone can read it. Prevention: only store user\_id, role, and exp in the payload. Sensitive information must be queried from the DB when needed.
*   **Mistake 2: Thinking JWT is "more secure" than Session in an absolute sense.** Neither is absolutely more secure — there are only trade-offs suited to different use cases. JWT has its own weaknesses (revocation, visible payload). Session has its own weaknesses (CSRF, shared storage). Prevention: analyze system requirements before choosing.
*   **Mistake 3: Setting JWT expiry too long.** A 30-day access token is completely wrong — if leaked, the attacker has 30 days to use it. Prevention: access tokens 15 minutes to 1 hour, refresh tokens 7 to 30 days, rotate the refresh token after each use.
*   **Mistake 4: Not verifying the signature when receiving a JWT.** This is a critical error — if you only decode the payload without verifying the signature, an attacker can forge a token by modifying the payload and removing the signature. Prevention: always use a standard JWT library; never implement your own verification logic.
*   **Mistake 5: Using the "none" algorithm in JWT.** Some older JWT libraries allow the "none" algorithm — no signing required. Attackers can exploit this by sending a token with alg=none and an arbitrary payload. Prevention: always explicitly whitelist the allowed algorithms; never allow "none".
*   **Mistake 6: Not adding CSRF protection when using cookie-based JWT.** HttpOnly cookies protect against XSS but not CSRF. Prevention: add SameSite=Strict or a CSRF token when storing JWT in a cookie.
*   **Mistake 7: During the interview, only reciting theory without connecting it to real experience.** Interviewers want to know if you've actually implemented it, not just read the docs. Prevention: prepare a real-world example — "I used Laravel Sanctum with token-based auth for a REST API consumed by a mobile app, specifically..."

#### FAQ — The Deepest Questions About Session and JWT

##### Q: Can JWT be used with Laravel, or is Session the only option?

**A:** Laravel supports both. Laravel Sanctum supports both Session-based authentication (for SPAs on the same domain) and Token-based (for mobile apps and APIs). Laravel Passport implements full OAuth 2.0 with JWT. The `tymon/jwt-auth` package is another popular choice for pure JWT. By default, Laravel uses Session for web routes and Token for API routes.

##### Q: How does a Refresh Token work, and why do we need two types of tokens?

**A:** The Access Token has a short lifespan to limit damage if leaked, but too short means users must log in again constantly. The Refresh Token has a long lifespan and is only used to get a new Access Token when the current one expires. The client automatically calls the refresh endpoint upon receiving a 401, gets a new Access Token without any user action. The Refresh Token should be stored in an HttpOnly cookie; the Access Token in-memory, for maximum security.

##### Q: Should microservices use JWT or Session?

**A:** JWT is the standard choice for microservices. The reason: services don't share a session store, and each service needs to verify requests independently. With JWT using RS256, the auth service holds the private key to sign tokens, while all other services only need the public key to verify. No need to call the auth service on every request — Service A self-verifies the JWT and reads the claims without any additional I/O.

##### Q: Can you use both Session and JWT in the same application?

**A:** Absolutely, and it's quite common in practice. Laravel allows defining multiple guards in `config/auth.php`: a web guard using Session for browsers, and an api guard using tokens for mobile apps and third-party clients. The `auth:web` and `auth:api` middleware are applied separately to their respective route groups. This pattern is well suited for systems that have both a web app and a REST API.

##### Q: If the JWT secret key is leaked, what should you do?

**A:** This is a serious situation — the attacker can forge any token using that secret key. Immediate steps: rotate to a new secret key and redeploy the service. All existing tokens signed with the old key will immediately fail verification — all users are logged out and must log in again. To reduce risk, secret keys should be rotated regularly and key versioning used in the payload (`"kid": "v2"`) to support a transition period.

#### Summary — How to Remember So You Never Confuse Them Again

After all that theory, here's the simplest way to remember: **Session is like a parking ticket — you hold the stub, the lot holds your car. JWT is like a driver's license — you carry all the information yourself, and anyone can verify it without calling a central authority.**

Choose Session when you need absolute control — immediate revocation, full audit trail, always-fresh data. Choose JWT when you need flexibility — multiple clients, multiple domains, horizontal scaling without shared storage.

See more articles in the [Interview Series](/en/tag/seriesphongvan)

**Practical next step:** Open an old Laravel project and try implementing both mechanisms — Session for web routes, Sanctum token for API routes. Write a `/me` endpoint that works with both guards. Once you've implemented it yourself and debugged real errors, this interview topic will no longer be a challenge.

21/04/2026

> See more: 
> 
> *   [Session vs JWT: Full Theory](/en/session-vs-jwt-toan-bo-ly-thuyet)
> *   [Session vs JWT Interview](/en/session-vs-jwt-phong-van)
> *   [Common JWT Interview Questions](/en/cau-hoi-phong-van-jwt-thuong-gap)
> *   [Session vs JWT: Which One Should Developers Choose?](/en/session-vs-jwt-developer-nen-chon-cai-nao)
> *   [JWT Security Best Practices](/en/jwt-security-best-practices)
