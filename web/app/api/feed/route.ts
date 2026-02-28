import { NextRequest } from 'next/server'
import store, { type Post } from '@/lib/store'
import { pubsubSubscribe } from '@/lib/ipfs'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const channel = request.nextUrl.searchParams.get('channel') ?? 'general'
  const topic = `ipfs-chat:${channel}`
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const ipfsAbort = new AbortController()

      request.signal.addEventListener('abort', () => {
        ipfsAbort.abort()
        try { controller.close() } catch {}
      })

      try {
        // Primary: subscribe to IPFS pubsub on the shared EC2 node.
        // This delivers messages posted by ANY user connected to the same IPFS API.
        for await (const raw of pubsubSubscribe(topic, ipfsAbort.signal)) {
          try {
            const post = JSON.parse(raw) as Post
            store.add(post) // populate local store (deduped) for GET /api/posts history
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(post)}\n\n`))
          } catch {
            // skip malformed pubsub messages
          }
        }
      } catch (err: any) {
        if (ipfsAbort.signal.aborted) return // normal browser disconnect

        // Fallback: pubsub unavailable (daemon not started with --enable-pubsub-experiment).
        // Fall back to local in-memory EventEmitter — works for single-machine dev.
        console.warn('IPFS pubsub unavailable, falling back to local EventEmitter:', err?.message)

        const onPost = (post: Post) => {
          if (post.channel === channel) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(post)}\n\n`))
          }
        }
        store.on('post', onPost)
        request.signal.addEventListener('abort', () => {
          store.off('post', onPost)
          try { controller.close() } catch {}
        })
      }
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
