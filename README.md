# BeeBox

Stream your screen at 1080p, 1440p or 4K (up to 144 fps), talk by voice both ways, chat, send reactions, and let a viewer control your PC (only after you click **Allow**). English and Vietnamese built in.

Video and audio go straight from your PC to the viewer (WebRTC peer-to-peer). The free server only helps the browsers find each other, so it costs nothing to run.

```
Your PC (Chrome/Edge)  ──── video + voice + chat + control ────►  Viewer's browser / phone
        │                       (direct, peer-to-peer)
        ├─ control helper (agent.py) moves your real mouse/keyboard
        └──────── tiny signaling server (free on Render) ────────┘
```

## 1. Put it online (free, Render)

1. Upload this folder to a GitHub repo.
2. Go to https://render.com → **New → Web Service** → pick the repo.
3. Runtime **Node**, Build `npm install`, Start `npm start`, Instance type **Free**. Create.
4. After a minute you get an address like `https://screenstream-xxxx.onrender.com`.

Free Render apps sleep after ~15 minutes with no visitors. Open the address a minute before you stream to wake it up.

### Your own brand (optional)

In Render → your service → **Environment**, add any of:

| Key | Example | What it does |
|---|---|---|
| `BRAND_NAME` | `Bee Gaming` | Name shown on every page and in the browser tab |
| `BRAND_COLOR` | `#ffc400` | Main button / highlight color (6-digit hex) |
| `BRAND_LOGO` | `https://…/logo.png` | Square logo image (must be an https link) |

Save, and Render restarts the app with your branding.

## 2. Stream

1. On your PC, open `https://your-app.onrender.com/host` in **Chrome or Edge**.
2. Set a password, pick a quality card (**Auto** is recommended), click **Go live**.
3. Pick **Entire screen** (needed for remote control). For PC sound, tick "Also share system audio" in Chrome's picker.
4. Click **Copy** or let your friend scan the **QR code**. They also need the password.

The viewer page works on computers and phones. The controls hide automatically. Move the mouse or tap to show them.

## 3. Quality

| Card | Best for | What it does |
|---|---|---|
| **Auto** | Most streams | Starts at 1080p 60 fps and adjusts to your connection: 720p30 up to 4K60 |
| **Smooth** | Games, video | 1080p 60 fps, keeps the frame rate |
| **Balanced** | Mixed use | 1080p 60 fps |
| **Sharp** | Text, code, documents | Native resolution 30 fps, keeps text crisp |

You can switch cards while live. **Advanced settings** has exact resolution, 30–144 fps, 4–50 Mbps, content type and codec.

- **Connection health** (green / yellow / red bars) shows on the host for each viewer and on the viewer's screen, with a tip saying what to change.
- **PC sound** is sent in stereo at 160 kbps (browsers normally send mono at about 32 kbps).
- **Codec Auto** picks one your graphics card can encode. The line under the preview tells you if it found one.
- Viewer buttons: **Actual size** shows text pixel-for-pixel (sharpest). **Smooth playback** adds a 0.15 s buffer to hide stutter on a shaky connection.

Tips: use a network cable instead of Wi-Fi, keep your graphics driver updated, keep Chrome's "Use graphics acceleration" setting on, and run games in borderless windowed mode.

## 4. Remote control (optional)

Once on the host PC:

1. Install Python from https://www.python.org/downloads/ and tick **Add python.exe to PATH**.
2. Double-click `agent/start-agent.bat`. The first run installs what it needs and asks for your site address.
3. Keep that window open. The host page shows **Control helper on**. If Chrome asks to allow access to devices on your local network, click **Allow**.

The viewer clicks **Request control** and you click **Allow control**. **Take back** returns control to you. **Closing the helper window stops all control right away.** On phones, a tap is a click.

## 5. Chat and reactions

Everyone in the room can chat and send 👍 😂 🔥 ❤️ 👏 😮. Messages from one viewer reach the host and all other viewers.

## If a viewer can't connect

Some strict networks (some mobile 4G, office or school networks) need a relay server called TURN.

1. Get free TURN credentials, for example at https://www.metered.ca/stun-turn.
2. In Render → **Environment**, add `ICE_SERVERS`:

```json
[{"urls":"stun:stun.l.google.com:19302"},
 {"urls":["turn:global.relay.metered.ca:80","turn:global.relay.metered.ca:443?transport=tcp"],
  "username":"YOUR_USERNAME","credential":"YOUR_PASSWORD"}]
```

## Run on your own PC (for testing)

```
npm install
npm start
```

Open http://localhost:3000/host and, in another window, http://localhost:3000/watch.

## Files

- `server.js`: signaling server (rooms, passwords, STUN/TURN config, branding, QR codes)
- `public/host.html`: host page
- `public/watch.html`: viewer page
- `public/common.js`: shared code (languages, icons, connection tuning)
- `public/style.css`: design
- `agent/agent.py`: control helper that moves the real mouse and keyboard on the host PC
