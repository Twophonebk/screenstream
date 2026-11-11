# ScreenStream

Stream your screen at 1080p, 1440p or 4K, talk by voice both ways, and let a viewer control your PC (only after you click **Allow**).

Video and audio go straight from your PC to the viewer (WebRTC peer-to-peer). The free server only helps the two browsers find each other, so it costs nothing to run.

```
Your PC (Chrome/Edge)  ──── video + voice + control ────►  Viewer's browser
        │                    (direct, peer-to-peer)
        ├─ control helper (agent.py) moves your real mouse/keyboard
        └──────── tiny signaling server (free on Render) ────────┘
```

## 1. Put it online (free, Render)

1. Create a GitHub repo and upload everything in this folder (no need for `node_modules`).
2. Go to https://render.com → **New → Web Service** → pick the repo.
3. Settings: Runtime **Node**, Build `npm install`, Start `npm start`, Instance type **Free**. Create.
4. After a minute you get an address like `https://screenstream-xxxx.onrender.com`.

Free Render apps sleep after ~15 minutes with no visitors. Opening the address wakes it up in about a minute, so open it before you start streaming.

Railway works too: New Project → Deploy from GitHub repo. No settings needed.

## 2. Stream

1. On your PC, open `https://your-app.onrender.com/host` in **Chrome or Edge**.
2. Set a password, choose quality (default 1080p 60 fps, 12 Mbps), click **Start sharing**.
3. Pick **Entire screen** (needed for remote control). To send PC sound, also tick "Also share system audio" in Chrome's picker.
4. Click **Copy** and send the viewer link + password to your friend.

The viewer opens the link, types the password, and allows the mic. Use **Fullscreen** for the best picture.

## 3. Remote control (optional)

You need this once on the host PC:

1. Install Python from https://www.python.org/downloads/ and tick **Add python.exe to PATH**.
2. Double-click `agent/start-agent.bat`. The first run installs what it needs and asks for your site address (e.g. `https://screenstream-xxxx.onrender.com`).
3. Keep that window open. The host page shows **Control helper on**. If Chrome asks to allow access to devices on your local network, click **Allow**.

Then the viewer clicks **Request control** and you click **Allow control**. You can click **Take back control** any time. **Closing the helper window stops all control right away.**

Notes:
- Viewer's keys go to your PC only while they're controlling and the video is focused. In fullscreen, keys like Alt+Tab and the Windows key also go to your PC (Chrome/Edge).
- With more than one monitor, choose which one the viewer controls on the host page. It should be the same screen you shared.
- The helper only accepts connections from this PC and from your site address. To change the address, delete `agent/agent-config.json`.

## Quality tips

| Want | Settings |
|---|---|
| Mixed use (default) | Content type **Mixed**, 1080p 60, 12–20 Mbps |
| Sharp text, coding, docs | Content type **Text**, 1080p 30 or 60, 8–12 Mbps |
| Games, video | Content type **Games**, 1080p 60, 12–20 Mbps |
| 1440p / 4K | 20–50 Mbps, and your upload speed must be higher than that |

- Your **upload** speed is the limit. Check it at speedtest.net and choose a bitrate below about 70% of it.
- Codec **Auto** picks a codec your graphics card can encode (AV1, then H.264, then VP9). The preview line shows which one it chose.
- Content type can be switched while live: **Text** keeps full resolution, **Games** keeps full fps.
- The host's viewer list shows resolution, fps, bitrate, GPU/CPU encoder and whether quality is "limited by cpu" or "bandwidth".
  - "limited by bandwidth": lower the bitrate a bit, or the viewer's internet is the bottleneck.
  - "limited by cpu": lower the fps or resolution.
- Viewer buttons: **Actual size** shows the stream pixel-for-pixel (sharpest text, scroll if the window is small). **Smooth playback** adds ~0.15 s buffer to hide stutter from a shaky connection.

## If the viewer can't connect

Most home networks connect directly. Some strict networks (some mobile 4G, office or school networks) need a relay server called TURN.

1. Get free TURN credentials, for example at https://www.metered.ca/stun-turn (free plan).
2. In Render → your service → **Environment**, add `ICE_SERVERS` with a value like:

```json
[{"urls":"stun:stun.l.google.com:19302"},
 {"urls":["turn:global.relay.metered.ca:80","turn:global.relay.metered.ca:443?transport=tcp"],
  "username":"YOUR_USERNAME","credential":"YOUR_PASSWORD"}]
```

3. Save. Render restarts the app. When the relay is used, the host stats show "via TURN".

## Run on your own PC (for testing)

```
npm install
npm start
```

Open http://localhost:3000/host and, in another browser window, http://localhost:3000/watch.

## Files

- `server.js`: signaling server (rooms, passwords, STUN/TURN config)
- `public/host.html`: host page (capture, voice, viewer list, control approval)
- `public/watch.html`: viewer page (video, voice, mouse/keyboard capture)
- `agent/agent.py`: control helper that moves the real mouse and keyboard on the host PC
