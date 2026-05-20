#  ڕێبەرنامەی پێکبەستنی ئۆنلاین لەسەر Cloudflare 🛠️
## (Cloudflare Setup & Realtime Backend Deployment Guide)

ئەم بەڵگەنامەیە ڕوونکردنەوەی تەواو و هەنگاو بە هەنگاو دەدات لەسەر ئەوەی چۆن یارییەکە لکێنرێت بە **Cloudflare** بۆ یاری کردنی دوو کەسی ئۆنلاین (Realtime Room & WebSockets).

پڕۆژەکە بەم شێوازە دابەش دەبێت:
1. **Frontend**: ڕووکاری یارییەکە لەسەر **Cloudflare Pages** بڵاودەکرێتەوە.
2. **Backend**: سێرڤەری گواستنەوەی نامە و کۆنتڕۆڵی ژوورەکان (P2P Room Hub) لەسەر **Cloudflare Workers** بە خێراییەکی ناوازە و بێ پارە بڵاودەکرێتەوە.

---

## 📐 ١. نەخشەی گشتی باکیند (Backend Architecture)
بۆ ئەوەی دوو یاریزان بەیەکەوە یاری بکەن، پێویستمان بە نێوەندێک (Relay Server) هەیە کە نامەکانی نێوان یاریزانەکان (جولەکان، نامە چاتەکان، و ئیمۆجییەکان) بگوێزێتەوە.
باشترین و گونجاوترین چارەسەر لەسەر کلاودفلێر بەکارهێنانی **Cloudflare Workers** لەگەڵ **WebSockets** یان **Cloudflare KV** ـە بۆ پاشەکەوتکردنی دۆخی ژوورەکان.

ئێمە لێرەدا کۆدی تەواو و نایابمان بۆ ئامادەکردوون کە تەنها پێویستی بە کۆپیکردن و بڵاوکردنەوە هەیە!

---

## 💻 ٢. کۆدی سێرڤەری باکیند (Cloudflare Worker Code)
پەڕگە مۆڕەکراوەکەی خوارەوە دروست بکە لەناو پڕۆژەیەکی نوێی کلاودفلێر، ناوی خزمەتگوزارییەکە دەنێین `dama-multiplayer-hub`:

### پەڕگەی `index.ts` (کۆدی تەواوی باکیند):
```typescript
interface Env {
  // تەنها بۆ پاشەکەوتکردنی کاتی ژوورەکان
  ROOMS_KV?: KVNamespace;
}

// لیستێک بۆ هەڵگرتنی بەستەرە چالاکەکان لە بیرگەدا
const activeConnections = new Map<string, WebSocket[]>();

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    // ڕێگەدان بە CORS بۆ فڕۆشتنی داواکاری لە هەموو شوێنێکەوە
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // ١. دروستکردن یان بەستنەوەی ژوورەکان
    if (url.pathname === "/api/room" && request.method === "POST") {
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      return new Response(JSON.stringify({ code }), {
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    // ٢. نوێکردنەوەی بەستەری یاریزان بە WebSocket
    if (url.pathname === "/ws") {
      const upgradeHeader = request.headers.get("Upgrade");
      if (!upgradeHeader || upgradeHeader !== "websocket") {
        return new Response("Expected Upgrade: websocket", { status: 426 });
      }

      const roomCode = url.searchParams.get("room");
      if (!roomCode) {
        return new Response("Room code required", { status: 400 });
      }

      const webSocketPair = new WebSocketPair();
      const [client, server] = Object.values(webSocketPair);

      server.accept();

      // پاشەکەوتکردنی هێڵی یاریزانەکە لە ژوورە دیاریکراوەکەدا
      if (!activeConnections.has(roomCode)) {
        activeConnections.set(roomCode, []);
      }
      activeConnections.get(roomCode)!.push(server);

      // کاتێک نامەی نوێ دێت لەلایەن یەکێک لە یاریزانەکانەوە
      server.addEventListener("message", (event) => {
        try {
          const messageData = event.data;
          
          // نامەکە دەنێرینەوە بۆ هەموو یاریزانەکانی تری ناو هەمان ژوور
          const peers = activeConnections.get(roomCode) || [];
          for (const peer of peers) {
            if (peer !== server && peer.readyState === WebSocket.OPEN) {
              peer.send(messageData);
            }
          }
        } catch (err) {
          console.error(err);
        }
      });

      // کاتێک یاریزانێک جێدێڵێت یان بەستەری دەپچڕێت
      const cleanup = () => {
        const peers = activeConnections.get(roomCode) || [];
        const index = peers.indexOf(server);
        if (index > -1) {
          peers.splice(index, 1);
        }
        if (peers.length === 0) {
          activeConnections.delete(roomCode);
        }
      };

      server.addEventListener("close", cleanup);
      server.addEventListener("error", cleanup);

      return new Response(null, { status: 101, webSocket: client });
    }

    return new Response("Not Found", { status: 404, headers: corsHeaders });
  }
};
```

---

## 🛠️ ٣. هەنگاوەکانی ڕێکخستنی باکیند لەسەر Cloudflare Workers

ئەم هەنگاوانە پەیڕەو بکە لەناو کۆمپیوتەرەکەتدا:

1. **دروستکردنی پڕۆژەی باکیند**:
   ترمیناڵەکەت کەرەوە و ئەم فرمانە بنووسە بۆ دروستکردنی کارکەرێکی نوێ:
   ```bash
   npm create cloudflare@latest dama-backend
   ```
   *لێرەدا جۆری پڕۆژەکە بە `Hello World Worker` هەڵبژێره و زمانەکەی بە `TypeScript` دیاری بکە.*

2. **کۆپیکردنی کۆدەکە**:
   پەڕگەی `src/index.ts` بکەرەوە لەو پڕۆژە نوێیەی دروست بووە، و کۆدی سەرەوەی تێدا دابنێ.

3. **بڵاوکردنەوەی باکیند**:
   لە ترمیناڵەکەدا ئەم فرمانە لێبدە بۆ یەکەمجار تا بڵاوببێتەوە لەسەر کلاودفلێرەکەت:
   ```bash
   npx wrangler deploy
   ```
   *کلاودفلێر لینکێکی تایبەتت پێ دەدات وەک: `https://dama-backend.your-subdomain.workers.dev`*

---

## 🛜 ٤. گرێدانی فرۆنتێند (React) بە سێرڤەری باکیندەوە

بۆ ئەوەی بەستەری راستەقینە کاربکات، ئەپەکەت بە ئاسانی ئەم گۆڕانکاریانەی تێدا بەکاردەهێنێت لە شوێنی سیمیولەیشن لە ناو `src/App.tsx`:

### نموونەی کلیک کردنی دوگمەی دروستکردنی ژوور لە فڕۆنتێند:
```typescript
const handleCreateRealRoom = async () => {
  setIsLobbySearching(true);
  
  // ١. داواکاری دروستکردنی کۆدی نوێ لە سێرڤەرەکەمان دەکەین
  const res = await fetch("https://dama-backend.your-subdomain.workers.dev/api/room", {
    method: "POST"
  });
  const data = await res.json();
  const newCode = data.code;
  setRoomCode(newCode);

  // ٢. بەستنەوە بە سیستەمی هەمیشەیی WebSocket
  const ws = new WebSocket(`wss://dama-backend.your-subdomain.workers.dev/ws?room=${newCode}`);
  
  ws.onmessage = (event) => {
    const payload = JSON.parse(event.data);
    
    // باڵانس کردنی دۆخی یارییەکە
    if (payload.type === 'MOVE') {
      dispatch({ type: 'MAKE_MOVE', payload: payload.move });
    } else if (payload.type === 'CHAT') {
      sendQuickChatMessage('P2', payload.text);
    } else if (payload.type === 'EMOJI') {
      triggerFloatingEmoji(payload.emoji);
    }
  };

  ws.onopen = () => {
    console.log("Connected as Host");
  };
};
```

---

## 🚀 ٥. هەنگاوەکانی بەرزکردنەوەی فرۆنتێند بۆ GitHub و پاشان Cloudflare Pages

### هەنگاوی یەکەم: بەرزکردنەوە بۆ GitHub
1. بڕۆ کۆنتڕۆڵی لۆکاڵی پرۆژەکەت لە سەر کۆمپیوتەرەکەت.
2. پڕۆژەیەکی نوێ (Repository) دروست بکە لەسەر ئەکاونتی گیتهەبەکەت پاشان فرمانەکانی خوارەوە جێبەجێ بکە:
   ```bash
   git init
   git add .
   git commit -m "feat: traditional kurdish theme, ai coach, replay and realtime lobby"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPOSITORY_URL
   git push -u origin main
   ```

### هەنگاوی دووەم: بڵاوکردنەوە لەسەر Cloudflare Pages
1. بچۆ ناو پانێڵی [Cloudflare Dashboard](https://dash.cloudflare.com).
2. لە لیستی لای چەپ بڕۆ بەشی **Workers & Pages**.
3. کرتە بکە لەسەر **Create application** پاشان بەشی **Pages**.
4. کرتە بکە لەسەر **Connect to Git** و ئەکاونتی گیتهەبەکەت ببەستەرەوە.
5. ئەو پڕۆژەیە (Repository) هەڵبژێرە کە لە گیتهەب دروستی کردووە.
6. لە ڕێکخستنەکانی بنیاتنان (Build Settings):
   - **Framework Preset**: بە دیاری نەکراوی دایبنێ یان بیدۆزەرەوە بە **Vite**.
   - **Build command**: بنووسە `npm run build`
   - **Build output directory**: بنووسە `dist`
7. کرتە بکە لەسەر **Save and Deploy**. 

تەواو! ئێستا هەر گۆڕانکارییەک لە گیتهەب بکەیت بە شێوەیەکی ئۆتۆماتیکی بڵاودەبێتەوە و یاریزانی بەرامبەر دەتوانێت لە رێگەی کۆدی کورتەوە پەیوەندیت پێوە بکات بەبێ کێشە! 🌟
