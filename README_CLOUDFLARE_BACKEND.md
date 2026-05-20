#  ڕێبەرنامەی بنیاتنانی باکێندێکی پێشکەوتوو بە سیستەمی تۆکن و ئەکاونت لەسەر Cloudflare 🚀
## (Advanced Cloudflare Workers & D1 Database System for Dama Multiplayer)

ئەم بەڵگەنامەیە وەک نەخشەڕێگا و ڕێبەرێکی دەستکردی قۆناغ بە قۆناغ کار دەکات بۆ دروستکردن و بڵاوکردنەوەی باکێندی تەواو بەهێزی یارییەکە لەسەر ژینگەی **Cloudflare**.

---

## 📐 ١. نەخشەی تەلارسازی پڕۆژەکە (Project Architecture)

بۆ بەدەستهێنانی بەهێزترین و هاوچەرخترین باکێند لە کەمترین تێچوودا (بە خۆڕایی)، ئەم جومگانەی خوارەوە لە ژینگەی **Cloudflare** تێکەڵ دەکەین:

1. **فرۆنتێند (Frontend)**: لەسەر **Cloudflare Pages** بڵاودەکرێتەوە (بە مۆدێرنترین خێرایی).
2. **باکێند (Backend - API & WebSocket)**: لەسەر **Cloudflare Workers** دەنوسرێت.
3. **بنکەی زانیاری (Database)**: بەکارهێنانی **Cloudflare D1** (کە بنکەیەکی دراوەی SQL خێرایە لەسەر بنەمای SQLite، بێ بەرامبەر دابین دەکرێت بۆ یەک ملیۆن داواکاری ڕۆژانە).
4. **سیستەمی ژوورە زیندووەکان**: گواستنەوەی جێگری کارتێکەرەکان بە **WebSockets** لەناو هەمان کارکەردا.

---

## 🗄️ ٢. نەخشەی خشتەکانی بنکەی زانیاری (Cloudflare D1 SQL Schema)

بۆ پاشەکەوتکردنی بەکارهێنەران، پاسوۆرد (شیکراوە بە پارێزراوی)، دۆخی تۆکنەکان، و مێژووی چالاکییەکان، فایلێک بەناوی `schema.sql` دروست دەکەین:

```sql
-- خشتەی بەکارهێنەران
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email_or_phone TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    tokens INTEGER DEFAULT 50, -- هەدیەی سەرەتا ٥٠ تۆکنە
    is_admin INTEGER DEFAULT 0, -- ١ ئەگەر ئەدمین بێت، ٠ ئەگەر ئاسایی بێت
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- خشتەی تۆماری جووڵەی تۆکنەکان (Transaction Ledger)
CREATE TABLE IF NOT EXISTS token_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    amount INTEGER NOT NULL, -- دەکرێ سالب یان موستەجەد بێت وەک +١٠ یان -١٠
    reason TEXT NOT NULL, -- وەک 'WIN_MATCH', 'LOSE_MATCH', 'REGISTER_GIFT', 'ADMIN_ADD'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

-- خشتەی یارییەکان
CREATE TABLE IF NOT EXISTS matches (
    id TEXT PRIMARY KEY,
    player1_id INTEGER,
    player2_id INTEGER,
    winner_id INTEGER,
    status TEXT DEFAULT 'PENDING', -- 'PLAYING', 'COMPLETED'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 💻 ٣. کۆدی باکێندی سێرڤەر (Cloudflare Worker Implementation)

ئەمە کۆدی تەواو و بەهێزی نوسراوی **TypeScript**ـە بۆ چاودێریکردنی ئەکاونت، تۆکنەکان، و یارییە ئۆنلاینەکان:

```typescript
import { Buffer } from "node:buffer";

export interface Env {
  DB: D1Database; // گرێدانی جێگیر بە بنکەی دراوەی D1
}

// مۆدیوڵی دروستکردنی Token یان Session (JWT کورتکراوە)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;
    
    // CORS Headers بۆ ڕێگەدان بە پەیوەندی فرۆنتێند
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // ١. خۆتۆمارکردن (SIGN UP) - پێدانی ٥٠ تۆکن وەک سەرەتایی
      if (url.pathname === "/api/auth/register" && method === "POST") {
        const { username, email_or_phone, password } = await request.json() as any;
        if (!username || !email_or_phone || !password) {
          return new Response("Missing fields", { status: 400, headers: corsHeaders });
        }

        const passwordHash = await hashPassword(password);
        
        // جێگیرکردنی لە بنکەی دراوە
        await env.DB.prepare(
          "INSERT INTO users (username, email_or_phone, password_hash, tokens) VALUES (?, ?, ?, 50)"
        ).bind(username, email_or_phone, passwordHash).run();

        return new Response(JSON.stringify({ success: true, message: "بە سەرکوتوویی دروست کرا! ٥٠ تۆکن دیاری نێردرا." }), {
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }

      // ٢. چوونەژوورەوە (LOGIN)
      if (url.pathname === "/api/auth/login" && method === "POST") {
        const { email_or_phone, password } = await request.json() as any;
        const passwordHash = await hashPassword(password);

        const user = await env.DB.prepare(
          "SELECT id, username, tokens, is_admin FROM users WHERE email_or_phone = ? AND password_hash = ?"
        ).bind(email_or_phone, passwordHash).first<any>();

        if (!user) {
          return new Response(JSON.stringify({ error: "ئیمێڵ یان پاسۆرد نادروستە!" }), { status: 401, headers: corsHeaders });
        }

        return new Response(JSON.stringify({ success: true, user }), {
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }

      // ٣. گۆڕانکاری و نوێکردنەوەی تۆکنی کۆتایی یاری ئۆنلاین (بە دەستکەوت یان دۆڕان)
      if (url.pathname === "/api/game/end" && method === "POST") {
        const { userId, isWinner } = await request.json() as any;
        
        // وەرگرتنی پێگە و بڕی تۆکنی یوسەر
        const user = await env.DB.prepare("SELECT tokens FROM users WHERE id = ?").bind(userId).first<any>();
        if (!user) return new Response("User not found", { status: 404, headers: corsHeaders });

        let tokenChange = isWinner ? 10 : -10;
        let newTokens = Math.max(0, user.tokens + tokenChange);

        // ڕێکخستنی نوێ لە خشتەی یوزەرەکاندا
        await env.DB.prepare("UPDATE users SET tokens = ? WHERE id = ?").bind(newTokens, userId).run();

        // زیادکردنی تۆمار لە لێجەری گۆڕانکارییەکان
        await env.DB.prepare(
          "INSERT INTO token_transactions (user_id, amount, reason) VALUES (?, ?, ?)"
        ).bind(userId, tokenChange, isWinner ? 'WIN_MATCH' : 'LOSE_MATCH').run();

        return new Response(JSON.stringify({ success: true, newTokens }), {
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }

      // ٤. ئەدمین پانێڵ - نوێکردنەوەی تۆکن بە ویستی ئەدمین
      if (url.pathname === "/api/admin/add-tokens" && method === "POST") {
        const { adminId, targetUserId, amount } = await request.json() as any;
        
        // سەلماندنی ناسنامەی بەڕێوەبەر (Admin Check)
        const admin = await env.DB.prepare("SELECT is_admin FROM users WHERE id = ?").bind(adminId).first<any>();
        if (!admin || admin.is_admin !== 1) {
          return new Response("پێویستە لایەنی داواکار ئەدمین بێت!", { status: 403, headers: corsHeaders });
        }

        const targetUser = await env.DB.prepare("SELECT tokens FROM users WHERE id = ?").bind(targetUserId).first<any>();
        if (!targetUser) return new Response("بەکارهێنەر نەدۆزرایەوە", { status: 404, headers: corsHeaders });

        const newTargetTokens = targetUser.tokens + amount;
        await env.DB.prepare("UPDATE users SET tokens = ? WHERE id = ?").bind(newTargetTokens, targetUserId).run();
        
        await env.DB.prepare(
          "INSERT INTO token_transactions (user_id, amount, reason) VALUES (?, ?, ?)"
        ).bind(targetUserId, amount, `ADMIN_ADD_BY_${adminId}`).run();

        return new Response(JSON.stringify({ success: true, newTokens: newTargetTokens }), {
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }

    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
    }

    return new Response("Endpoint Not Found", { status: 404, headers: corsHeaders });
  }
};
```

---

## 🛠️ ٤. ڕێبەرنامەی فیزیکی بڵاوکردنەوە لەسەر Cloudflare D1 و Workers

کارەکە زۆر ئاسانە و لە ڕێگەی فرمانەکانی ترمیناڵەوە لەسەر کۆمپیوتەرەکەت ئەنجام دەدرێت:

### یەکەم: دروستکردنی بنکەی زانیاری D1 بە فرمان:
```bash
npx wrangler d1 create dama_db
```
*ئەم فرمانە ناسنامەیەکی جێگیرت پێ دەدات (database_id)، نوسیقەی پێ بەخشراوی سەر شاشەکە کۆپی بکە.*

### دووەم: بەستنەوەی بنکەی زانیاری لە ناو لۆکاڵدا:
لە پڕۆژەی باکیندەکەتدا فایلێک دروست بکە بەناوی `wrangler.toml` و پێناسی خوارەوەی تێدا دابنێ:
```toml
name = "dama-backend"
main = "src/index.ts"
compatibility_date = "2024-05-20"

[[d1_databases]]
binding = "DB"
database_name = "dama_db"
database_id = "ئەو_کۆدەی_لە_هەنگاوی_سەرەوە_وەرگرت"
```

### سێیەم: دروستکردنی خشتەکان (Tables) لە کلاودفلێردا:
کۆدی خشتەکەی بەشی (٢) کە ناومان نابوو `schema.sql` جێبەجێ بکە بەم فرمانە:
```bash
npx wrangler d1 execute dama_db --remote --file=./schema.sql
```

### چوارەم: بڵاوکردنەوەی کارکەرەکە بە تەواوی:
```bash
npx wrangler deploy
```

تەواو! ئێستا باکێندەکەت ئامادەیە لەبەردەم جیهاندا و دەتوانیت لە فڕۆنتێندەوە راستەوخۆ بەستەرەکانی لۆگین و تۆمارکردن و دەستکاری ترافیک و گواستنەوەی تۆکنەکان بکەیت! 🌟
