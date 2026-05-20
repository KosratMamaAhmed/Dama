-- خشتەی سەرەکی بەکارهێنەران
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email_or_phone TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    tokens INTEGER DEFAULT 50, -- هەدیەی سەرەتا ٥٠ تۆکنە
    is_admin INTEGER DEFAULT 0, -- ١ بۆ ئەدمین
    banned_until INTEGER DEFAULT 0, -- کاتی کۆتایی هاتنی باند (timestamp)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);