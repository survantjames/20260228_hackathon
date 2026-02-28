'use client'

import { useState, useEffect, useRef } from 'react'
import { ChannelSidebar } from './chat/channel-sidebar'
import { ChannelHeader } from './chat/channel-header'
import { MessageList } from './chat/message-list'
import { MessageComposer } from './chat/message-composer'
import type { Post } from './chat/message-item'

const CHANNELS = ['general', 'random', 'media']

export default function Chat({ channel }: { channel: string }) {
  const [posts, setPosts] = useState<Post[]>([])
  const [username, setUsername] = useState('')
  const [sending, setSending] = useState(false)
  const closedRef = useRef(false)

  // Load username from localStorage
  useEffect(() => {
    setUsername(localStorage.getItem('ipfs-social-name') ?? '')
  }, [])

  // Fetch initial posts for this channel
  useEffect(() => {
    setPosts([])
    fetch(`/api/posts?channel=${encodeURIComponent(channel)}`)
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setPosts(data))
  }, [channel])

  // SSE: stream new posts in real-time, auto-reconnect on disconnect
  useEffect(() => {
    closedRef.current = false
    let es: EventSource | null = null
    let retryTimer: ReturnType<typeof setTimeout> | null = null

    const connect = () => {
      if (closedRef.current) return
      es = new EventSource(`/api/feed?channel=${encodeURIComponent(channel)}`)

      es.onmessage = (e) => {
        const post = JSON.parse(e.data) as Post
        setPosts((prev) => prev.some((p) => p.cid === post.cid) ? prev : [...prev, post])
      }

      es.onerror = () => {
        es?.close()
        es = null
        if (!closedRef.current) {
          retryTimer = setTimeout(connect, 3000)
        }
      }
    }

    connect()

    return () => {
      closedRef.current = true
      if (retryTimer) clearTimeout(retryTimer)
      es?.close()
    }
  }, [channel])

  const saveUsername = (name: string) => {
    localStorage.setItem('ipfs-social-name', name)
    setUsername(name)
  }

  const send = async (text: string, imageCid?: string) => {
    if ((!text && !imageCid) || sending || !username) return
    setSending(true)

    // Optimistic post — show immediately while the request is in-flight
    const tempCid = `optimistic-${Date.now()}-${Math.random().toString(36).slice(2)}`
    const optimisticPost: Post = {
      cid: tempCid,
      author: username,
      channel,
      content: text,
      timestamp: Date.now(),
      ...(imageCid ? { imageCid } : {}),
      pending: true,
    }
    setPosts((prev) => [...prev, optimisticPost])

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: username, content: text, channel, imageCid }),
      })
      if (res.ok) {
        const realPost = await res.json() as Post
        // Replace optimistic placeholder with confirmed post
        setPosts((prev) => prev.map((p) => p.cid === tempCid ? realPost : p))
      } else {
        setPosts((prev) => prev.filter((p) => p.cid !== tempCid))
      }
    } catch {
      setPosts((prev) => prev.filter((p) => p.cid !== tempCid))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background">
      {/* Sidebar */}
      <div className="h-full w-60 shrink-0 border-r border-border xl:w-72">
        <ChannelSidebar
          channel={channel}
          channels={CHANNELS}
          username={username}
          onSaveUsername={saveUsername}
        />
      </div>

      {/* Main chat */}
      <div className="flex h-full min-w-0 flex-1 flex-col">
        <ChannelHeader channel={channel} />
        <MessageList posts={posts} username={username} channel={channel} />
        <MessageComposer
          onSend={(text, imageCid) => send(text, imageCid)}
          disabled={!username}
          sending={sending}
          placeholder={
            username
              ? `Message #${channel}`
              : 'Set your name (bottom-left) to start chatting'
          }
        />
      </div>
    </div>
  )
}
