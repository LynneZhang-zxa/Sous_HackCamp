# Local voice recovery

## Confirmed findings

- The running application had no `PUBLIC_BASE` and no HTTPS ngrok tunnel. New calls therefore had no custom step/timer tools. The connected voice agent had no stored tools either. This is a confirmed configuration gap; it is not proof that every instance of missing speech was caused by it.
- Playback acknowledgements now wait only for audio preceding their mark, in order. Later chunks cannot indefinitely hold an earlier turn's acknowledgement. Reconnection clears old marks and playhead state; old audio-context callbacks cannot acknowledge a new call's marks.
- Recoverable provider protocol errors no longer tear down the socket automatically. Suspended output has a visible error and a **Resume audio** action that resumes the existing call rather than creating another one.

## Restricted temporary HTTPS tool relay

The user approved a temporary public relay. `scripts/voice-tools-relay.mjs` listens only on local port 3002 and can run official `cloudflared`. The tunnel points to this relay, **not** the Next.js server:

- `POST /api/tools` requires session and secret headers, then forwards to the existing authenticated route on port 3000.
- `GET /health` returns a non-secret relay instance identifier for discovery.
- Other paths/methods, including `/`, `/.env.local` and `/api/call/start`, are rejected.
- Tool request bodies are bounded and forwarded with a timeout. Headers and credentials are not logged.

Once the HTTPS health check succeeds, the script writes ignored `.voice-tunnel.local.json`. `resolvePublicBase()` accepts it only while the matching local relay instance is alive. Existing `PUBLIC_BASE` and ngrok behavior remain supported. No API key is written into the relay metadata or tunnel command.

Start when needed (requires the official cloudflared executable):

```sh
node scripts/voice-tools-relay.mjs
```

If cloudflared is outside PATH, set `CLOUDFLARED_BIN` to that executable. The current session uses `/private/tmp/sous-cloudflared/cloudflared`; that temporary binary is not a committed dependency. Stop the relay with Ctrl+C. A quick-tunnel hostname changes on restart, so start/reconnect the voice call after the relay is ready. It is a development aid, not permanent hosting. See [Cloudflare's official Quick Tunnel documentation](https://developers.cloudflare.com/tunnel/get-started/quick-tunnels/).

## Verification

- Public requests to `/` and `/.env.local`: 404.
- Public tool POST without credentials: 401.
- Public tool POST with an independent test session's credentials: 200, returning that recipe's correct current instruction. This was a non-voice session; no ALEBEX call was started.
- `npm test`: 17 files / 682 tests passed.
- `node --import tsx scripts/microphone-ui.mjs`: real Chrome AudioWorklet, fake microphone and local mocked WebSocket passed. Includes continuous capture, mute/unmute, same-call microphone reconnection, three consecutive response turns, interruption and recovery of suspended playback. Five completion marks were correctly echoed; no acknowledgement preceded playback completion. Zero paid external calls.
- Production build passed with Next.js16.4.5.

Real user microphone acoustics, speech recognition and multi-turn provider behavior still require the user's live retry. If recognition stops while the signal bar is moving, record the displayed connection/error state and whether the latest user transcript appears; local capture is not itself proof of provider recognition. Do not start automatic replacement paid calls as a watchdog.
