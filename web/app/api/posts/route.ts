import { NextRequest, NextResponse } from 'next/server'
import store from '@/lib/store'
import { uploadJSON, mfsWriteMessage, mfsListMessages, mfsReadMessage } from '@/lib/ipfs'
import type { Post } from '@/lib/store'

export async function GET(request: NextRequest) {
  const channel = request.nextUrl.searchParams.get('channel') ?? 'general'
  try {
    const entries = await mfsListMessages(channel)
    // allSettled: a single bad read never wipes out all history
    const results = await Promise.allSettled(
      entries.map(async ({ name }) => {
        const raw = await mfsReadMessage(channel, name)
        return JSON.parse(raw) as Post
      })
    )
    const posts = results
      .filter((r): r is PromiseFulfilledResult<Post> => r.status === 'fulfilled')
      .map(r => r.value)
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-200)

    // Seed in-memory store so same-instance SSE polling deduplicates correctly
    for (const post of posts) store.add(post)

    return NextResponse.json(posts)
  } catch (err) {
    // mfsListMessages threw — IPFS is genuinely unreachable
    console.error('History load failed:', err)
    // Return whatever is in the warm in-memory store (non-empty if this instance
    // already served a successful load) rather than an empty array
    return NextResponse.json(store.getByChannel(channel))
  }
}

export async function POST(request: NextRequest) {
  const { author, content, channel, imageCid } = await request.json()

  if (!author?.trim() || !content?.trim() || !channel?.trim()) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const post = { author, content, channel, timestamp: Date.now(), ...(imageCid ? { imageCid } : {}) }

  let cid: string
  try {
    cid = await uploadJSON(post)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 502 })
  }

  const stored = { ...post, cid }

  // Write to shared MFS *before* emitting — ensures message survives refresh
  const filename = `${post.timestamp}-${cid}`
  try {
    await mfsWriteMessage(channel, filename, stored)
  } catch (err) {
    console.warn('MFS write failed:', err)
    // Non-fatal: still deliver via in-memory store so the sender sees it
  }

  store.add(stored)

  return NextResponse.json(stored, { status: 201 })
}
