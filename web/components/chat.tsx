'use client'

import { useState, useEffect } from 'react'
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

  // SSE: stream new posts in real-time
  useEffect(() => {
    const es = new EventSource(`/api/feed?channel=${encodeURIComponent(channel)}`)
    es.onmessage = (e) => setPosts((prev) => [...prev, JSON.parse(e.data) as Post])
    return () => es.close()
  }, [channel])

  const saveUsername = (name: string) => {
    localStorage.setItem('ipfs-social-name', name)
    setUsername(name)
  }

  const send = async (text: string) => {
    if (!text || sending || !username) return
    setSending(true)
    try {
      await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: username, content: text, channel }),
      })
    } catch {
      // silently fail — SSE will not deliver the message, user will notice
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
          onSend={send}
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
