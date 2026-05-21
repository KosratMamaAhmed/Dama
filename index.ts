/**
 * INDEX_BACKEND.TS
 * 
 * ده‌توانیت ئه‌م كۆده‌ ڕاسته‌وخۆ كۆپی بكه‌یت بۆ ناو فایلی `src/index.ts` له‌ پڕۆژه‌ی باکێندی Cloudflare Workers.
 * ئه‌م باکێنده‌ زۆر خێرا كارده‌كات و به‌ستراوه‌ته‌وه‌ به‌:
 * - Cloudflare D1 Database (بۆ ئه‌كاونت، لۆگین، خشتەی یوزه‌ران و تۆکنه‌کان)
 * - Cloudflare Workers KV (بۆ چاودێری مه‌ڵتیپڵه‌یه‌ر و نامه‌كان و ڕێکخستنی ژووره‌كانی یاری له‌ هه‌موو جیهان بێ خاوبوونه‌وه‌)
 */

import { Router } from 'itty-router';

const router = Router();

// یاریدەدەر بۆ جێگیرکردنی سەردێڕەکانی CORS بە تەواوی بۆ ڕێگری لە بلۆککردن لە برۆوسەردا
function corsResponse(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// وەڵامدانەوەی داواکارییەکانی OPTIONS پێش ناردن (CORS Preflight)
router.options('*', () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
});

// مۆدیوڵی ساده‌ بۆ هاژكردنی مه‌ترسیداری پاسۆرد بە SHA-256 بەسەرکەوتوویی
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// ١. خۆتۆمارکردن (SIGN UP) - پێدانی ٥٠ تۆکن وەک خەڵاتی سەرەتا
router.post('/api/register', async (request, env) => {
  try {
    const { username, email_or_phone, password } = await request.json();
    
    if (!username || !email_or_phone || !password) {
      return corsResponse({ error: 'تکایە هەموو کێڵگەکان پڕبکەرەوە!' }, 400);
    }

    const passwordHash = await hashPassword(password);
    
    // دروستکردنی ناسنامەی تایبەت بۆ بەکارهێنەر بە فۆرماتی DAMA-XXXXXX
    const generatedId = `DAMA-${Math.floor(100000 + Math.random() * 900000)}`;

    // یەکەمجار پێش تۆمارکردن، بزانە ناوەکە یان ئیمێڵ/تەلەفۆنەکە پێشتر بەکارهاتووە یان نا
    const checkUser = await env.DB.prepare(
      'SELECT id FROM users WHERE username = ?1 OR email_or_phone = ?2'
    ).bind(username, email_or_phone).first();

    if (checkUser) {
      return corsResponse({ error: 'ئەم ناوە یان ژمارە/ئیمێڵە پێشتر تۆمارکراوە!' }, 400);
    }

    // پاشەکەوتکردن لە بنکەی زانیاری D1 بە ٥٠ تۆکنی سەرەتایی
    await env.DB.prepare(
      'INSERT INTO users (id, username, email_or_phone, password_hash, tokens, is_admin) VALUES (?1, ?2, ?3, ?4, 50, 0)'
    ).bind(generatedId, username, email_or_phone, passwordHash).run();

    // جێگیرکردنی تۆمار لە گۆڕانکارییەکانی تۆکن
    await env.DB.prepare(
      'INSERT INTO token_transactions (user_id, amount, reason) VALUES (?1, 50, "REGISTER_GIFT")'
    ).bind(generatedId, 50).run();

    return corsResponse({
      success: true,
      message: 'ئەکاونتەکەت بە سەرکەوتوویی دروستکرا! 🎉 پێنجی (٥٠) تۆکن وەک دیاری خرایە سەر ئەکاونتەکەت.',
      user: {
        id: generatedId,
        username,
        tokens: 50,
        is_admin: 0
      }
    });
  } catch (err: any) {
    return corsResponse({ error: 'هەڵەیەک ڕوویدا لە کاتی تۆمارکردن: ' + err.message }, 500);
  }
});

// ٢. چوونەژوورەوە (LOGIN)
router.post('/api/login', async (request, env) => {
  try {
    const { email_or_phone, password } = await request.json();
    
    if (!email_or_phone || !password) {
      return corsResponse({ error: 'تکایە ئیمێڵ/ژمارە و پاسۆرد بنووسە!' }, 400);
    }

    const passwordHash = await hashPassword(password);

    // گەڕان بەدوای بەکارهێنەر لە خشتەی یوزەرەکاندا لە D1
    const user = await env.DB.prepare(
      'SELECT id, username, tokens, is_admin, banned_until FROM users WHERE email_or_phone = ?1 AND password_hash = ?2'
    ).bind(email_or_phone, passwordHash).first();

    if (!user) {
      return corsResponse({ error: 'زانیارییەکان تەواو نین یان هەڵەن!' }, 401);
    }

    // پشکنین ئەگەر بەکارهێنەرەکە باند کرابێت
    if (user.banned_until) {
      const now = Math.floor(Date.now() / 1000);
      if (user.banned_until > now) {
        const remainingSecs = user.banned_until - now;
        const remainingMins = Math.ceil(remainingSecs / 60);
        return corsResponse({ 
          error: `ئەم ئەکاونتە لەلایەن بەڕێوەبەرەوە بلۆک کراوە! تکایە ${remainingMins} خولەکی تر هەوڵ بدەرەوە.` 
        }, 403);
      }
    }

    return corsResponse({
      success: true,
      message: 'بەخێرهاتی داما! 🤝',
      user: {
        id: user.id,
        username: user.username,
        tokens: user.tokens,
        is_admin: user.is_admin
      }
    });
  } catch (err: any) {
    return corsResponse({ error: 'هەڵە لە چوونەژوورەوە: ' + err.message }, 500);
  }
});

// ٣. گۆڕانکاری و نوێکردنەوەی تۆکنی کۆتایی یاری (کەمکردنەوە یان زیادبوون)
router.post('/api/game/end', async (request, env) => {
  try {
    const { userId, isWinner } = await request.json();
    
    if (!userId) {
      return corsResponse({ error: 'ناسنامەی بەکارهێنەر پێویستە!' }, 400);
    }

    // بڕی گۆڕانی تۆکنەکان (ئەگەر سەرکەوت بۆ یاری دەستپێکردن -١٠، ئەگەر بردیەوە +٢٠)
    const tokenChange = isWinner ? 20 : -10;
    const reason = isWinner ? 'WIN_MATCH' : 'MATCH_ENTRY_DEDUCT';

    // وەرگرتنی تۆکنی ئێستای یوزەر لە D1
    const user = await env.DB.prepare(
      'SELECT tokens FROM users WHERE id = ?1'
    ).bind(userId).first();

    if (!user) {
      return corsResponse({ error: 'بەکارهێنەر نەدۆزرایەوە!' }, 404);
    }

    const currentTokens = user.tokens !== undefined && user.tokens !== null ? user.tokens : 0;
    const newTokens = Math.max(0, currentTokens + tokenChange);

    // نوێکردنەوەی برِی تۆکنی بەکارهێنەر لە خشتەی سەرەکیدا
    await env.DB.prepare(
      'UPDATE users SET tokens = ?1 WHERE id = ?2'
    ).bind(newTokens, userId).run();

    // پاشەکەوتکردنی مێژووی جوڵەکورانی تۆکنەکە
    await env.DB.prepare(
      'INSERT INTO token_transactions (user_id, amount, reason) VALUES (?1, ?2, ?3)'
    ).bind(userId, tokenChange, reason).run();

    return corsResponse({
      success: true,
      newTokens,
      change: tokenChange
    });
  } catch (err: any) {
    return corsResponse({ error: 'هەڵە لە نوێکردنەوەی تۆکن: ' + err.message }, 500);
  }
});

// ٤. ئەدشن و دەستکاریکردنی یاریزانان لەلایەن ئەدمینەوە
router.post('/api/admin/action', async (request, env) => {
  try {
    const { adminId, actionType, targetUserId, value } = await request.json();

    // پشکنینی ناسنامەی داواکار کە ئایا ئەدمینە یان نا
    const admin = await env.DB.prepare(
      'SELECT is_admin FROM users WHERE id = ?1'
    ).bind(adminId).first();

    if (!admin || admin.is_admin !== 1) {
      return corsResponse({ error: 'دەسەڵاتی ئەم کارەت نییە! تەنها بۆ بەڕێوەبەرانە.' }, 403);
    }

    const targetUser = await env.DB.prepare(
      'SELECT username, tokens FROM users WHERE id = ?1'
    ).bind(targetUserId).first();

    if (!targetUser) {
      return corsResponse({ error: 'یاریزانی مەبەست نەدۆزرایەوە!' }, 404);
    }

    if (actionType === 'UPDATE_TOKENS') {
      const amount = parseInt(value || '0', 10);
      const newTokens = Math.max(0, targetUser.tokens + amount);
      
      await env.DB.prepare('UPDATE users SET tokens = ?1 WHERE id = ?2').bind(newTokens, targetUserId).run();
      await env.DB.prepare('INSERT INTO token_transactions (user_id, amount, reason) VALUES (?1, ?2, ?3)')
        .bind(targetUserId, amount, `ADMIN_MODIFICATION_BY_${adminId}`)
        .run();

      return corsResponse({ success: true, message: `تۆکنی @${targetUser.username} گۆڕدرا بە سەرکەوتوویی.`, newTokens });
    }

    if (actionType === 'BAN') {
      // بەهای باند کردن بۆ نموونە بە خولەک
      const minutes = parseInt(value || '60', 10);
      const banUntilTimestamp = Math.floor(Date.now() / 1000) + (minutes * 60);

      await env.DB.prepare('UPDATE users SET banned_until = ?1 WHERE id = ?2').bind(banUntilTimestamp, targetUserId).run();
      return corsResponse({ success: true, message: `یاریزان @${targetUser.username} بۆ ماوەی ${minutes} خولەک بلۆک کرا.` });
    }

    if (actionType === 'UNBAN') {
      await env.DB.prepare('UPDATE users SET banned_until = NULL WHERE id = ?2').bind(targetUserId).run();
      return corsResponse({ success: true, message: `بلۆکی سەر یاریزان @${targetUser.username} لادرا بە سەرکەوتوویی.` });
    }

    return corsResponse({ error: 'ئەکشنی نەناسراو!' }, 400);
  } catch (err: any) {
    return corsResponse({ error: 'هەڵەیەکی ئەدمین ڕوویدا: ' + err.message }, 500);
  }
});


// ==========================================
// 📡 سیستەمی هەمەلایەنەی ژوور و چوونەژوور و سینککردن لەرێگەی Workers KV (بۆ ئۆنلاین لۆبی و مەڵتیپلەیەر)
// ==========================================

// ٥.١ دروستکردنی کلاودی ژووری یاری (Create Room API)
router.post('/api/room/create', async (request, env) => {
  try {
    const { roomCode, hostUsername } = await request.json();
    if (!roomCode || !hostUsername) {
      return corsResponse({ error: 'تکایە لۆبی و ناوی میواندار دیاری بکە!' }, 400);
    }

    // زانیاری دەستپێکردنی ژووری داما
    const roomState = {
      roomCode,
      hostUsername,
      guestUsername: null,
      status: 'WAITING',
      messages: [] // بۆ گواستنەوەی چالاکییەکان وەک REMOTE_CLICK و جووڵەکان
    };

    // پاشەکەوتکردن لە کلاودی خێرای Workers KV بە کاتی بەسەرچوونی ٢ کاتژمێر (٧٢٠٠ چرکە)
    await env.gamma_kv.put(`room:${roomCode}`, JSON.stringify(roomState), { expirationTtl: 7200 });

    return corsResponse({ success: true, message: 'ژوور بە سەرکەوتوویی لەسەر کلاودی جیهانی دروستکرا! 🟢' });
  } catch (err: any) {
    return corsResponse({ error: 'هەڵەی کلاود لە دروستکردنی ژوور: ' + err.message }, 500);
  }
});

// ٥.٢ بەستنەوە و چوونەژوورەوەی میوان (Join Room API)
router.post('/api/room/join', async (request, env) => {
  try {
    const { roomCode, guestUsername } = await request.json();
    if (!roomCode || !guestUsername) {
      return corsResponse({ error: 'ژوور و ناوی داواکار دیارینەکراوە!' }, 400);
    }

    const roomRaw = await env.gamma_kv.get(`room:${roomCode}`);
    if (!roomRaw) {
      return corsResponse({ error: 'تۆ ناتوانیت بەم کۆدە بێیتە ژوورەوە، کۆدەکە بوونی نییە یان نوێ نییە!' }, 404);
    }

    const room = JSON.parse(roomRaw);
    
    // ئەگەر پێشتر هاوڕێیەک لەناو ژوورەکە بێت و ئەو نەبێت
    if (room.guestUsername && room.guestUsername !== guestUsername) {
      return corsResponse({ error: 'ئەم ژوورە پڕبووە لەگەڵ یاریزانێکی تر!' }, 400);
    }

    room.guestUsername = guestUsername;
    room.status = 'PLAYING';

    // ناردنی پەیامی Join بۆ بەستنەوەی ڕاستەوخۆ
    const guestJoinEvent = {
      id: `join-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: 'PEER_JOIN_REQUEST',
      roomCode,
      guestUser: guestUsername,
      timestamp: Date.now()
    };
    room.messages.push(guestJoinEvent);

    await env.gamma_kv.put(`room:${roomCode}`, JSON.stringify(room), { expirationTtl: 7200 });

    return corsResponse({ 
      success: true, 
      hostUsername: room.hostUsername, 
      message: 'بەستنەوەکە بە سەرکەوتوویی ئەنجامدرا! 🤝' 
    });
  } catch (err: any) {
    return corsResponse({ error: 'هەڵە لە چوونەژوور بۆ ژوورەکە: ' + err.message }, 500);
  }
});

// ٥.٣ ناردنی جووڵەکان، نامە، و دەستکاریکردنی بارودۆخی یاری (Send Room Event API)
router.post('/api/room/update', async (request, env) => {
  try {
    const { roomCode, sender, type, payload } = await request.json();
    
    if (!roomCode || !type) {
      return corsResponse({ error: 'کۆدی لۆبی یان جۆری ئەکشن نادروستە!' }, 400);
    }

    const roomRaw = await env.gamma_kv.get(`room:${roomCode}`);
    if (!roomRaw) {
      return corsResponse({ error: 'ئەم ژوورە بوونی نەماوە یان داخراوە!' }, 404);
    }

    const room = JSON.parse(roomRaw);

    // نوێکردنەوە یان سەلماندنی پڕکەرەوەی پیامەکان
    const newEvent = {
      id: `${type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type,
      senderUsername: sender,
      ...payload, // بڵاوکردنەوەی هەموو داتا مەرجەعەکان
      timestamp: Date.now()
    };

    room.messages.push(newEvent);

    // هێشتنەوەی کورتترین پەیامەکان (دوای دە پەیامی کۆتایی) بۆ پاراستنی خێرایی و نەمانی کێشەی میمۆری لە KV
    if (room.messages.length > 25) {
      room.messages = room.messages.slice(-25);
    }

    await env.gamma_kv.put(`room:${roomCode}`, JSON.stringify(room), { expirationTtl: 7200 });

    return corsResponse({ success: true });
  } catch (err: any) {
    return corsResponse({ error: 'هەڵە لە ناردنی نوێکاری: ' + err.message }, 500);
  }
});

// ٥.٤ پۆڵکردنی بەردەوام و خێرای ژوور لەرێگەی برۆوسەرەوە (Poll Room API)
router.get('/api/room/poll', async (request, env) => {
  try {
    const { searchParams } = new URL(request.url);
    const roomCode = searchParams.get('roomCode');

    if (!roomCode) {
      return corsResponse({ error: 'کۆدی ژوور پێویستە بۆ پشکنین!' }, 400);
    }

    const roomRaw = await env.gamma_kv.get(`room:${roomCode}`);
    if (!roomRaw) {
      return corsResponse({ error: 'ژوورەکە بەردەست نییە یان بەسەرچووە!' }, 404);
    }

    const room = JSON.parse(roomRaw);

    return corsResponse({
      success: true,
      status: room.status,
      hostUsername: room.hostUsername,
      guestUsername: room.guestUsername,
      messages: room.messages || []
    });
  } catch (err: any) {
    return corsResponse({ error: 'هەڵە لە پۆڵکردنی کلاود: ' + err.message }, 500);
  }
});


// 📡 سیستەمی بانگهێشتنامەی ڕاستەوخۆ تایبەت بە کلاود (Direct Profile Invites Support)
// ناردنی بانگهێشت لەرێگەی بڕۆفایلەوە
router.post('/api/invite/send', async (request, env) => {
  try {
    const { targetUsername, senderUsername, roomCode } = await request.json();
    if (!targetUsername || !senderUsername || !roomCode) {
      return corsResponse({ error: 'داتا کەمە بۆ ناردنی بانگهێشتنامە!' }, 400);
    }

    const inviteData = {
      senderUsername,
      roomCode,
      timestamp: Date.now()
    };

    // پاشەکەوت لە کلاودی KV بۆ بەرگری لە پۆپئەپەکان (کاتی بەسەرچوونی پێنج خولەک (٣٠٠ چرکە))
    await env.gamma_kv.put(`invite:${targetUsername.toLowerCase()}`, JSON.stringify(inviteData), { expirationTtl: 300 });

    return corsResponse({ success: true, message: 'بانگهێشتنامە نێردرا!' });
  } catch (err: any) {
    return corsResponse({ error: err.message }, 500);
  }
});

// پشکنینی بانگهێشت لە مێنۆی سەرەکی
router.get('/api/invite/poll', async (request, env) => {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    if (!username) {
      return corsResponse({ error: 'تکایە ناوی بەکارهێنەر دیاری بکە!' }, 400);
    }

    const inviteRaw = await env.gamma_kv.get(`invite:${username.toLowerCase()}`);
    if (!inviteRaw) {
      return corsResponse({ success: false, invite: null });
    }

    return corsResponse({ success: true, invite: JSON.parse(inviteRaw) });
  } catch (err: any) {
    return corsResponse({ error: err.message }, 500);
  }
});

// سڕینەوە و پەسەندکردنی بانگهێشتنامەکان
router.post('/api/invite/clear', async (request, env) => {
  try {
    const { username } = await request.json();
    if (username) {
      await env.gamma_kv.delete(`invite:${username.toLowerCase()}`);
    }
    return corsResponse({ success: true });
  } catch (err: any) {
    return corsResponse({ error: err.message }, 500);
  }
});


// ٦. بۆ ئەدرەسە نەدۆزراوەکان
router.all('*', () => {
  return corsResponse({ error: 'ئەم ناونیشانە بوونی نییە (404)!' }, 404);
});

export default {
  fetch(request: Request, env: any): Promise<Response> {
    return router.fetch(request, env);
  }
};
