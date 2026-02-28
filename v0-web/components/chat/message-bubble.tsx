"use client"

import {
  FileText,
  Download,
  Play,
  Pause,
  ExternalLink,
  ArrowUpRight,
  Image as ImageIcon,
  Gem,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Message, User } from "@/lib/chat-data"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useState } from "react"

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

const emojiMap: Record<string, string> = {
  fire: "\uD83D\uDD25",
  eyes: "\uD83D\uDC40",
  sparkles: "\u2728",
  thumbsup: "\uD83D\uDC4D",
  heart: "\u2764\uFE0F",
  rocket: "\uD83D\uDE80",
}

interface MessageBubbleProps {
  message: Message
  sender: User
  isOwn: boolean
  showAvatar: boolean
}

export function MessageBubble({
  message,
  sender,
  isOwn,
  showAvatar,
}: MessageBubbleProps) {
  return (
    <div
      className={cn(
        "group flex gap-2",
        isOwn ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div className="shrink-0 pt-1">
        {showAvatar ? (
          <Avatar className="h-7 w-7 border border-border">
            <AvatarFallback
              className={cn(
                "text-[9px] font-semibold",
                isOwn
                  ? "bg-primary text-primary-foreground"
                  : "bg-accent text-accent-foreground"
              )}
            >
              {getInitials(sender.name)}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="h-7 w-7" />
        )}
      </div>

      {/* Message body */}
      <div className={cn("flex max-w-[75%] flex-col gap-1", isOwn ? "items-end" : "items-start")}>
        {showAvatar && (
          <div className={cn("flex items-center gap-1.5 px-1", isOwn ? "flex-row-reverse" : "flex-row")}>
            <span className="text-[11px] font-medium text-foreground">{sender.name}</span>
            <span className="text-[10px] text-muted-foreground">
              {formatTimestamp(message.timestamp)}
            </span>
          </div>
        )}

        <div
          className={cn(
            "rounded-2xl px-3.5 py-2",
            isOwn
              ? "rounded-tr-sm bg-message-own text-message-own-foreground"
              : "rounded-tl-sm bg-message-other text-message-other-foreground"
          )}
        >
          <MessageContent message={message} isOwn={isOwn} />
        </div>

        {/* Reactions */}
        {message.reactions.length > 0 && (
          <div className="flex items-center gap-1 px-1">
            {message.reactions.map((reaction, i) => (
              <button
                key={i}
                className={cn(
                  "flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[11px] transition-colors",
                  reaction.reacted
                    ? "border-primary/30 bg-primary/10 text-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary/30"
                )}
              >
                <span>{emojiMap[reaction.emoji] || reaction.emoji}</span>
                <span className="text-[10px]">{reaction.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function MessageContent({ message, isOwn }: { message: Message; isOwn: boolean }) {
  switch (message.type) {
    case "text":
      return <p className="text-[13px] leading-relaxed">{message.content}</p>

    case "image":
      return (
        <div className="space-y-1.5">
          {message.content && (
            <p className="text-[13px] leading-relaxed">{message.content}</p>
          )}
          <div className="relative overflow-hidden rounded-lg">
            <div className="flex h-44 w-64 items-center justify-center bg-accent/50">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <ImageIcon className="h-8 w-8" />
                <span className="text-[11px]">Image attachment</span>
              </div>
            </div>
            <button className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-md bg-background/70 text-foreground backdrop-blur-sm transition-opacity hover:bg-background/90">
              <Download className="h-3 w-3" />
            </button>
          </div>
        </div>
      )

    case "file":
      return (
        <div className="space-y-1.5">
          {message.content && (
            <p className="text-[13px] leading-relaxed">{message.content}</p>
          )}
          <div
            className={cn(
              "flex items-center gap-3 rounded-lg border px-3 py-2.5",
              isOwn ? "border-primary-foreground/20" : "border-border"
            )}
          >
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                isOwn ? "bg-primary-foreground/15" : "bg-accent"
              )}
            >
              <FileText className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium">{message.fileName}</p>
              <p
                className={cn(
                  "text-[10px]",
                  isOwn ? "text-primary-foreground/60" : "text-muted-foreground"
                )}
              >
                {message.fileSize}
              </p>
            </div>
            <button
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors",
                isOwn
                  ? "hover:bg-primary-foreground/15"
                  : "hover:bg-accent"
              )}
              aria-label="Download file"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )

    case "voice":
      return <VoiceMessage message={message} isOwn={isOwn} />

    case "nft":
      return (
        <div className="space-y-1.5">
          {message.content && (
            <p className="text-[13px] leading-relaxed">{message.content}</p>
          )}
          <div
            className={cn(
              "overflow-hidden rounded-lg border",
              isOwn ? "border-primary-foreground/20" : "border-border"
            )}
          >
            <div className="flex h-36 w-56 items-center justify-center bg-accent/30">
              <Gem className="h-10 w-10 text-primary/50" />
            </div>
            <div className="p-2.5">
              <p className="text-xs font-semibold">{message.nftName}</p>
              <p
                className={cn(
                  "text-[10px]",
                  isOwn ? "text-primary-foreground/60" : "text-muted-foreground"
                )}
              >
                {message.nftCollection}
              </p>
              <button
                className={cn(
                  "mt-1.5 flex items-center gap-1 text-[10px] font-medium transition-colors",
                  isOwn ? "text-primary-foreground/80 hover:text-primary-foreground" : "text-primary hover:text-primary/80"
                )}
              >
                View on marketplace
                <ExternalLink className="h-2.5 w-2.5" />
              </button>
            </div>
          </div>
        </div>
      )

    case "transaction":
      return (
        <div className="space-y-1.5">
          {message.content && (
            <p className="text-[13px] leading-relaxed">{message.content}</p>
          )}
          <div
            className={cn(
              "flex items-center gap-3 rounded-lg border px-3 py-2.5",
              isOwn ? "border-primary-foreground/20" : "border-border"
            )}
          >
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                isOwn ? "bg-primary-foreground/15" : "bg-primary/10"
              )}
            >
              <ArrowUpRight className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold">
                {message.txAmount} {message.txToken}
              </p>
              <p
                className={cn(
                  "font-mono text-[10px]",
                  isOwn ? "text-primary-foreground/60" : "text-muted-foreground"
                )}
              >
                tx: {message.txHash}
              </p>
            </div>
            <button
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors",
                isOwn ? "hover:bg-primary-foreground/15" : "hover:bg-accent"
              )}
              aria-label="View transaction"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )

    default:
      return <p className="text-[13px] leading-relaxed">{message.content}</p>
  }
}

function VoiceMessage({ message, isOwn }: { message: Message; isOwn: boolean }) {
  const [playing, setPlaying] = useState(false)

  return (
    <div className="flex items-center gap-2.5">
      <button
        onClick={() => setPlaying(!playing)}
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors",
          isOwn ? "bg-primary-foreground/15 hover:bg-primary-foreground/25" : "bg-accent hover:bg-accent/80"
        )}
        aria-label={playing ? "Pause voice message" : "Play voice message"}
      >
        {playing ? (
          <Pause className="h-3.5 w-3.5" />
        ) : (
          <Play className="ml-0.5 h-3.5 w-3.5" />
        )}
      </button>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-0.5 rounded-full transition-colors",
                isOwn ? "bg-primary-foreground/40" : "bg-muted-foreground/40",
                playing && i < 8 && (isOwn ? "bg-primary-foreground" : "bg-foreground")
              )}
              style={{ height: `${Math.random() * 14 + 4}px` }}
            />
          ))}
        </div>
        <span
          className={cn(
            "text-[10px]",
            isOwn ? "text-primary-foreground/60" : "text-muted-foreground"
          )}
        >
          {message.voiceDuration}
        </span>
      </div>
    </div>
  )
}
