import { NextRequest } from 'next/server'
import store, { type Post } from '@/lib/store'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const channel = request.nextUrl.searchParams.get('channel') ?? 'general'
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      const onPost = (post: Post) => {
        if (post.channel === channel) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(post)}\n\n`))
        }
      }

      store.on('post', onPost)

      request.signal.addEventListener('abort', () => {
        store.off('post', onPost)
        controller.close()
      })
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
