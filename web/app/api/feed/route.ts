import { NextRequest } from 'next/server'
import store, { type Post } from '@/lib/store'
import { mfsListMessages, mfsReadMessage } from '@/lib/ipfs'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const POLL_INTERVAL = 2_000    // MFS poll every 2s
const HEARTBEAT_INTERVAL = 15_000  // keep-alive comment every 15s
const MAX_DURATION = 50_000    // graceful close before Vercel function timeout; client auto-reconnects

export async function GET(request: NextRequest) {
  const channel = request.nextUrl.searchParams.get('channel') ?? 'general'
  const encoder = new TextEncoder()
  const seen = new Set<string>()

  const stream = new ReadableStream({
    async start(controller) {
      const enqueue = (data: string) => {
        try { controller.enqueue(encoder.encode(data)) } catch {}
      }

      // Local EventEmitter — same-process fast path (works in dev, not on multi-instance Vercel)
      const onPost = (post: Post) => {
        if (post.channel !== channel || seen.has(post.cid)) return
        seen.add(post.cid)
        enqueue(`data: ${JSON.stringify(post)}\n\n`)
      }
      store.on('post', onPost)

      // Snapshot existing MFS entries so we don't re-deliver history
      try {
        const existing = await mfsListMessages(channel)
        for (const { name } of existing) seen.add(name.slice(name.indexOf('-') + 1))
      } catch {}

      // Send initial heartbeat so the browser knows the connection is alive
      enqueue(': heartbeat\n\n')

      const startTime = Date.now()
      let lastHeartbeat = Date.now()

      while (!request.signal.aborted && Date.now() - startTime < MAX_DURATION) {
        await new Promise<void>(resolve => {
          const timer = setTimeout(resolve, POLL_INTERVAL)
          request.signal.addEventListener('abort', () => { clearTimeout(timer); resolve() }, { once: true })
        })
        if (request.signal.aborted) break

        // Keep-alive heartbeat
        if (Date.now() - lastHeartbeat >= HEARTBEAT_INTERVAL) {
          enqueue(': heartbeat\n\n')
          lastHeartbeat = Date.now()
        }

        // Poll MFS for messages from other machines
        try {
          const entries = await mfsListMessages(channel)
          for (const { name } of entries) {
            const cid = name.slice(name.indexOf('-') + 1)
            if (seen.has(cid)) continue
            try {
              const raw = await mfsReadMessage(channel, name)
              const post = JSON.parse(raw) as Post
              store.add(post)
              seen.add(cid)
              enqueue(`data: ${JSON.stringify(post)}\n\n`)
            } catch {}
          }
        } catch (err) {
          console.warn('MFS poll error:', err)
        }
      }

      store.off('post', onPost)
      // Send retry hint so client reconnects quickly after our graceful close
      enqueue('retry: 1000\n\n')
      try { controller.close() } catch {}
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
      'Connection': 'keep-alive',
    },
  })
}
