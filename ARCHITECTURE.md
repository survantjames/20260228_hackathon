# IPFS Social — Architecture

## Goal
A decentralized social media / chat app where all content is stored on IPFS.
Discord-like UI: channels in a sidebar, real-time messages, CID permalinks.

## Stack
- **Frontend**: Next.js 16 (App Router) + Tailwind v4
- **Content store**: IPFS node (HTTP API on :5001, gateway on :8080)
- **Post index**: In-memory singleton (swap for Vercel KV in production)
- **Real-time**: Server-Sent Events (SSE)

## Data Flow

```
User types message
      ↓
POST /api/posts  { author, content, channel }
      ↓
Upload JSON post to IPFS  →  get CID back
      ↓
Store { cid, author, content, channel, timestamp } in PostStore
      ↓
PostStore emits 'post' event
      ↓
All open SSE connections for that channel push the post to browsers
      ↓
Clients append to message list
```

## Content Model

Every post is a JSON file stored on IPFS:
```json
{
  "author": "alice",
  "content": "Hello world",
  "channel": "general",
  "timestamp": 1712345678901
}
```

The CID is the immutable permalink. Anyone can reconstruct the feed from CIDs alone.

## File Structure

```
web/
├── app/
│   ├── page.tsx                  → redirect to /channel/general
│   ├── channel/[name]/page.tsx   → channel shell (server component)
│   └── api/
│       ├── posts/route.ts        → GET (list) + POST (create + upload to IPFS)
│       ├── feed/route.ts         → SSE stream of new posts per channel
│       └── upload/route.ts       → raw file upload (kept from v1)
├── components/
│   └── chat.tsx                  → full chat UI (client component)
└── lib/
    ├── store.ts                  → in-memory PostStore + EventEmitter
    └── ipfs.ts                   → IPFS upload + gateway URL helpers
```

## Environment Variables

| Variable | Default | Notes |
|----------|---------|-------|
| `IPFS_API_URL` | `http://localhost:5001` | Server-only. Your IPFS node's HTTP API. |
| `NEXT_PUBLIC_IPFS_GATEWAY` | `http://localhost:8080` | Exposed to browser. Used for CID permalinks. |

Set in `.env.local`:
```
IPFS_API_URL=http://<your-ec2-ip>:5001
NEXT_PUBLIC_IPFS_GATEWAY=http://<your-ec2-ip>:8080
```

## Channels
Hardcoded default channels: `general`, `random`, `media`
Easy to extend: add to the `CHANNELS` array in `components/chat.tsx`.

## Identity
Username stored in `localStorage` under `ipfs-social-name`.
Set via the user panel in the bottom-left of the sidebar.
No auth — anyone can use any name (hackathon scope).

## Production Path (post-hackathon)
- Replace `lib/store.ts` in-memory store with **Vercel KV** (Redis)
- Replace SSE emitter with **Pusher / Ably** for multi-instance real-time
- Add wallet-based identity (SIWE / Sign-In With Ethereum) for authentic authorship
- Use **OrbitDB** on top of IPFS for fully decentralized indexing
