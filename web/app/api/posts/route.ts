import { NextRequest, NextResponse } from 'next/server'
import store from '@/lib/store'
import { uploadJSON, pubsubPublish } from '@/lib/ipfs'

export async function GET(request: NextRequest) {
  const channel = request.nextUrl.searchParams.get('channel') ?? 'general'
  return NextResponse.json(store.getByChannel(channel))
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

  // Store locally (deduped by CID) and publish to shared IPFS pubsub.
  // All other dev servers subscribed to the same EC2 IPFS node will receive this.
  store.add(stored)
  pubsubPublish(`ipfs-chat:${channel}`, stored).catch(err =>
    console.warn('pubsub publish failed (pubsub may not be enabled):', err)
  )

  return NextResponse.json(stored, { status: 201 })
}
