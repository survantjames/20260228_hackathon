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

export async function uploadFile(file: File): Promise<string> {
  const form = new FormData()
  form.append('file', file, file.name)

  const resp = await fetch(`${API}/api/v0/add`, { method: 'POST', body: form })
  if (!resp.ok) throw new Error(`IPFS file upload failed: ${resp.status}`)

  const result = await resp.json()
  return result.Hash as string
}

/** Publish a message to an IPFS pubsub topic (shared across all nodes connected to the same IPFS API). */
export async function pubsubPublish(topic: string, data: object): Promise<void> {
  const payload = JSON.stringify(data)
  const resp = await fetch(
    `${API}/api/v0/pubsub/pub?arg=${encodeURIComponent(topic)}`,
    {
      method: 'POST',
      body: payload,
      headers: { 'Content-Type': 'text/plain' },
    }
  )
  if (!resp.ok) throw new Error(`IPFS pubsub publish failed: ${resp.status}`)
}

/**
 * Subscribe to an IPFS pubsub topic.
 * Yields decoded message strings as they arrive.
 * Stops when the provided AbortSignal fires.
 */
export async function* pubsubSubscribe(
  topic: string,
  signal: AbortSignal
): AsyncGenerator<string> {
  const resp = await fetch(
    `${API}/api/v0/pubsub/sub?arg=${encodeURIComponent(topic)}`,
    { method: 'POST', signal }
  )
  if (!resp.ok) throw new Error(`IPFS pubsub subscribe failed: ${resp.status}`)

  const reader = resp.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop()!

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed) continue
        try {
          const msg = JSON.parse(trimmed)
          // IPFS pubsub data is base64url encoded
          yield Buffer.from(msg.data, 'base64url').toString('utf-8')
        } catch {
          // skip malformed lines
        }
      }
    }
  } finally {
    reader.cancel().catch(() => {})
  }
}
