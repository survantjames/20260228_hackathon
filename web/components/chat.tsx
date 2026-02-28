'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

const CHANNELS = ['general', 'random', 'media']

const GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY ?? 'http://localhost:8080'

const AVATAR_COLORS = [
  '#5865f2', '#eb459e', '#57f287', '#fee75c', '#ed4245', '#00b0f4',
]

function avatarColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

interface Post {
  cid: string
  author: string
  channel: string
  content: string
  timestamp: number
}

function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
      style={{ width: size, height: size, background: avatarColor(name), fontSize: size * 0.4 }}
    >
      {name[0]?.toUpperCase() ?? '?'}
    </div>
  )
}

function MessageGroup({ posts, isOwn }: { posts: Post[]; isOwn: boolean }) {
  const first = posts[0]
  const time = new Date(first.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="group flex gap-4 px-4 pt-4 pb-0.5 hover:bg-white/[0.025]">
      <Avatar name={first.author} />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span
            className="text-sm font-semibold"
            style={{ color: isOwn ? '#c9b8ff' : '#fff' }}
          >
            {first.author}
          </span>
          <span className="text-xs" style={{ color: '#80848e' }}>{time}</span>
        </div>
        {posts.map(post => (
          <div key={post.cid} className="group/msg relative">
            <p className="text-sm leading-relaxed break-words" style={{ color: '#dbdee1' }}>
              {post.content}
            </p>
            <a
              href={`${GATEWAY}/ipfs/${post.cid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono opacity-0 group-hover/msg:opacity-100 transition-opacity mt-0.5 block"
              style={{ color: '#4e9ae8' }}
            >
              ipfs://{post.cid.slice(0, 24)}…
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Chat({ channel }: { channel: string }) {
  const [posts, setPosts] = useState<Post[]>([])
  const [input, setInput] = useState('')
  const [username, setUsername] = useState('')
  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load username from localStorage
  useEffect(() => {
    setUsername(localStorage.getItem('ipfs-social-name') ?? '')
  }, [])

  // Fetch initial posts for this channel
  useEffect(() => {
    setPosts([])
    fetch(`/api/posts?channel=${encodeURIComponent(channel)}`)
      .then(r => r.json())
      .then(data => Array.isArray(data) && setPosts(data))
  }, [channel])

  // SSE: stream new posts in real-time
  useEffect(() => {
    const es = new EventSource(`/api/feed?channel=${encodeURIComponent(channel)}`)
    es.onmessage = e => setPosts(prev => [...prev, JSON.parse(e.data) as Post])
    return () => es.close()
  }, [channel])

  // Auto-scroll to newest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [posts])

  const saveName = () => {
    const name = nameDraft.trim()
    if (name) {
      localStorage.setItem('ipfs-social-name', name)
      setUsername(name)
    }
    setEditingName(false)
  }

  const send = async () => {
    const text = input.trim()
    if (!text || sending || !username) return
    setSending(true)
    setInput('')
    try {
      await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: username, content: text, channel }),
      })
    } catch {
      setInput(text) // restore on failure
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  // Group consecutive messages from the same author (within 5 min)
  const groups: Post[][] = []
  for (const post of posts) {
    const last = groups[groups.length - 1]
    if (
      last &&
      last[0].author === post.author &&
      post.timestamp - last[last.length - 1].timestamp < 5 * 60 * 1000
    ) {
      last.push(post)
    } else {
      groups.push([post])
    }
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#313338' }}>
      {/* ── Sidebar ── */}
      <div
        className="w-60 flex flex-col flex-shrink-0 overflow-hidden"
        style={{ background: '#2b2d31' }}
      >
        {/* Server name */}
        <div
          className="flex items-center px-4 h-12 flex-shrink-0 font-semibold text-white shadow-md"
          style={{ borderBottom: '1px solid #1e1f22' }}
        >
          IPFS Social
        </div>

        {/* Channel list */}
        <div className="flex-1 overflow-y-auto px-2 py-3">
          <p
            className="px-2 mb-1 text-xs font-semibold uppercase tracking-wider"
            style={{ color: '#949ba4' }}
          >
            Channels
          </p>
          {CHANNELS.map(ch => (
            <Link
              key={ch}
              href={`/channel/${ch}`}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded text-sm mb-0.5 transition-colors"
              style={{
                background: ch === channel ? 'rgba(255,255,255,0.1)' : undefined,
                color: ch === channel ? '#fff' : '#949ba4',
              }}
            >
              <span>#</span>
              <span>{ch}</span>
            </Link>
          ))}
        </div>

        {/* User panel */}
        <div
          className="flex-shrink-0 px-2 py-2"
          style={{ background: '#232428', borderTop: '1px solid #1e1f22' }}
        >
          {editingName ? (
            <div className="flex gap-1">
              <input
                autoFocus
                value={nameDraft}
                onChange={e => setNameDraft(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') saveName()
                  if (e.key === 'Escape') setEditingName(false)
                }}
                placeholder="Your name"
                className="flex-1 text-xs px-2 py-1.5 rounded focus:outline-none text-white"
                style={{ background: '#1e1f22' }}
              />
              <button
                onClick={saveName}
                className="text-xs px-2 py-1.5 rounded text-white font-medium"
                style={{ background: '#5865f2' }}
              >
                ✓
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setNameDraft(username); setEditingName(true) }}
              className="flex items-center gap-2 w-full rounded px-1 py-1 hover:bg-white/10 transition-colors text-left"
            >
              {username ? (
                <Avatar name={username} size={32} />
              ) : (
                <div
                  className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs"
                  style={{ background: '#4e5058' }}
                >
                  ?
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {username || 'Set your name'}
                </p>
                <p className="text-xs" style={{ color: '#949ba4' }}>click to edit</p>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* ── Main ── */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Channel header */}
        <div
          className="flex items-center gap-2 px-4 h-12 flex-shrink-0 shadow-sm"
          style={{ borderBottom: '1px solid #1e1f22', background: '#313338' }}
        >
          <span className="text-xl font-light" style={{ color: '#80848e' }}>#</span>
          <span className="font-semibold text-white">{channel}</span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-2">
          {groups.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center h-full select-none"
              style={{ color: '#80848e' }}
            >
              <div
                className="text-7xl font-black mb-4 flex items-center justify-center w-20 h-20 rounded-full"
                style={{ background: '#4e5058', color: '#dbdee1' }}
              >
                #
              </div>
              <p className="text-xl font-bold text-white mb-1">Welcome to #{channel}!</p>
              <p className="text-sm">This is the beginning of the #{channel} channel.</p>
            </div>
          ) : (
            groups.map(group => (
              <MessageGroup
                key={group[0].cid}
                posts={group}
                isOwn={group[0].author === username}
              />
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 pb-6 pt-2 flex-shrink-0">
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-lg"
            style={{ background: '#383a40' }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  send()
                }
              }}
              placeholder={
                username
                  ? `Message #${channel}`
                  : 'Set your name (bottom-left) to start chatting'
              }
              disabled={!username || sending}
              className="flex-1 bg-transparent text-sm focus:outline-none disabled:cursor-not-allowed"
              style={{ color: '#dbdee1' }}
            />
            {sending && (
              <div
                className="w-4 h-4 rounded-full border-2 animate-spin flex-shrink-0"
                style={{ borderColor: '#4e5058', borderTopColor: '#dbdee1' }}
              />
            )}
            <button
              onClick={send}
              disabled={!input.trim() || !username || sending}
              className="flex-shrink-0 transition-colors disabled:opacity-30"
              style={{ color: '#b5bac1' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
