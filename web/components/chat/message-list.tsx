"use client"

import { useRef, useEffect } from "react"
import { Hash, Globe, Zap } from "lucide-react"
import { MessageItem, type Post } from "./message-item"

interface MessageListProps {
  posts: Post[]
  username: string
  channel: string
}

function groupPosts(posts: Post[]): Post[][] {
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
  return groups
}

export function MessageList({ posts, username, channel }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [posts])

  const groups = groupPosts(posts)

  if (groups.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-8">
        <div className="flex max-w-sm flex-col items-center text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Hash className="h-8 w-8 text-primary" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-foreground">
            Welcome to #{channel}!
          </h2>
          <p className="mb-8 text-sm leading-relaxed text-muted-foreground">
            This is the beginning of the #{channel} channel. Messages are stored on IPFS.
          </p>
          <div className="grid w-full gap-3">
            {[
              { icon: Globe, title: "Stored on IPFS", desc: "Every message is pinned to the decentralized web" },
              { icon: Zap, title: "Real-time", desc: "Live updates via Server-Sent Events" },
            ].map((f) => (
              <div
                key={f.title}
                className="flex items-start gap-3 rounded-xl border border-border bg-card p-3.5 text-left"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <f.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-card-foreground">{f.title}</h3>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto py-4">
      {/* Date separator */}
      <div className="flex items-center gap-3 px-4 py-2">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[10px] font-medium text-muted-foreground">Today</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {groups.map((group) => (
        <MessageItem
          key={group[0].cid}
          posts={group}
          isOwn={group[0].author === username}
        />
      ))}

      <div ref={bottomRef} />
    </div>
  )
}
