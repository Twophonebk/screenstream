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

// Make WebRTC start at a high bitrate (sharp from the first second) and not drop too low.
// Applied to the viewer's answer on the host side.
function boostBitrate(sdp, maxBps) {
  const kbps = Math.round(maxBps / 1000);
  const extra = `x-google-start-bitrate=${Math.round(kbps * 0.6)};x-google-min-bitrate=${Math.min(3000, Math.round(kbps * 0.25))};x-google-max-bitrate=${kbps}`;
  const lines = sdp.split('\r\n');
  const pts = new Set();
  let video = false;
  for (const l of lines) {
    if (l.startsWith('m=')) video = l.startsWith('m=video');
    const m = video && l.match(/^a=rtpmap:(\d+) (H264|VP8|VP9|AV1)\//i);
    if (m) pts.add(m[1]);
  }
  const out = [];
  for (const l of lines) {
    const f = l.match(/^a=fmtp:(\d+) (.*)$/);
    if (f && pts.has(f[1]) && !f[2].includes('x-google')) { out.push(`a=fmtp:${f[1]} ${f[2]};${extra}`); continue; }
    out.push(l);
    const r = l.match(/^a=rtpmap:(\d+) /);
    if (r && pts.has(r[1]) && !lines.some((x) => x.startsWith(`a=fmtp:${r[1]} `))) out.push(`a=fmtp:${r[1]} ${extra}`);
  }
  return out.join('\r\n');
}

// Pick the best codec this PC can encode in hardware (graphics card): AV1 > H.264 > VP9.
// Without hardware encoding, H.264 is the lightest on the CPU.
async function pickBestCodec(w, h, fps, bps) {
  const have = (RTCRtpReceiver.getCapabilities('video')?.codecs || []).map((c) => c.mimeType.toLowerCase());
  for (const mime of ['video/AV1', 'video/H264', 'video/VP9']) {
    if (!have.includes(mime.toLowerCase())) continue;
    try {
      const r = await navigator.mediaCapabilities.encodingInfo({
        type: 'webrtc', video: { contentType: mime, width: w, height: h, bitrate: bps, framerate: fps },
      });
      if (r.supported && r.powerEfficient) return { mime, hw: true };
    } catch {}
  }
  return { mime: 'video/H264', hw: false };
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
