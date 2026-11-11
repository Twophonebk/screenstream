"""
ScreenStream control helper.

Runs on the HOST PC. The host's browser page sends it mouse/keyboard events
(coming from an approved viewer) over ws://127.0.0.1:8765, and this script
applies them to the real mouse and keyboard.

Only accepts connections from this computer, and only from your stream site
(saved in agent-config.json). Close this window to stop all remote control.
"""
import argparse
import asyncio
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
CONFIG_PATH = os.path.join(HERE, "agent-config.json")
PORT = 8765

# Use real pixel coordinates on Windows with display scaling (125%, 150%...)
if sys.platform == "win32":
    try:
        import ctypes
        ctypes.windll.shcore.SetProcessDpiAwareness(2)
    except Exception:
        try:
            ctypes.windll.user32.SetProcessDPIAware()
        except Exception:
            pass

from websockets.asyncio.server import serve  # noqa: E402
from websockets.http11 import Response  # noqa: E402
from websockets.datastructures import Headers  # noqa: E402


# ---------------------------------------------------------------- config
def load_config(cli_site):
    cfg = {}
    if os.path.exists(CONFIG_PATH):
        try:
            with open(CONFIG_PATH, encoding="utf-8") as f:
                cfg = json.load(f)
        except Exception:
            cfg = {}
    if cli_site:
        cfg["site"] = cli_site
    if not cfg.get("site"):
        print("First-time setup")
        print("Paste the address of your stream site, e.g. https://my-screenstream.onrender.com")
        cfg["site"] = input("> ").strip()
    cfg["site"] = cfg["site"].rstrip("/")
    with open(CONFIG_PATH, "w", encoding="utf-8") as f:
        json.dump(cfg, f, indent=2)
    return cfg


def origin_allowed(origin, site):
    if not origin:
        return False
    origin = origin.rstrip("/")
    if origin == site:
        return True
    # Local testing: http://localhost:<port> or http://127.0.0.1:<port>
    for local in ("http://localhost", "http://127.0.0.1"):
        if origin == local or origin.startswith(local + ":"):
            return True
    return False


# ---------------------------------------------------------------- input
class DryRunInput:
    def __init__(self):
        self.monitors = [{"i": 1, "left": 0, "top": 0, "w": 1920, "h": 1080, "primary": True}]
        self.monitor = self.monitors[0]

    def apply(self, msg):
        print("event:", msg, flush=True)

    def release_all(self):
        print("release all", flush=True)


class RealInput:
    def __init__(self):
        import mss
        from pynput import keyboard, mouse

        self.Key, self.KeyCode, self.Button = keyboard.Key, keyboard.KeyCode, mouse.Button
        self.kb, self.mouse = keyboard.Controller(), mouse.Controller()
        with mss.mss() as sct:
            mons = sct.monitors[1:]
        self.monitors = [
            {"i": n + 1, "left": m["left"], "top": m["top"], "w": m["width"], "h": m["height"],
             "primary": m["left"] == 0 and m["top"] == 0}
            for n, m in enumerate(mons)
        ]
        if not any(m["primary"] for m in self.monitors) and self.monitors:
            self.monitors[0]["primary"] = True
        self.monitor = next(m for m in self.monitors if m["primary"])
        self.held_keys, self.held_buttons = set(), set()
        self.buttons = {"l": self.Button.left, "m": self.Button.middle, "r": self.Button.right}
        self._build_keymap()

    def _build_keymap(self):
        K = self.Key
        special = {
            "Enter": "enter", "NumpadEnter": "enter", "Backspace": "backspace", "Tab": "tab",
            "Escape": "esc", "Space": "space", "ArrowUp": "up", "ArrowDown": "down",
            "ArrowLeft": "left", "ArrowRight": "right", "ShiftLeft": "shift_l", "ShiftRight": "shift_r",
            "ControlLeft": "ctrl_l", "ControlRight": "ctrl_r", "AltLeft": "alt_l", "AltRight": "alt_r",
            "MetaLeft": "cmd_l", "MetaRight": "cmd_r", "OSLeft": "cmd_l", "OSRight": "cmd_r",
            "CapsLock": "caps_lock", "Delete": "delete", "Insert": "insert", "Home": "home",
            "End": "end", "PageUp": "page_up", "PageDown": "page_down", "PrintScreen": "print_screen",
            "ScrollLock": "scroll_lock", "Pause": "pause", "NumLock": "num_lock", "ContextMenu": "menu",
            "AudioVolumeUp": "media_volume_up", "AudioVolumeDown": "media_volume_down",
            "AudioVolumeMute": "media_volume_mute", "MediaPlayPause": "media_play_pause",
            "MediaTrackNext": "media_next", "MediaTrackPrevious": "media_previous",
        }
        for i in range(1, 21):
            special[f"F{i}"] = f"f{i}"
        self.keymap = {}
        for code, name in special.items():
            k = getattr(K, name, None)
            if k is not None:
                self.keymap[code] = k

        win = sys.platform == "win32"
        vk = self.KeyCode.from_vk
        ch = self.KeyCode.from_char
        # Letters and digits by physical position
        for c in "ABCDEFGHIJKLMNOPQRSTUVWXYZ":
            self.keymap[f"Key{c}"] = vk(ord(c)) if win else ch(c.lower())
        for d in "0123456789":
            self.keymap[f"Digit{d}"] = vk(ord(d)) if win else ch(d)
        # Punctuation (Windows virtual-key codes, US layout positions)
        punct = {
            "Minus": (0xBD, "-"), "Equal": (0xBB, "="), "BracketLeft": (0xDB, "["),
            "BracketRight": (0xDD, "]"), "Backslash": (0xDC, "\\"), "Semicolon": (0xBA, ";"),
            "Quote": (0xDE, "'"), "Backquote": (0xC0, "`"), "Comma": (0xBC, ","),
            "Period": (0xBE, "."), "Slash": (0xBF, "/"), "IntlBackslash": (0xE2, "\\"),
            "NumpadAdd": (0x6B, "+"), "NumpadSubtract": (0x6D, "-"), "NumpadMultiply": (0x6A, "*"),
            "NumpadDivide": (0x6F, "/"), "NumpadDecimal": (0x6E, "."),
        }
        for n in range(10):
            punct[f"Numpad{n}"] = (0x60 + n, str(n))
        for code, (v, c) in punct.items():
            self.keymap[code] = vk(v) if win else ch(c)

    def _key(self, msg):
        k = self.keymap.get(msg.get("code"))
        if k is None:
            key = msg.get("key") or ""
            if len(key) == 1:
                k = self.KeyCode.from_char(key)
        return k

    def _pos(self, msg):
        m = self.monitor
        x = min(max(float(msg["x"]), 0.0), 1.0)
        y = min(max(float(msg["y"]), 0.0), 1.0)
        return (int(m["left"] + x * (m["w"] - 1)), int(m["top"] + y * (m["h"] - 1)))

    def apply(self, msg):
        t = msg.get("t")
        if t == "m":
            self.mouse.position = self._pos(msg)
        elif t == "d":
            b = self.buttons.get(msg.get("b"), self.Button.left)
            self.mouse.press(b)
            self.held_buttons.add(b)
        elif t == "u":
            b = self.buttons.get(msg.get("b"), self.Button.left)
            self.mouse.release(b)
            self.held_buttons.discard(b)
        elif t == "w":
            self.mouse.scroll(int(msg.get("dx", 0)), int(msg.get("dy", 0)))
        elif t == "kd":
            k = self._key(msg)
            if k is not None:
                self.kb.press(k)
                self.held_keys.add(k)
        elif t == "ku":
            k = self._key(msg)
            if k is not None:
                self.kb.release(k)
                self.held_keys.discard(k)
        elif t == "release":
            self.release_all()

    def release_all(self):
        for k in list(self.held_keys):
            try:
                self.kb.release(k)
            except Exception:
                pass
        for b in list(self.held_buttons):
            try:
                self.mouse.release(b)
            except Exception:
                pass
        self.held_keys.clear()
        self.held_buttons.clear()


# ---------------------------------------------------------------- server
async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--site", help="Your stream site address, e.g. https://xyz.onrender.com")
    ap.add_argument("--dry-run", action="store_true", help="Print events instead of moving the mouse")
    args = ap.parse_args()

    cfg = load_config(args.site)
    inp = DryRunInput() if args.dry_run else RealInput()

    def check_origin(connection, request):
        origin = request.headers.get("Origin")
        if not origin_allowed(origin, cfg["site"]):
            print(f"Blocked connection from {origin!r}", flush=True)
            return Response(403, "Forbidden", Headers(), b"Origin not allowed\n")
        return None

    async def handler(ws):
        print("Host page connected - remote control available when you allow a viewer.", flush=True)
        await ws.send(json.dumps({"t": "monitors", "list": [
            {k: m[k] for k in ("i", "w", "h", "primary")} for m in inp.monitors]}))
        try:
            async for raw in ws:
                try:
                    msg = json.loads(raw)
                except ValueError:
                    continue
                if msg.get("t") == "monitor":
                    found = next((m for m in inp.monitors if m["i"] == msg.get("i")), None)
                    if found:
                        inp.monitor = found
                        print(f"Controlling monitor {found['i']} ({found['w']}x{found['h']})", flush=True)
                    continue
                try:
                    inp.apply(msg)
                except Exception as e:  # never crash on a bad event
                    print("input error:", e, flush=True)
        finally:
            inp.release_all()
            print("Host page disconnected.", flush=True)

    async with serve(handler, "127.0.0.1", PORT, process_request=check_origin, max_size=64 * 1024):
        print(f"ScreenStream control helper running for {cfg['site']}")
        print("Keep this window open while streaming. Close it to block all remote control.\n", flush=True)
        await asyncio.Future()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
    except OSError as e:
        if getattr(e, "errno", None) in (98, 10048):
            print("The control helper is already running in another window.")
        else:
            raise
