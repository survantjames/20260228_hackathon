import { NextRequest } from 'next/server'
import store, { type Post } from '@/lib/store'
import { mfsListMessages, mfsReadMessage } from '@/lib/ipfs'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const channel = request.nextUrl.searchParams.get('channel') ?? 'general'
  const encoder = new TextEncoder()
  const seen = new Set<string>()

  const stream = new ReadableStream({
    async start(controller) {
      // Local EventEmitter — gives the sender immediate feedback without waiting for the next poll
      const onPost = (post: Post) => {
        if (post.channel !== channel || seen.has(post.cid)) return
        seen.add(post.cid)
        try { controller.enqueue(encoder.encode(`data: ${JSON.stringify(post)}\n\n`)) } catch {}
      }
      store.on('post', onPost)

      // Snapshot existing MFS entries so we don't re-deliver history that GET /api/posts already returned
      try {
        const existing = await mfsListMessages(channel)
        for (const { name } of existing) {
          const cid = name.slice(name.indexOf('-') + 1)
          seen.add(cid)
        }
      } catch {}

      // Poll MFS every 2 seconds — picks up messages written by other machines
      while (!request.signal.aborted) {
        await new Promise<void>(resolve => {
          const timer = setTimeout(resolve, 2000)
          request.signal.addEventListener('abort', () => { clearTimeout(timer); resolve() }, { once: true })
        })
        if (request.signal.aborted) break

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
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(post)}\n\n`))
            } catch {}
          }
        } catch (err) {
          console.warn('MFS poll error:', err)
        }
      }

      store.off('post', onPost)
      try { controller.close() } catch {}
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  })
}
