import { NextRequest, NextResponse } from 'next/server'

const GATEWAY = (process.env.NEXT_PUBLIC_IPFS_GATEWAY ?? 'http://localhost:8080').replace(/\/$/, '')

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ cid: string }> }
) {
  const { cid } = await params
  try {
    const upstream = await fetch(`${GATEWAY}/ipfs/${cid}`)
    if (!upstream.ok) {
      return new NextResponse('Not found', { status: 404 })
    }
    const contentType = upstream.headers.get('content-type') ?? 'application/octet-stream'
    const body = await upstream.arrayBuffer()
    return new NextResponse(body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return new NextResponse('Gateway error', { status: 502 })
  }
}
