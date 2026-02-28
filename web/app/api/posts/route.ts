import { NextRequest, NextResponse } from 'next/server'
import store from '@/lib/store'
import { uploadJSON } from '@/lib/ipfs'

export async function GET(request: NextRequest) {
  const channel = request.nextUrl.searchParams.get('channel') ?? 'general'
  return NextResponse.json(store.getByChannel(channel))
}

export async function POST(request: NextRequest) {
  const { author, content, channel } = await request.json()

  if (!author?.trim() || !content?.trim() || !channel?.trim()) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const post = { author, content, channel, timestamp: Date.now() }

  let cid: string
  try {
    cid = await uploadJSON(post)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 502 })
  }

  const stored = { ...post, cid }
  store.add(stored)

  return NextResponse.json(stored, { status: 201 })
}
