import { NextRequest, NextResponse } from 'next/server'
import { uploadFile } from '@/lib/ipfs'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const MAX_BYTES = 10 * 1024 * 1024 // 10 MB
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File too large (max 10 MB)' }, { status: 413 })
  }

  try {
    const cid = await uploadFile(file)
    return NextResponse.json({ cid })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 502 })
  }
}
