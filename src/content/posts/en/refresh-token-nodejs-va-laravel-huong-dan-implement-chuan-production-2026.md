---
title: "Refresh Token in Node.js and Laravel: Complete Production Implementation Guide 2026"
author: "Nguyễn Hữu Khải - khaizinam"
pubDatetime: 2026-04-06T19:56:15.000Z
slug: refresh-token-nodejs-va-laravel-huong-dan-implement-chuan-production-2026
lang: en
translationKey: post-219
featured: false
draft: false
tags:
  - "SeriesPhongVan"
description: "A complete guide to implementing Refresh Tokens in both Node.js (Express) and Laravel PHP — covering database design, API endpoints, rotation logic, and common pitfalls — helping developers build a production-ready JWT authentication system in 2026."
---

### Refresh Token Node.js and Laravel: Complete Production-Ready Implementation Guide for Developers 2026

A complete guide to implementing Refresh Tokens in both Node.js (Express) and Laravel PHP — covering database design, API endpoints, rotation logic, and common pitfalls — helping developers build a production-ready JWT authentication system in 2026.

You've got JWT working, the access token runs fine, but every time it expires users get logged out and have to sign in again from scratch? Or you've set a 24-hour TTL to avoid that problem but you know it's a security mistake? The refresh token is the missing piece — but implementing it correctly is more involved than most tutorials suggest. This article goes straight to real working code for both Node.js and Laravel, including rotation logic, database schema, and edge cases that typical tutorials skip entirely.

Table of Contents:

[1\. What Is a Refresh Token and Why Is It Necessary?](#1-what-is-a-refresh-token-and-why-is-it-necessary)

[2\. Before/After: What Changes When You Implement It Correctly](#2-beforeafter-what-changes-when-you-implement-it-correctly)

[3\. Database Schema Design](#3-database-schema-design-for-refresh-tokens)

[4\. Refresh Token Implementation in Node.js (Express)](#4-refresh-token-implementation-in-nodejs-express)

[5\. Refresh Token Implementation in Laravel PHP](#5-refresh-token-implementation-in-laravel-php)

[6\. Refresh Token Rotation — Detecting Token Theft](#6-refresh-token-rotation-detecting-token-theft)

[7\. 6 Common Mistakes When Implementing Refresh Tokens](#7-6-common-mistakes-when-implementing-refresh-tokens)

[8\. FAQ - Frequently Asked Questions](#8-faq-frequently-asked-questions-about-refresh-tokens)

* * *

#### 1\. What Is a Refresh Token and Why Is It Necessary?

##### 1.1 The Core Tension in JWT That Refresh Tokens Solve

JWT access tokens have a fundamental tension: the shorter the TTL, the more secure (smaller attack window), but the more disruptive for users (forced to log in more frequently). A 15-minute TTL is the security best practice — but users would be logged out after 15 minutes of inactivity, which is unacceptable UX.

Refresh tokens solve this tension by splitting into two token types with two distinct purposes:

*   **Access Token**: Short TTL (15-30 minutes), used to authenticate each API request. Stateless, not stored in DB.
*   **Refresh Token**: Long TTL (7-30 days), used only to obtain a new access token when the current one expires. Stored in DB, revocable at any time.

##### 1.2 High-Level Flow Overview

1.  User logs in → server issues access token (15 min) + refresh token (30 days).
2.  Client uses access token for all API requests.
3.  Access token expires → API returns 401.
4.  Client automatically calls **/auth/refresh** with the refresh token.
5.  Server verifies refresh token, issues new access token + new refresh token (rotation).
6.  Client uses new access token, continues working — user notices nothing.

#### 2\. Before/After: What Changes When You Implement It Correctly

##### 2.1 Before Refresh Tokens

A project management app with ~500 internal users used JWT access tokens with an 8-hour TTL (a compromise between security and UX). When a compromised account was discovered, there was no way to revoke the token immediately — it remained valid for up to 8 more hours. Meanwhile, users working late were randomly logged out at 3am in the middle of their work.

##### 2.2 After Implementing Refresh Tokens Correctly

After switching to 15-minute access tokens + 30-day refresh tokens with rotation and DB storage: compromised accounts can be revoked within 15 minutes (access token TTL), and deleting the refresh token from DB blocks any new token issuance. Users are never abruptly logged out during active work. Bonus: reuse attack detection (refresh token used twice) automatically revokes all sessions for that user — proactive breach detection.

#### 3\. Database Schema Design for Refresh Tokens

##### 3.1 Required Fields

Refresh tokens must never be stored as raw values in the DB — they must be hashed first (similar to passwords). Reason: if the DB is dumped, attackers can't use the hash to authenticate.

```sql
-- MySQL / PostgreSQL schema
CREATE TABLE refresh_tokens (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT UNSIGNED NOT NULL,
  token_hash  VARCHAR(64) NOT NULL,        -- SHA-256 hash of raw token
  expires_at  TIMESTAMP NOT NULL,
  revoked     TINYINT(1) NOT NULL DEFAULT 0,
  revoked_at  TIMESTAMP NULL DEFAULT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address  VARCHAR(45) NULL,            -- Optional: audit trail
  user_agent  VARCHAR(255) NULL,           -- Optional: device tracking

  INDEX idx_token_hash (token_hash),
  INDEX idx_user_id (user_id),
  INDEX idx_expires_at (expires_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

##### 3.2 Why Index expires\_at?

A nightly cleanup job needs to delete expired tokens — without an index, it would do a full table scan on a table that can grow to millions of rows. With the index, cleanup runs in milliseconds rather than seconds.

#### 4\. Refresh Token Implementation in Node.js (Express)

##### 4.1 Setup and Helper Functions

```javascript
// npm install jsonwebtoken
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Generate a random raw refresh token
function generateRefreshToken() {
  return crypto.randomBytes(40).toString('hex'); // 80-char hex string
}

// Hash refresh token before storing in DB
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Generate access token
function generateAccessToken(userId, role) {
  return jwt.sign(
    {
      sub: userId,
      role,
      iss: process.env.JWT_ISSUER,
      aud: process.env.JWT_AUDIENCE,
      jti: crypto.randomUUID()
    },
    process.env.JWT_SECRET,
    { algorithm: 'HS256', expiresIn: '15m' }
  );
}
```

##### 4.2 Login Endpoint — Issue Both Tokens

```javascript
// POST /auth/login
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken(user.id, user.role);
    const rawRefreshToken = generateRefreshToken();

    // Store hash, never raw token
    await db.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at, ip_address, user_agent)
       VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY), ?, ?)`,
      [
        user.id,
        hashToken(rawRefreshToken),
        req.ip,
        req.headers['user-agent']?.substring(0, 255)
      ]
    );

    // Refresh token: httpOnly cookie
    res.cookie('refreshToken', rawRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    // Access token: response body (client stores in-memory)
    res.json({ accessToken, expiresIn: 900 });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

##### 4.3 Refresh Endpoint — Issue New Access Token with Rotation

```javascript
// POST /auth/refresh
app.post('/auth/refresh', async (req, res) => {
  const rawRefreshToken = req.cookies?.refreshToken;
  if (!rawRefreshToken) {
    return res.status(401).json({ error: 'Refresh token missing' });
  }

  const tokenHash = hashToken(rawRefreshToken);

  const [rows] = await db.query(
    `SELECT * FROM refresh_tokens
     WHERE token_hash = ? AND revoked = 0 AND expires_at > NOW()
     LIMIT 1`,
    [tokenHash]
  );

  if (rows.length === 0) {
    res.clearCookie('refreshToken');
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }

  const storedToken = rows[0];

  // ROTATION: revoke old, issue new
  await db.query(
    `UPDATE refresh_tokens SET revoked = 1, revoked_at = NOW() WHERE id = ?`,
    [storedToken.id]
  );

  const newRawRefreshToken = generateRefreshToken();
  await db.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at, ip_address, user_agent)
     VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY), ?, ?)`,
    [
      storedToken.user_id,
      hashToken(newRawRefreshToken),
      req.ip,
      req.headers['user-agent']?.substring(0, 255)
    ]
  );

  const [userRows] = await db.query(
    'SELECT id, role FROM users WHERE id = ?',
    [storedToken.user_id]
  );
  const newAccessToken = generateAccessToken(userRows[0].id, userRows[0].role);

  res.cookie('refreshToken', newRawRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000
  });

  res.json({ accessToken: newAccessToken, expiresIn: 900 });
});
```

##### 4.4 Logout Endpoints

```javascript
// POST /auth/logout
app.post('/auth/logout', async (req, res) => {
  const rawRefreshToken = req.cookies?.refreshToken;
  if (rawRefreshToken) {
    await db.query(
      `UPDATE refresh_tokens SET revoked = 1, revoked_at = NOW()
       WHERE token_hash = ?`,
      [hashToken(rawRefreshToken)]
    );
  }
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
});

// POST /auth/logout-all
app.post('/auth/logout-all', requireAuth, async (req, res) => {
  await db.query(
    `UPDATE refresh_tokens SET revoked = 1, revoked_at = NOW()
     WHERE user_id = ? AND revoked = 0`,
    [req.user.sub]
  );
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out from all devices' });
});
```

#### 5\. Refresh Token Implementation in Laravel PHP

##### 5.1 Migration and Model

```php
// database/migrations/create_refresh_tokens_table.php
Schema::create('refresh_tokens', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->string('token_hash', 64);
    $table->timestamp('expires_at');
    $table->boolean('revoked')->default(false);
    $table->timestamp('revoked_at')->nullable();
    $table->string('ip_address', 45)->nullable();
    $table->string('user_agent', 255)->nullable();
    $table->timestamp('created_at')->useCurrent();

    $table->index('token_hash');
    $table->index('user_id');
    $table->index('expires_at');
});

// app/Models/RefreshToken.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RefreshToken extends Model
{
    public $timestamps = false;
    protected $fillable = [
        'user_id', 'token_hash', 'expires_at', 'ip_address', 'user_agent'
    ];
    protected $casts = [
        'expires_at' => 'datetime',
        'revoked_at' => 'datetime',
        'revoked'    => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
```

##### 5.2 AuthService — Centralized Logic

```php
// app/Services/AuthService.php
namespace App\Services;

use App\Models\RefreshToken;
use App\Models\User;
use Firebase\JWT\JWT;
use Illuminate\Support\Str;

class AuthService
{
    public function generateAccessToken(User $user): string
    {
        $payload = [
            'sub' => $user->id,
            'role' => $user->role,
            'iss' => config('app.url'),
            'aud' => config('jwt.audience'),
            'iat' => time(),
            'exp' => time() + 900,
            'jti' => (string) Str::uuid(),
        ];
        return JWT::encode($payload, config('jwt.secret'), 'HS256');
    }

    public function issueRefreshToken(User $user, string $ip, string $ua): string
    {
        $raw = bin2hex(random_bytes(40));
        RefreshToken::create([
            'user_id'    => $user->id,
            'token_hash' => hash('sha256', $raw),
            'expires_at' => now()->addDays(30),
            'ip_address' => $ip,
            'user_agent' => substr($ua, 0, 255),
        ]);
        return $raw;
    }

    public function rotateRefreshToken(string $raw, string $ip, string $ua): array
    {
        $stored = RefreshToken::where('token_hash', hash('sha256', $raw))
            ->where('revoked', false)
            ->where('expires_at', '>', now())
            ->firstOrFail();

        // Detect reuse on already-revoked token
        if ($stored->revoked) {
            RefreshToken::where('user_id', $stored->user_id)
                ->update(['revoked' => true, 'revoked_at' => now()]);
            throw new \Exception('Reuse detected');
        }

        $stored->update(['revoked' => true, 'revoked_at' => now()]);
        $user = $stored->user;

        return [
            'accessToken'  => $this->generateAccessToken($user),
            'refreshToken' => $this->issueRefreshToken($user, $ip, $ua),
            'expiresIn'    => 900,
        ];
    }

    public function revokeAllTokens(int $userId): void
    {
        RefreshToken::where('user_id', $userId)
            ->where('revoked', false)
            ->update(['revoked' => true, 'revoked_at' => now()]);
    }
}
```

##### 5.3 AuthController

```php
// app/Http/Controllers/AuthController.php
namespace App\Http\Controllers;

use App\Models\User;
use App\Services\AuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function __construct(private AuthService $auth) {}

    public function login(Request $request)
    {
        $request->validate(['email' => 'required|email', 'password' => 'required']);
        $user = User::where('email', $request->email)->firstOrFail();

        if (!Hash::check($request->password, $user->password)) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        }

        $accessToken  = $this->auth->generateAccessToken($user);
        $refreshToken = $this->auth->issueRefreshToken(
            $user, $request->ip(), $request->userAgent() ?? ''
        );

        return response()
            ->json(['accessToken' => $accessToken, 'expiresIn' => 900])
            ->cookie('refreshToken', $refreshToken, 60*24*30, '/', null, true, true, false, 'strict');
    }

    public function refresh(Request $request)
    {
        $raw = $request->cookie('refreshToken');
        if (!$raw) return response()->json(['error' => 'Missing token'], 401);

        try {
            $tokens = $this->auth->rotateRefreshToken(
                $raw, $request->ip(), $request->userAgent() ?? ''
            );
        } catch (\Exception) {
            return response()->json(['error' => 'Invalid or expired token'], 401)
                ->withoutCookie('refreshToken');
        }

        return response()
            ->json(['accessToken' => $tokens['accessToken'], 'expiresIn' => 900])
            ->cookie('refreshToken', $tokens['refreshToken'], 60*24*30, '/', null, true, true, false, 'strict');
    }

    public function logout(Request $request)
    {
        $raw = $request->cookie('refreshToken');
        if ($raw) {
            \App\Models\RefreshToken::where('token_hash', hash('sha256', $raw))
                ->update(['revoked' => true, 'revoked_at' => now()]);
        }
        return response()->json(['message' => 'Logged out'])->withoutCookie('refreshToken');
    }

    public function logoutAll(Request $request)
    {
        $this->auth->revokeAllTokens($request->user()->id);
        return response()->json(['message' => 'Logged out from all devices'])->withoutCookie('refreshToken');
    }
}
```

#### 6\. Refresh Token Rotation — Detecting Token Theft

##### 6.1 Why Rotation Matters More Than Most Developers Realize

Rotation isn't just a best practice — it's an active breach detection mechanism. Scenario: an attacker steals user A's refresh token. Both the attacker and user A now hold the same refresh token. Whoever uses it first gets a new token; the old one is revoked. The second person to try using it sees "Invalid refresh token" — this is the signal that a breach has occurred.

##### 6.2 Implementing Reuse Detection — Revoke All Sessions on Reuse

```javascript
// Node.js — Upgrade refresh endpoint with full reuse detection
app.post('/auth/refresh', async (req, res) => {
  const rawRefreshToken = req.cookies?.refreshToken;
  if (!rawRefreshToken) {
    return res.status(401).json({ error: 'Refresh token missing' });
  }

  const tokenHash = hashToken(rawRefreshToken);

  // Fetch token regardless of revoke status
  const [rows] = await db.query(
    'SELECT * FROM refresh_tokens WHERE token_hash = ? LIMIT 1',
    [tokenHash]
  );

  if (rows.length === 0) {
    res.clearCookie('refreshToken');
    return res.status(401).json({ error: 'Token not found' });
  }

  const storedToken = rows[0];

  // Reuse detected: token exists but already revoked
  if (storedToken.revoked) {
    // Possible attack in progress — revoke all sessions for this user
    await db.query(
      `UPDATE refresh_tokens SET revoked = 1, revoked_at = NOW()
       WHERE user_id = ? AND revoked = 0`,
      [storedToken.user_id]
    );
    res.clearCookie('refreshToken');
    return res.status(401).json({ error: 'Security alert: session terminated' });
  }

  if (new Date(storedToken.expires_at) <= new Date()) {
    res.clearCookie('refreshToken');
    return res.status(401).json({ error: 'Refresh token expired' });
  }

  // Valid token — proceed with rotation
  // ... (rotation code from section 4.3)
});
```

#### 7\. 6 Common Mistakes When Implementing Refresh Tokens

1.  **Storing the raw refresh token in the DB** → Fix: always store a SHA-256 hash. If the DB is dumped, attackers get the hash but can't authenticate because the server compares hash(rawToken) against the stored value.
2.  **Not implementing rotation — reusing the same refresh token forever** → Fix: every refresh must issue a new token and revoke the old one. Without rotation, there is no way to detect token theft.
3.  **Storing refresh tokens in localStorage instead of httpOnly cookies** → Fix: refresh tokens are even more sensitive than access tokens because of their longer TTL. They must be in httpOnly cookies. Full details in [JWT Security Best Practices](/en/jwt-security-best-practices-how-to-secure-json-web-tokens-in-production-2026).
4.  **Not cleaning up old tokens — letting the refresh\_tokens table grow unbounded** → Fix: run a nightly cron job to delete revoked or expired tokens older than 7 days. A bloated table hurts query performance.
5.  **Returning the refresh token in the response body instead of a cookie** → Fix: refresh token in httpOnly cookie, access token in body. Many tutorials return both in the body — this is a serious security mistake.
6.  **No logout-all endpoint — no way to revoke access when an account is compromised** → Fix: always provide a **/auth/logout-all** endpoint that revokes all refresh tokens by user\_id. This is a mandatory feature for any production system.

For the full JWT security picture, read [JWT Security Best Practices 2026](/en/jwt-security-best-practices-how-to-secure-json-web-tokens-in-production-2026). If you're still deciding between Session and JWT for your project, [Session vs JWT: Which Should Developers Choose?](/en/session-vs-jwt-which-should-developers-choose-a-practical-comparison-for-2026) will help you make a definitive decision.

#### 8\. FAQ - Frequently Asked Questions About Refresh Tokens

##### 8.1 How long should the refresh token TTL be?

It depends on the use case. Consumer apps (social, e-commerce): 30-90 days — users don't want to log in frequently. Sensitive apps (banking, fintech, admin tools): 1-7 days — balance between UX and security. Some systems implement "sliding expiry" — each time the refresh token is used, the TTL is extended, and it only truly expires after X consecutive days of inactivity.

##### 8.2 Does the refresh token need to be in JWT format?

No, and it actually shouldn't be. A refresh token only needs to be an unpredictable random string — **crypto.randomBytes(40).toString('hex')** is sufficient. Using JWT for refresh tokens adds unnecessary complexity, and the payload can be decoded even if it can't be forged. Opaque token (random string) + DB lookup is the standard pattern.

##### 8.3 How should the client handle 401s from an expired access token?

Implement an axios interceptor or fetch wrapper: when a 401 is received, automatically call **/auth/refresh**, get a new access token, then retry the original request. The user notices nothing. Important: handle the race condition — if multiple requests simultaneously receive a 401, only one should call refresh; the rest queue and wait. Avoid triggering N parallel refresh calls.

##### 8.4 Does the access token need to be stored in the DB?

No, and it shouldn't be — that's the whole point of JWT being stateless. Access tokens have a short TTL (15 minutes) and can be verified by signature alone. If you need to revoke an access token immediately before it expires (e.g., breach detected), use a jti blacklist in Redis with TTL equal to the token's remaining lifetime. Full details in [JWT Security Best Practices](/en/jwt-security-best-practices-how-to-secure-json-web-tokens-in-production-2026).

##### 8.5 Do refresh tokens work with React Native?

Yes, but storage is different from a browser. React Native doesn't have httpOnly cookies — store the refresh token in **react-native-keychain** (iOS Keychain / Android Keystore). This is the mobile-equivalent of httpOnly cookie security. Never use AsyncStorage or MMKV for refresh tokens — neither is encrypted and both are readable if the device is rooted.

#### Summary & Next Steps

Implementing refresh tokens correctly isn't complicated, but it requires discipline: hash before storing in DB, rotate on every use, httpOnly cookie for storage, reuse detection to catch breaches, and a cleanup job to keep the table lean. The code in this article is designed to be copied into a production project with minimal adjustments — both Node.js and Laravel have complete flows covering login through logout-all. Next step: implement silent refresh on the client side so access tokens are automatically renewed without the user noticing — that's the final piece of a truly production-ready JWT auth system.
