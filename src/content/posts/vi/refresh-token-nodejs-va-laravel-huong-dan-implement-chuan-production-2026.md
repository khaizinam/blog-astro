---
title: "Refresh Token Node.js và Laravel: Hướng Dẫn Implement Chuẩn Production 2026"
author: "Nguyễn Hữu Khải - khaizinam"
pubDatetime: 2026-04-06T19:56:15.000Z
slug: refresh-token-nodejs-va-laravel-huong-dan-implement-chuan-production-2026
lang: vi
translationKey: post-219
featured: false
draft: false
tags:
  - "SeriesPhongVan"
description: "Hướng dẫn implement Refresh Token hoàn chỉnh cho cả Node.js (Express) và Laravel PHP — từ thiết kế database, viết API endpoint, xử lý rotation, đến các lỗi thường gặp — giúp developer xây hệ thống JWT authentication chuẩn production trong năm 2026."
---

### Refresh Token Node.js và Laravel: Hướng dẫn implement đầy đủ, chuẩn production cho developer 2026

Hướng dẫn implement Refresh Token hoàn chỉnh cho cả Node.js (Express) và Laravel PHP — từ thiết kế database, viết API endpoint, xử lý rotation, đến các lỗi thường gặp — giúp developer xây hệ thống JWT authentication chuẩn production trong năm 2026.

Bạn đã implement JWT được rồi, access token chạy ổn, nhưng mỗi lần token hết hạn user lại bị đăng xuất và phải login lại từ đầu? Hoặc bạn đặt access token TTL 24 giờ để tránh vấn đề này nhưng biết rõ như vậy là sai về bảo mật? Refresh token chính là mảnh ghép còn thiếu — nhưng implement đúng không đơn giản như nhiều tutorial trên mạng mô tả. Bài viết này đi thẳng vào code thực tế cho cả Node.js lẫn Laravel, bao gồm rotation logic, database schema, và xử lý edge case mà tutorial thông thường bỏ qua.

Nội dung bài viết:

[1\. Refresh Token là gì và tại sao cần thiết?](#1-refresh-token-la-gi-va-tai-sao-can-thiet)

[2\. Before/After khi implement đúng Refresh Token](#2-beforeafter-khi-implement-dung-refresh-token)

[3\. Thiết kế Database Schema](#3-thiet-ke-database-schema-cho-refresh-token)

[4\. Implement Refresh Token trong Node.js (Express)](#4-implement-refresh-token-trong-nodejs-express)

[5\. Implement Refresh Token trong Laravel PHP](#5-implement-refresh-token-trong-laravel-php)

[6\. Refresh Token Rotation — Phát hiện token theft](#6-refresh-token-rotation-phat-hien-token-theft)

[7\. 6 sai lầm phổ biến khi implement Refresh Token](#7-6-sai-lam-pho-bien-khi-implement-refresh-token)

[8\. FAQ - Câu hỏi thường gặp](#8-faq-cau-hoi-thuong-gap-ve-refresh-token)

* * *

#### 1\. Refresh Token là gì và tại sao cần thiết?

##### 1.1 Bản chất vấn đề JWT cần giải quyết

JWT access token có một tension cơ bản: token càng ngắn hạn thì càng an toàn (cửa sổ tấn công nhỏ hơn), nhưng càng gây khó chịu cho user (phải login lại thường xuyên hơn). Đặt TTL 15 phút là best practice về bảo mật — nhưng user sẽ bị đăng xuất sau 15 phút không hoạt động, không thể chấp nhận được về UX.

Refresh token giải quyết tension này bằng cách tách thành hai loại token với hai mục đích khác nhau:

*   **Access Token**: TTL ngắn (15–30 phút), dùng để xác thực từng API request. Stateless, không lưu DB.
*   **Refresh Token**: TTL dài (7–30 ngày), chỉ dùng để lấy access token mới khi hết hạn. Lưu trong DB, có thể revoke bất kỳ lúc nào.

##### 1.2 Flow hoạt động tổng quan

1.  User đăng nhập → server cấp access token (15 phút) + refresh token (30 ngày).
2.  Client dùng access token cho mọi API request.
3.  Access token hết hạn → API trả về 401.
4.  Client tự động gọi endpoint **/auth/refresh** kèm refresh token.
5.  Server verify refresh token, cấp access token mới + refresh token mới (rotation).
6.  Client dùng access token mới, tiếp tục hoạt động — user không hay biết gì.

#### 2\. Before/After khi implement đúng Refresh Token

##### 2.1 Trước khi có Refresh Token

Một ứng dụng quản lý dự án với ~500 user nội bộ dùng JWT access token TTL 8 giờ (thỏa hiệp giữa bảo mật và UX). Khi phát hiện một tài khoản bị lộ credentials, admin không có cách nào revoke token ngay — token vẫn hợp lệ trong tối đa 8 giờ tiếp theo. Đồng thời, user làm việc qua đêm bị đăng xuất lúc 3 giờ sáng khi đang dở việc.

##### 2.2 Sau khi implement đúng Refresh Token

Sau khi chuyển sang access token 15 phút + refresh token 30 ngày có rotation và lưu DB: tài khoản bị compromise được revoke trong vòng 15 phút (TTL access token), xóa refresh token trong DB ngăn cấp token mới. User không bao giờ bị đăng xuất đột ngột trong lúc làm việc. Bonus: khi phát hiện reuse attack (refresh token bị dùng hai lần), toàn bộ session của user đó tự động bị revoke — phát hiện breach chủ động.

#### 3\. Thiết kế Database Schema cho Refresh Token

##### 3.1 Những trường bắt buộc cần có

Refresh token không được lưu raw value trong DB — phải hash trước (tương tự password). Lý do: nếu DB bị dump, attacker không thể dùng hash để authenticate.

```sql
-- MySQL / PostgreSQL schema
CREATE TABLE refresh_tokens (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT UNSIGNED NOT NULL,
  token_hash  VARCHAR(64) NOT NULL,        -- SHA-256 hash của raw token
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

##### 3.2 Tại sao cần index expires\_at?

Cần chạy cleanup job định kỳ để xóa token hết hạn — không index thì full table scan trên bảng có thể lên đến hàng triệu record. Với index, cleanup chạy trong milliseconds thay vì vài giây.

#### 4\. Implement Refresh Token trong Node.js (Express)

##### 4.1 Cài đặt và helper functions

```javascript
// npm install jsonwebtoken crypto-js
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Helper: tạo raw refresh token ngẫu nhiên
function generateRefreshToken() {
  return crypto.randomBytes(40).toString('hex'); // 80 ký tự hex
}

// Helper: hash refresh token trước khi lưu DB
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Helper: tạo access token
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

##### 4.2 Login endpoint — cấp cả hai token

```javascript
// POST /auth/login
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Tạo tokens
    const accessToken = generateAccessToken(user.id, user.role);
    const rawRefreshToken = generateRefreshToken();

    // Lưu refresh token vào DB (lưu hash, không lưu raw)
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
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 ngày
    });

    // Access token: response body (client lưu in-memory)
    res.json({
      accessToken,
      expiresIn: 900 // 15 phút tính bằng giây
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

##### 4.3 Refresh endpoint — cấp access token mới kèm rotation

```javascript
// POST /auth/refresh
app.post('/auth/refresh', async (req, res) => {
  const rawRefreshToken = req.cookies?.refreshToken;

  if (!rawRefreshToken) {
    return res.status(401).json({ error: 'Refresh token missing' });
  }

  const tokenHash = hashToken(rawRefreshToken);

  // Tìm token trong DB
  const [rows] = await db.query(
    `SELECT * FROM refresh_tokens
     WHERE token_hash = ? AND revoked = 0 AND expires_at > NOW()
     LIMIT 1`,
    [tokenHash]
  );

  if (rows.length === 0) {
    // Token không tồn tại, đã revoke, hoặc hết hạn
    // Xóa cookie dù sao
    res.clearCookie('refreshToken');
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }

  const storedToken = rows[0];

  // --- ROTATION: Revoke token cũ, cấp token mới ---
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

  // Lấy thông tin user để đưa vào access token mới
  const [userRows] = await db.query(
    'SELECT id, role FROM users WHERE id = ?',
    [storedToken.user_id]
  );
  const user = userRows[0];

  const newAccessToken = generateAccessToken(user.id, user.role);

  // Set cookie mới
  res.cookie('refreshToken', newRawRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000
  });

  res.json({
    accessToken: newAccessToken,
    expiresIn: 900
  });
});
```

##### 4.4 Logout endpoint — revoke refresh token

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

// POST /auth/logout-all — đăng xuất khỏi tất cả thiết bị
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

#### 5\. Implement Refresh Token trong Laravel PHP

##### 5.1 Migration và Model

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
        'user_id', 'token_hash', 'expires_at',
        'ip_address', 'user_agent'
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

    public function isValid(): bool
    {
        return !$this->revoked && $this->expires_at->isFuture();
    }
}
```

##### 5.2 AuthService — Logic tập trung

```php
// app/Services/AuthService.php
namespace App\Services;

use App\Models\RefreshToken;
use App\Models\User;
use Firebase\JWT\JWT;
use Illuminate\Support\Str;

class AuthService
{
    private string $secret;
    private string $issuer;

    public function __construct()
    {
        $this->secret = config('jwt.secret');
        $this->issuer = config('app.url');
    }

    public function generateAccessToken(User $user): string
    {
        $payload = [
            'sub' => $user->id,
            'role' => $user->role,
            'iss' => $this->issuer,
            'aud' => config('jwt.audience'),
            'iat' => time(),
            'exp' => time() + 900, // 15 menit
            'jti' => (string) Str::uuid(),
        ];

        return JWT::encode($payload, $this->secret, 'HS256');
    }

    public function issueRefreshToken(User $user, string $ip, string $userAgent): string
    {
        $rawToken = bin2hex(random_bytes(40));

        RefreshToken::create([
            'user_id'    => $user->id,
            'token_hash' => hash('sha256', $rawToken),
            'expires_at' => now()->addDays(30),
            'ip_address' => $ip,
            'user_agent' => substr($userAgent, 0, 255),
        ]);

        return $rawToken;
    }

    public function rotateRefreshToken(string $rawToken, string $ip, string $userAgent): array
    {
        $tokenHash = hash('sha256', $rawToken);

        $stored = RefreshToken::where('token_hash', $tokenHash)
            ->where('revoked', false)
            ->where('expires_at', '>', now())
            ->first();

        if (!$stored) {
            throw new \Exception('Invalid or expired refresh token');
        }

        // Revoke token cũ
        $stored->update([
            'revoked'    => true,
            'revoked_at' => now(),
        ]);

        $user = $stored->user;

        // Cấp token mới
        $newRawToken    = $this->issueRefreshToken($user, $ip, $userAgent);
        $newAccessToken = $this->generateAccessToken($user);

        return [
            'accessToken'  => $newAccessToken,
            'refreshToken' => $newRawToken,
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

##### 5.3 AuthController — API endpoints

```php
// app/Http/Controllers/AuthController.php
namespace App\Http\Controllers;

use App\Models\User;
use App\Services\AuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function __construct(private AuthService $authService) {}

    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        }

        $accessToken  = $this->authService->generateAccessToken($user);
        $refreshToken = $this->authService->issueRefreshToken(
            $user,
            $request->ip(),
            $request->userAgent() ?? ''
        );

        return response()
            ->json(['accessToken' => $accessToken, 'expiresIn' => 900])
            ->cookie(
                'refreshToken', $refreshToken,
                60 * 24 * 30,   // 30 ngày (phút)
                '/',
                null,
                true,           // secure
                true,           // httpOnly
                false,
                'strict'        // sameSite
            );
    }

    public function refresh(Request $request)
    {
        $rawToken = $request->cookie('refreshToken');

        if (!$rawToken) {
            return response()->json(['error' => 'Refresh token missing'], 401);
        }

        try {
            $tokens = $this->authService->rotateRefreshToken(
                $rawToken,
                $request->ip(),
                $request->userAgent() ?? ''
            );
        } catch (\Exception $e) {
            return response()
                ->json(['error' => 'Invalid or expired refresh token'], 401)
                ->withoutCookie('refreshToken');
        }

        return response()
            ->json([
                'accessToken' => $tokens['accessToken'],
                'expiresIn'   => $tokens['expiresIn'],
            ])
            ->cookie(
                'refreshToken', $tokens['refreshToken'],
                60 * 24 * 30, '/', null, true, true, false, 'strict'
            );
    }

    public function logout(Request $request)
    {
        $rawToken = $request->cookie('refreshToken');

        if ($rawToken) {
            \App\Models\RefreshToken::where('token_hash', hash('sha256', $rawToken))
                ->update(['revoked' => true, 'revoked_at' => now()]);
        }

        return response()
            ->json(['message' => 'Logged out'])
            ->withoutCookie('refreshToken');
    }

    public function logoutAll(Request $request)
    {
        $this->authService->revokeAllTokens($request->user()->id);

        return response()
            ->json(['message' => 'Logged out from all devices'])
            ->withoutCookie('refreshToken');
    }
}
```

#### 6\. Refresh Token Rotation — Phát hiện Token Theft

##### 6.1 Tại sao Rotation quan trọng hơn nhiều người nghĩ

Rotation không chỉ là "best practice" — nó là cơ chế phát hiện tấn công chủ động. Kịch bản: attacker đánh cắp refresh token của user A. Cả attacker và user A đều có cùng refresh token. Ai dùng trước sẽ nhận được token mới; token cũ bị revoke. Người dùng sau sẽ thấy "Invalid refresh token" — đây chính là tín hiệu có breach.

##### 6.2 Implement Reuse Detection — Revoke toàn bộ session khi phát hiện tái sử dụng

```javascript
// Node.js — Nâng cấp refresh endpoint với reuse detection
app.post('/auth/refresh', async (req, res) => {
  const rawRefreshToken = req.cookies?.refreshToken;
  if (!rawRefreshToken) {
    return res.status(401).json({ error: 'Refresh token missing' });
  }

  const tokenHash = hashToken(rawRefreshToken);

  // Tìm token — kể cả đã revoke
  const [rows] = await db.query(
    'SELECT * FROM refresh_tokens WHERE token_hash = ? LIMIT 1',
    [tokenHash]
  );

  if (rows.length === 0) {
    res.clearCookie('refreshToken');
    return res.status(401).json({ error: 'Token not found' });
  }

  const storedToken = rows[0];

  // Phát hiện reuse: token tồn tại nhưng đã bị revoke
  if (storedToken.revoked) {
    // CẢNH BÁO: Có thể đang bị tấn công — revoke toàn bộ session
    await db.query(
      `UPDATE refresh_tokens SET revoked = 1, revoked_at = NOW()
       WHERE user_id = ? AND revoked = 0`,
      [storedToken.user_id]
    );
    res.clearCookie('refreshToken');
    // Optional: gửi email cảnh báo bảo mật cho user
    return res.status(401).json({ error: 'Security alert: session terminated' });
  }

  // Token hết hạn
  if (new Date(storedToken.expires_at) <= new Date()) {
    res.clearCookie('refreshToken');
    return res.status(401).json({ error: 'Refresh token expired' });
  }

  // Token hợp lệ — tiến hành rotation bình thường
  // ... (code rotation như phần 4.3)
});
```

#### 7\. 6 sai lầm phổ biến khi implement Refresh Token

1.  **Lưu raw refresh token trong DB** → Fix: luôn lưu SHA-256 hash. Nếu DB bị dump, attacker có hash nhưng không thể dùng để authenticate vì server so sánh hash(rawToken) với giá trị lưu trong DB.
2.  **Không implement rotation — dùng một refresh token mãi mãi** → Fix: mỗi lần refresh phải cấp token mới và revoke token cũ. Không có rotation đồng nghĩa với không có khả năng phát hiện token theft.
3.  **Lưu refresh token trong localStorage thay vì httpOnly cookie** → Fix: refresh token còn quan trọng hơn access token về mặt bảo mật — TTL dài hơn nhiều. Bắt buộc lưu httpOnly cookie. Xem thêm tại bài [JWT Security Best Practices](/jwt-security-best-practices-bao-mat-jwt-dung-cach-trong-du-an-thuc-te-2026).
4.  **Không xóa token cũ sau rotation — để bảng refresh\_tokens phình to vô hạn** → Fix: đặt cronjob chạy mỗi đêm xóa token đã revoke hoặc hết hạn quá 7 ngày. Bảng lớn ảnh hưởng hiệu năng query.
5.  **Trả refresh token trong response body thay vì cookie** → Fix: refresh token trong httpOnly cookie, access token trong body. Nhiều tutorial trả cả hai trong body — sai hoàn toàn về bảo mật.
6.  **Không implement logout-all — không có cách revoke khi tài khoản bị xâm phạm** → Fix: luôn có endpoint **/auth/logout-all** revoke tất cả refresh token theo user\_id. Đây là tính năng bắt buộc cho production.

Để hiểu đầy đủ bức tranh bảo mật JWT, đọc thêm bài [JWT Security Best Practices 2026](/jwt-security-best-practices-bao-mat-jwt-dung-cach-trong-du-an-thuc-te-2026). Nếu bạn còn phân vân giữa Session và JWT cho dự án của mình, bài [Session vs JWT: Developer nên chọn cái nào?](/session-vs-jwt-developer-nen-chon-cai-nao-so-sanh-thuc-te-2026) sẽ giúp bạn quyết định dứt khoát.

#### 8\. FAQ - Câu hỏi thường gặp về Refresh Token

##### 8.1 Nên đặt TTL refresh token bao lâu là hợp lý?

Phụ thuộc vào use case. Ứng dụng consumer (social app, e-commerce): 30–90 ngày — user không muốn login lại thường xuyên. Ứng dụng nhạy cảm (banking, fintech, admin tool): 1–7 ngày — cân bằng giữa UX và bảo mật. Một số hệ thống còn implement "sliding expiry" — mỗi lần dùng refresh token, TTL được gia hạn thêm, chỉ thực sự hết hạn khi user không dùng trong X ngày liên tiếp.

##### 8.2 Refresh token có cần JWT format không?

Không, và thực ra không nên. Refresh token chỉ cần là một chuỗi ngẫu nhiên không thể đoán được — **crypto.randomBytes(40).toString('hex')** là đủ. Dùng JWT cho refresh token thêm complexity không cần thiết và payload có thể bị decode dù không forge được. Opaque token (chuỗi ngẫu nhiên) + DB lookup là pattern chuẩn.

##### 8.3 Client nên xử lý 401 từ access token hết hạn như thế nào?

Implement axios interceptor hoặc fetch wrapper: khi nhận 401, tự động gọi **/auth/refresh**, lấy access token mới, rồi retry request gốc với token mới. User không thấy gì. Chú ý xử lý race condition: nếu nhiều request đồng thời nhận 401, chỉ một request được phép gọi refresh — các request còn lại queue và chờ. Tránh gọi refresh N lần song song.

##### 8.4 Có cần lưu access token vào DB không?

Không cần và không nên — đây là điểm mạnh của JWT stateless. Access token TTL ngắn (15 phút), verify bằng signature là đủ. Nếu cần revoke access token ngay lập tức trước khi hết hạn (ví dụ: phát hiện breach), dùng jti blacklist trong Redis với TTL = thời gian còn lại của token. Xem chi tiết tại bài [JWT Security Best Practices](/jwt-security-best-practices).

##### 8.5 Refresh token có hoạt động với React Native không?

Có, nhưng storage khác browser. Không có httpOnly cookie trong React Native — lưu refresh token trong **react-native-keychain** (iOS Keychain / Android Keystore). Đây là Secure Storage tương đương với httpOnly cookie về mặt bảo mật trên mobile. Tuyệt đối không dùng AsyncStorage hay MMKV cho refresh token — hai cái này không được mã hóa và dễ bị đọc nếu thiết bị bị root.

#### Tổng kết và bước tiếp theo

Implement refresh token đúng cách không khó nhưng cần kỷ luật: hash trước khi lưu DB, rotation mỗi lần dùng, httpOnly cookie cho storage, reuse detection để phát hiện breach, và cleanup job để giữ bảng gọn. Code trong bài này đã được thiết kế để copy vào dự án production với điều chỉnh tối thiểu — cả Node.js lẫn Laravel đều có đủ flow hoàn chỉnh từ login đến logout-all. Bước tiếp theo: implement silent refresh phía client để access token tự động được gia hạn mà user không hay biết — đó là phần hoàn thiện cuối cùng của một JWT auth system production-ready.
