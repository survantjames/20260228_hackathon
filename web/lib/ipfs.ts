const API = (process.env.IPFS_API_URL ?? 'http://localhost:5001').replace(/\/$/, '')

export async function uploadJSON(data: object): Promise<string> {
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
  const form = new FormData()
  form.append('file', blob, 'post.json')

  const resp = await fetch(`${API}/api/v0/add`, { method: 'POST', body: form })
  if (!resp.ok) throw new Error(`IPFS upload failed: ${resp.status}`)

  const result = await resp.json()
  return result.Hash as string
}
