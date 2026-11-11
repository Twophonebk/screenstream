// Shared helpers for host + viewer pages
const $ = (sel) => document.querySelector(sel);

async function getIceServers() {
  try {
    const r = await fetch('/config', { cache: 'no-store' });
    return (await r.json()).iceServers;
  } catch {
    return [{ urls: 'stun:stun.l.google.com:19302' }];
  }
}

// Small WebSocket wrapper for the signaling server
class Signal {
  constructor(onMessage, onStatus) {
    this.onMessage = onMessage;
    this.onStatus = onStatus || (() => {});
    this.queue = [];
  }
  connect() {
    return new Promise((resolve, reject) => {
      const proto = location.protocol === 'https:' ? 'wss' : 'ws';
      this.ws = new WebSocket(`${proto}://${location.host}/ws`);
      this.ws.onopen = () => {
        this.onStatus('online');
        this.ping = setInterval(() => this.send({ type: 'ping' }), 20000);
        resolve();
      };
      this.ws.onerror = () => reject(new Error('Cannot reach the server'));
      this.ws.onclose = () => { clearInterval(this.ping); this.onStatus('offline'); };
      this.ws.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        if (msg.type !== 'pong') this.onMessage(msg);
      };
    });
  }
  send(msg) { if (this.ws && this.ws.readyState === 1) this.ws.send(JSON.stringify(msg)); }
}

function toast(text, kind = '') {
  const el = document.createElement('div');
  el.className = `toast ${kind}`;
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => el.classList.add('show'), 10);
  setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 300); }, 3500);
}

function fmtBitrate(bps) {
  if (!bps) return '0 kbps';
  return bps > 1e6 ? `${(bps / 1e6).toFixed(1)} Mbps` : `${Math.round(bps / 1e3)} kbps`;
}

// Put a preferred codec first in a transceiver's codec list
function preferCodec(transceiver, mime) {
  if (!mime || mime === 'auto' || !transceiver.setCodecPreferences) return;
  const caps = RTCRtpReceiver.getCapabilities('video');
  if (!caps) return;
  const first = caps.codecs.filter((c) => c.mimeType.toLowerCase() === mime.toLowerCase());
  if (!first.length) return;
  const rest = caps.codecs.filter((c) => c.mimeType.toLowerCase() !== mime.toLowerCase());
  try { transceiver.setCodecPreferences([...first, ...rest]); } catch (e) { console.warn('codec pref failed', e); }
}
