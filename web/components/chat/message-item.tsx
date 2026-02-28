"use client"

import { cn } from "@/lib/utils"

const GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY ?? "http://localhost:8080"

const AVATAR_COLORS = [
  "#5865f2", "#eb459e", "#57f287", "#fee75c", "#ed4245", "#00b0f4",
]

function avatarColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export interface Post {
  cid: string
  author: string
  channel: string
  content: string
  timestamp: number
  imageCid?: string
}

interface MessageItemProps {
  posts: Post[]
  isOwn: boolean
}

export function MessageItem({ posts, isOwn }: MessageItemProps) {
  const first = posts[0]

  return (
    <div className="group flex gap-2.5 px-4 py-2 hover:bg-accent/30 transition-colors rounded-lg mx-2">
      {/* Avatar */}
      <div className="shrink-0 pt-0.5">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-semibold text-white"
          style={{ background: avatarColor(first.author) }}
        >
          {getInitials(first.author)}
        </div>
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2 mb-1">
          <span
            className={cn(
              "text-xs font-semibold",
              isOwn ? "text-primary" : "text-foreground"
            )}
          >
            {first.author}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {formatTime(first.timestamp)}
          </span>
        </div>
        {posts.map((post) => (
          <div key={post.cid} className="group/msg">
            {post.content && (
              <p className="text-[13px] leading-relaxed text-message-other-foreground break-words">
                {post.content}
              </p>
            )}
            {post.imageCid && (
              <a
                href={`${GATEWAY}/ipfs/${post.imageCid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1.5 block"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${GATEWAY}/ipfs/${post.imageCid}`}
                  alt="attachment"
                  className="max-w-xs rounded-lg border border-border object-cover"
                  style={{ maxHeight: 300 }}
                />
              </a>
            )}
            <a
              href={`${GATEWAY}/ipfs/${post.cid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[10px] text-primary/60 opacity-0 group-hover/msg:opacity-100 transition-opacity mt-0.5 block hover:text-primary"
            >
              ipfs://{post.cid.slice(0, 28)}…
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
