---
title: "JWT Security Best Practices: How to Secure JSON Web Tokens in Production 2026"
author: "Nguyễn Hữu Khải - khaizinam"
pubDatetime: 2026-04-06T09:01:23.000Z
slug: jwt-security-best-practices
lang: en
translationKey: post-217
featured: false
draft: false
tags:
  - "SeriesPhongVan"
description: "You've implemented JWT and it works - but is it actually secure? Many developers get the functionality right while getting the security completely wrong: storing tokens in localStorage, using weak secrets, skipping claims validation, or ignoring refresh token rotation."
---

Summary of 10+ of the most important JWT security best practices in 2026 - from secure token storage and choosing the right signing algorithm to handling revocation - helping developers avoid critical security vulnerabilities in production projects.

You already know what JWT is and have used it in projects, but are you making security mistakes that hackers could exploit in minutes? Many developers implement JWT correctly in terms of functionality but completely wrong in terms of security - storing tokens in localStorage, using weak secret keys, failing to rotate refresh tokens, or ignoring claim validation. A system compromised due to JWT misconfiguration can lose all user sessions in just a few hours. This article goes straight into each specific best practice, explaining why and guiding you on how to implement it correctly.

Article Content:

*   [1\. The Nature of JWT Security Risks](/en/#ban-chat-rui-ro)
*   [2\. Before/After applying correct best practices](/en/#truoc-sau)
*   [3\. Choosing the right signing algorithm (HS256 vs RS256 vs ES256)](/en/#chon-thuat-toan)
*   [4\. Secure Token Storage](/en/#luu-tru-token)
*   [5\. Validating Claims & Expiry correctly](/en/#claims-va-expiry)
*   [6\. Handling Revocation & Refresh Token Rotation](/en/#revocation)
*   [7\. 6 most common JWT security mistakes](/en/#sai-lam)
*   [8\. FAQ - Frequently Asked Questions about JWT Security](/en/#faq)

* * *

#### 1\. The Nature of JWT Security Risks

##### 1.1 Why is JWT easier to misconfigure than Sessions?

JWT is a self-contained technology - all authentication information resides within the token, and the server does not store state. This creates high flexibility but also shifts security responsibility entirely to the developer. With Sessions, the server has direct control: to kick a user out, just delete the session. With JWT, if a token is leaked and you don't have a revocation mechanism, an attacker can use that token for its entire remaining duration - which could be 24 hours, or even 7 days if configured incorrectly.

##### 1.2 Practical JWT attack vectors you need to know

*   **Algorithm Confusion (alg:none / RS256 → HS256 confusion)**: Attackers modify the header to bypass signature verification or use a public key as a secret key in HS256.
*   **Weak Secret Brute-Force**: Weak secret keys are cracked offline from stolen tokens.
*   **Token Theft via XSS**: Tokens stored in localStorage are read by malicious scripts and sent to an attacker's server.
*   **CSRF via Cookies**: Tokens stored in cookies without the SameSite attribute are exploited via cross-site requests.
*   **Payload Injection**: Developers accidentally save sensitive information in the payload, assuming JWT is encrypted.

#### 2\. Before/After applying JWT Security Best Practices

##### 2.1 System before applying practices

*   Secret key: "mysecret" - 8 characters, easy to brute-force in minutes.
*   Token TTL: 7 days - wide attack window if the token is leaked.
*   Storage: localStorage - XSS can steal the token instantly.
*   No iss, aud validation - attackers can use tokens from other services.
*   No refresh token rotation - stolen tokens can be used forever until expiration.

##### 2.2 System after applying best practices

*   Secret key: 256-bit random string from **crypto.randomBytes(32)** - practically impossible to brute-force.
*   Access token TTL: 15 minutes - minimizes damage if a token is leaked.
*   Storage: refresh token in httpOnly + Secure + SameSite=Strict cookie.
*   Full validation: exp, iss, aud, nbf before each request.
*   Refresh token rotation + jti blacklist in Redis upon logout.

#### 3\. Choosing the right signing algorithm: HS256, RS256, ES256

##### 3.1 HS256 - When is it suitable?

HS256 (HMAC SHA-256) is a symmetric algorithm: the same secret key is used for both signing and verification. Suitable when there is only one service that both issues and authenticates tokens. Pros: simple, fast. Cons: if multiple services need verification, all must hold the secret - leaking risk increases with the number of services.

```javascript
// Node.js - Generating a strong secret key
const crypto = require('crypto');
const secret = crypto.randomBytes(32).toString('hex');
// Result: 64 hex characters = 256 bit entropy

// Signing the token
const jwt = require('jsonwebtoken');
const token = jwt.sign(
  { sub: userId, role: 'user', iss: 'khaizinam.io.vn', aud: 'app' },
  secret,
  { algorithm: 'HS256', expiresIn: '15m' }
);
```

##### 3.2 RS256 - The choice for microservices

RS256 is asymmetric: a private key for signing (held only by the Auth Service), and a public key for verification (can be made public via a JWKS endpoint). This is the best practice for microservices systems or when third parties need to verify tokens.

```javascript
// Node.js - Signing with RS256
const fs = require('fs');
const privateKey = fs.readFileSync('private.pem');

const token = jwt.sign(
  { sub: userId, iss: 'auth.khaizinam.io.vn', aud: 'api' },
  privateKey,
  { algorithm: 'RS256', expiresIn: '15m' }
);

// Verifying with public key
const publicKey = fs.readFileSync('public.pem');
const decoded = jwt.verify(token, publicKey, {
  algorithms: ['RS256'], // ALWAYS whitelist the algorithm
  issuer: 'auth.khaizinam.io.vn',
  audience: 'api'
});
```

##### 3.3 ES256 - When higher performance than RS256 is needed

ES256 (ECDSA with P-256) is also asymmetric but with smaller keys and significantly faster than RS256 - suitable for mobile or IoT. It offers equivalent security to RS256 but the signature is ~3 times smaller, reducing network overhead.

#### 4\. Secure Token Storage - Decisions affecting overall security

##### 4.1 Why is localStorage the wrong choice?

localStorage is accessible by any JavaScript running on the same origin - including scripts injected via XSS. A minor XSS vulnerability (e.g., rendering un-sanitized user input) is enough for an attacker to run **localStorage.getItem('token')** and send it to their server. This isn't theory - this is an attack vector exploited in many real-world bug bounty reports.

##### 4.2 httpOnly Cookie - Best practice for web apps

```javascript
// Node.js / Express - Setting refresh token in httpOnly cookie
res.cookie('refreshToken', refreshToken, {
  httpOnly: true,      // JavaScript cannot read it
  secure: true,        // Only send via HTTPS
  sameSite: 'strict',  // Block CSRF
  maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
});

// Access token: sent in response body, client stores in memory (JS variable)
// Do not store in localStorage or sessionStorage
res.json({ accessToken });
```

##### 4.3 Storage strategy by platform

*   **Web App**: Refresh token → httpOnly cookie. Access token → in-memory (JS variable, lost on F5 - this is an acceptable tradeoff).
*   **Mobile App (React Native)**: Use **react-native-keychain** or Expo SecureStore - store in iOS Keychain / Android Keystore, not AsyncStorage.
*   **SPAs needing persistence**: Use silent refresh - access token in-memory; when lost, automatically call the refresh endpoint (using the httpOnly cookie) to retrieve a new one.

#### 5\. Validating Claims & Expiry correctly

##### 5.1 Mandatory claims to validate

Many developers only verify the signature and ignore claim validation - this is a serious vulnerability. You must validate:

*   **exp** (expiration): Has the token expired? Most libraries do this automatically, but ensure this feature is not disabled.
*   **nbf** (not before): Is the token being used earlier than allowed?
*   **iss** (issuer): Does the token come from the correct Auth Server? Prevents tokens từ other services from being misused.
*   **aud** (audience): Was the token created for the specific service verifying it?
*   **alg whitelist**: Always specify the list of allowed algorithms; do not let the library blindly trust the header.

```php
// Laravel PHP - Full validation with firebase/php-jwt
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

$decoded = JWT::decode($token, new Key($publicKey, 'RS256'));

// Manual additional validation
if ($decoded->iss !== 'auth.khaizinam.io.vn') {
    throw new \Exception('Invalid issuer');
}
if ($decoded->aud !== 'api') {
    throw new \Exception('Invalid audience');
}
// exp is automatically checked by firebase/php-jwt - throws ExpiredException if expired
```

##### 5.2 Clock Skew - The issue few notice

In distributed environments, clocks between servers can drift by a few seconds. A newly created token might be rejected by another service for "not yet valid (nbf)" or "expired (exp)". Best practice: allow a clock skew of up to 30-60 seconds during validation.

#### 6\. Handling Revocation & Refresh Token Rotation

##### 6.1 Core problem: JWT cannot revoke itself

This is a design trade-off of JWT compared to Sessions. Once issued, a token is valid until it expires - even if the user changes their password, is banned, or an admin wants to kick them. Solutions must be built externally:

##### 6.2 Jti Blacklist with Redis - Instant Revocation

```javascript
// Upon logout or when immediate revocation is needed
// 1. Read jti from the current token
const decoded = jwt.decode(token);
const jti = decoded.jti;
const ttl = decoded.exp - Math.floor(Date.now() / 1000);

// 2. Store in Redis with TTL = remaining time of the token
await redis.setex(`blacklist:${jti}`, ttl, '1');

// 3. Verify middleware - check blacklist before allowing access
const isBlacklisted = await redis.get(`blacklist:${jti}`);
if (isBlacklisted) {
    return res.status(401).json({ error: 'Token revoked' });
}
```

##### 6.3 Refresh Token Rotation - Detecting Token Theft

Rotation is a mechanism where every time a refresh token is used to get a new access token, the old refresh token is invalidated and a new one is issued. If an attacker steals a refresh token and uses it before the user, when the real user attempts to use it, the system sees the token is already invalid - immediately indicating a breach and allowing for the revocation of the entire session.

```javascript
// Node.js - Refresh Token Rotation logic
async function refreshTokens(oldRefreshToken) {
  // 1. Find in DB
  const storedToken = await db.refreshTokens.findOne({
    token: hash(oldRefreshToken),
    revoked: false
  });

  if (!storedToken) {
    // Token doesn't exist or is already revoked - possible reuse attack
    // Revoke all sessions for this user
    await db.refreshTokens.updateMany(
      { userId: storedToken?.userId },
      { revoked: true }
    );
    throw new Error('Refresh token reuse detected');
  }

  // 2. Revoke old token
  await db.refreshTokens.updateOne(
    { _id: storedToken._id },
    { revoked: true }
  );

  // 3. Issue new tokens
  const newAccessToken = jwt.sign({ sub: storedToken.userId }, secret, { expiresIn: '15m' });
  const newRefreshToken = crypto.randomBytes(40).toString('hex');

  await db.refreshTokens.create({
    token: hash(newRefreshToken),
    userId: storedToken.userId,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  });
}
```

#### 7\. 6 common JWT security mistakes and how to fix them

1.  **Using weak secrets or hardcoding them** → Fix: Generate using **crypto.randomBytes(32)**, store in environment variables, and never commit to Git. Rotate keys periodically.
2.  **Not whitelisting algorithms** → Fix: Always pass **algorithms: \['RS256'\]** when verifying. Attackers won't be able to switch to alg:none or bypass security using public keys.
3.  **Storing access tokens in localStorage** → Fix: Access token in-memory, refresh token in httpOnly cookie. Accept the UX trade-off for security.
4.  **TTLs that are too long (24h, 7 days) for access tokens** → Fix: Access token 15 minutes, refresh token 7-30 days. Use silent refresh to maintain UX.
5.  **Not validating iss and aud** → Fix: Always set issuer and audience when signing, and verify when decoding. Crucial in multi-service architectures.
6.  **Storing sensitive information in payload** → Fix: Payload should only contain userId, role, exp - no emails, passwords, or PII. The payload is only encoded, not encrypted.

To understand more about how JWT works in technical interviews, see [Common JWT Interview Questions and Standard Answers 2026](/en/session-vs-jwt-phong-van). If you're unsure whether to choose JWT or Session, [Session vs JWT: Full Theory and Interview Questions](/en/session-vs-jwt-toan-bo-ly-thuyet) will help you decide.

#### 8\. FAQ - Frequently Asked Questions about JWT Security

##### 8.1 Does JWT need HTTPS?

Absolutely. JWT is signed, not encrypted - anyone intercepting HTTP traffic can read and steal the token. HTTPS is the minimum requirement for JWT security to be meaningful.

##### 8.2 Should I use JWE instead of JWT?

JWE (JSON Web Encryption) encrypts the payload - suitable if the payload contains sensitive info that must be kept secret from third parties. However, JWE is significantly more complex and has higher CPU overhead. Practical best practice: just don't store sensitive info in the payload.

##### 8.3 Should I use JWT for regular web sessions?

Not necessarily. For traditional web apps (server-side rendered, no immediate need for horizontal scaling), Session + cookies are simpler, offer built-in revocation, and have fewer pitfalls. JWT shines in REST APIs, microservices, and mobile.

##### 8.4 How to rotate secret keys while users are logged in?

Use key versioning: add a **kid** (key ID) claim to the header; the server keeps multiple keys mapped by kid. When rotating, issue new tokens with the new kid - old tokens remain valid until they expire. This allows zero-downtime key rotation.

##### 8.5 Is JWT suitable for real-time apps (WebSockets)?

Yes, but it requires manual handling. WebSockets do not have automatic Authorization headers like HTTP. Common method: send the token in the first message after connection; the server verifies it before processing any further messages.

#### Summary & Next Steps

JWT security is not a one-time checklist - it's a design mindset. Remember the three pillars: choose the right algorithm (RS256 for multi-service), store tokens correctly (httpOnly cookies for refresh), and always have a revocation mechanism. Review your current codebase with this checklist - chances are you'll find at least one point for improvement.

Author: Nguyen Huu Khai

21/04/2026

> See more: 
> 
> *   [Session vs JWT: Full Theory](/en/session-vs-jwt-toan-bo-ly-thuyet)
> *   [Session vs JWT Interview](/en/session-vs-jwt-phong-van)
> *   [Common JWT Interview Questions](/en/cau-hoi-phong-van-jwt-thuong-gap)
> *   [Session vs JWT: Which One Should Developers Choose?](/en/session-vs-jwt-developer-nen-chon-cai-nao)
> *   [JWT Security Best Practices](/en/jwt-security-best-practices)
