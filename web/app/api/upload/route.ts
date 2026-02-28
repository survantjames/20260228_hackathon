import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('file') as File
  const apiUrlInput = formData.get('apiUrl') as string

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const apiUrl = (apiUrlInput || process.env.IPFS_API_URL || 'http://localhost:5001').replace(/\/$/, '')

  const ipfsForm = new FormData()
  ipfsForm.append('file', file, file.name)

  let resp: Response
  try {
    resp = await fetch(`${apiUrl}/api/v0/add`, {
      method: 'POST',
      body: ipfsForm,
    })
  } catch {
    return NextResponse.json({ error: `Cannot reach IPFS node at ${apiUrl}` }, { status: 502 })
  }

  if (!resp.ok) {
    return NextResponse.json({ error: `IPFS API returned ${resp.status}` }, { status: 502 })
  }

  const result = await resp.json()
  const cid: string = result.Hash
  const size: string = result.Size

  const host = new URL(apiUrl).hostname
  const gatewayUrl = `http://${host}:8080/ipfs/${cid}?filename=${encodeURIComponent(file.name)}`

  const qrDataUrl = await QRCode.toDataURL(gatewayUrl, { width: 256, margin: 2 })

  return NextResponse.json({ cid, size, gatewayUrl, qrDataUrl })
}
