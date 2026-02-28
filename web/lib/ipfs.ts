const API = (process.env.IPFS_API_URL ?? 'http://localhost:5001').replace(/\/$/, '')
const MFS_CHAT_DIR = '/ipfs-chat'

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

/** Write a message JSON to a shared MFS path so all machines on the same IPFS node can read it. */
export async function mfsWriteMessage(channel: string, filename: string, post: object): Promise<void> {
  const path = `${MFS_CHAT_DIR}/${channel}/${filename}`
  const form = new FormData()
  form.append('file', new Blob([JSON.stringify(post)], { type: 'application/json' }), 'post.json')
  const resp = await fetch(
    `${API}/api/v0/files/write?arg=${encodeURIComponent(path)}&create=true&parents=true`,
    { method: 'POST', body: form }
  )
  if (!resp.ok) throw new Error(`MFS write failed: ${resp.status}`)
}

/** List all message filenames in the MFS channel directory. Returns [] if directory doesn't exist yet. */
export async function mfsListMessages(channel: string): Promise<{ name: string }[]> {
  const path = `${MFS_CHAT_DIR}/${channel}`
  const resp = await fetch(
    `${API}/api/v0/files/ls?arg=${encodeURIComponent(path)}`,
    { method: 'POST' }
  )
  if (!resp.ok) return []
  const data = await resp.json()
  return (data.Entries ?? []) as { name: string }[]
}

/** Read the raw JSON content of a message file from MFS. */
export async function mfsReadMessage(channel: string, filename: string): Promise<string> {
  const path = `${MFS_CHAT_DIR}/${channel}/${filename}`
  const resp = await fetch(
    `${API}/api/v0/files/read?arg=${encodeURIComponent(path)}`,
    { method: 'POST' }
  )
  if (!resp.ok) throw new Error(`MFS read failed: ${resp.status}`)
  return resp.text()
}
