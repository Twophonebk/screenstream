// ScreenStream signaling server.
// Only relays connection setup messages; the video/audio/control data goes
// directly between host and viewer browsers (WebRTC peer-to-peer).
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { WebSocketServer } = require('ws');
const QRCode = require('qrcode');

const PORT = process.env.PORT || 3000;

// Branding (set in Render > Environment): BRAND_NAME, BRAND_COLOR (#hex), BRAND_LOGO (image URL)
const BRAND = {
  name: (process.env.BRAND_NAME || '').slice(0, 40) || null,
  color: /^#[0-9a-fA-F]{6}$/.test(process.env.BRAND_COLOR || '') ? process.env.BRAND_COLOR : null,
  logo: /^https:\/\//.test(process.env.BRAND_LOGO || '') ? process.env.BRAND_LOGO : null,
};
const PUBLIC_DIR = path.join(__dirname, 'public');

// ICE servers (STUN/TURN). Override with env ICE_SERVERS as JSON, e.g.
// [{"urls":"stun:stun.l.google.com:19302"},{"urls":"turn:host:3478","username":"u","credential":"p"}]
let ICE_SERVERS = [
  { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
  { urls: 'stun:stun.cloudflare.com:3478' },
];
if (process.env.ICE_SERVERS) {
  try { ICE_SERVERS = JSON.parse(process.env.ICE_SERVERS); }
  catch (e) { console.error('ICE_SERVERS is not valid JSON, using defaults'); }
}

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.png': 'image/png', '.webp': 'image/webp', '.json': 'application/json',
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  if (url.pathname === '/config') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    return res.end(JSON.stringify({ iceServers: ICE_SERVERS, brand: BRAND }));
  }
  if (url.pathname === '/qr.svg') {
    const data = String(url.searchParams.get('d') || '').slice(0, 500);
    if (!data) { res.writeHead(400); return res.end(); }
    return QRCode.toString(data, { type: 'svg', margin: 1, errorCorrectionLevel: 'M', color: { dark: '#0b0d12', light: '#ffffff' } })
      .then((svg) => { res.writeHead(200, { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=3600' }); res.end(svg); })
      .catch(() => { res.writeHead(500); res.end(); });
  }
  if (url.pathname === '/healthz') { res.writeHead(200); return res.end('ok'); }

  let p = url.pathname === '/' ? '/index.html' : url.pathname;
  if (p === '/host') p = '/host.html';
  if (p === '/watch') p = '/watch.html';
  const file = path.normalize(path.join(PUBLIC_DIR, p));
  if (!file.startsWith(PUBLIC_DIR)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
});

// rooms: code -> { passHash, host: ws, viewers: Map(id -> ws) }
const rooms = new Map();
const hash = (s) => crypto.createHash('sha256').update(String(s)).digest('hex');
const send = (ws, msg) => { if (ws && ws.readyState === 1) ws.send(JSON.stringify(msg)); };

function endRoom(code) {
  const room = rooms.get(code);
  if (!room) return;
  clearTimeout(room.timer);
  for (const v of room.viewers.values()) send(v, { type: 'host-left' });
  rooms.delete(code);
}

const wss = new WebSocketServer({ server, path: '/ws', maxPayload: 256 * 1024 });

wss.on('connection', (ws, req) => {
  ws.ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }

    if (msg.type === 'ping') return send(ws, { type: 'pong' });

    if (msg.type === 'create') {
      const code = String(msg.room || '').trim().toUpperCase();
      if (!/^[A-Z0-9-]{3,32}$/.test(code)) return send(ws, { type: 'error', message: 'Room code must be 3-32 letters/numbers.' });
      const existing = rooms.get(code);
      if (existing && existing.host && existing.host.readyState === 1) {
        return send(ws, { type: 'error', message: 'That room is already being hosted.' });
      }
      // A room waiting for its host to reconnect can only be reclaimed with the same password
      if (existing && existing.passHash !== hash(msg.password || '')) {
        return send(ws, { type: 'error', message: 'That room is already being hosted.' });
      }
      const room = existing || { viewers: new Map() };
      clearTimeout(room.timer);
      room.passHash = hash(msg.password || '');
      room.host = ws;
      room.hostIp = ws.ip;
      rooms.set(code, room);
      ws.role = 'host'; ws.room = code;
      send(ws, { type: 'created', room: code });
      // Re-announce viewers that were waiting (e.g. host refreshed the page)
      for (const [id, v] of room.viewers) send(ws, { type: 'viewer-joined', id, name: v.name });
      return;
    }

    if (msg.type === 'join') {
      const code = String(msg.room || '').trim().toUpperCase();
      const room = rooms.get(code);
      if (!room || !room.host || room.host.readyState !== 1) return send(ws, { type: 'error', message: 'Room not found or host is offline.' });
      if (room.passHash !== hash(msg.password || '')) return send(ws, { type: 'error', message: 'Wrong password.' });
      const id = crypto.randomUUID().slice(0, 8);
      ws.role = 'viewer'; ws.room = code; ws.id = id;
      ws.name = String(msg.name || 'Viewer').slice(0, 32);
      room.viewers.set(id, ws);
      send(ws, { type: 'joined', id, sameNet: !!ws.ip && ws.ip === room.hostIp });
      send(room.host, { type: 'viewer-joined', id, name: ws.name });
      return;
    }

    if (msg.type === 'end') {
      const room = rooms.get(ws.room);
      if (ws.role === 'host' && room && room.host === ws) endRoom(ws.room);
      return;
    }

    // Relay WebRTC signaling between host and a viewer
    if (msg.type === 'signal') {
      const room = rooms.get(ws.room);
      if (!room) return;
      if (ws.role === 'host') {
        send(room.viewers.get(msg.to), { type: 'signal', data: msg.data });
      } else if (ws.role === 'viewer') {
        send(room.host, { type: 'signal', from: ws.id, data: msg.data });
      }
    }
  });

  ws.on('close', () => {
    const room = rooms.get(ws.room);
    if (!room) return;
    if (ws.role === 'host' && room.host === ws) {
      // Video is peer-to-peer and keeps playing, so give the host 30 s to reconnect before ending the room
      const code = ws.room;
      room.timer = setTimeout(() => { if (rooms.get(code) === room && room.host === ws) endRoom(code); }, 30000);
    } else if (ws.role === 'viewer') {
      room.viewers.delete(ws.id);
      send(room.host, { type: 'viewer-left', id: ws.id });
    }
  });
});

// Keep connections alive (free hosts drop idle sockets) and clean up dead ones
setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 25000);

server.listen(PORT, () => console.log(`ScreenStream running on http://localhost:${PORT}`));
