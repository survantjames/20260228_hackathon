"use client"

import { useState } from "react"
import { Search, Pin, Shield, Hash, Plus, Settings, ChevronDown } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { Conversation, User } from "@/lib/chat-data"

function getOtherUser(conversation: Conversation): User {
  return conversation.participants.find((p) => p.id !== "user-0")!
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

function formatTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  return `${days}d`
}

function truncateMessage(content: string, maxLength: number = 35): string {
  if (content.length <= maxLength) return content
  return content.slice(0, maxLength) + "..."
}

interface ConversationSidebarProps {
  conversations: Conversation[]
  activeConversationId: string | null
  onSelectConversation: (id: string) => void
  onClose?: () => void
}

export function ConversationSidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onClose,
}: ConversationSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<"all" | "unread" | "pinned">("all")

  const filtered = conversations.filter((conv) => {
    const user = getOtherUser(conv)
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.handle.toLowerCase().includes(searchQuery.toLowerCase())

    if (filter === "unread") return matchesSearch && conv.unreadCount > 0
    if (filter === "pinned") return matchesSearch && conv.pinned
    return matchesSearch
  })

  const pinnedConvs = filtered.filter((c) => c.pinned)
  const otherConvs = filtered.filter((c) => !c.pinned)

  return (
    <div className="flex h-full flex-col bg-sidebar">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Hash className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-sidebar-foreground">dChat</h1>
            <p className="text-[10px] font-mono text-muted-foreground">v0.3.1-beta</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
            aria-label="New conversation"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
            aria-label="Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 pb-2">
        <div className="flex items-center gap-2 rounded-lg bg-sidebar-accent px-3 py-2">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-xs text-sidebar-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-1 px-3 pb-3">
        {(["all", "unread", "pinned"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-md px-2.5 py-1 text-[11px] font-medium capitalize transition-colors",
              filter === f
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Conversations */}
      <ScrollArea className="flex-1">
        {pinnedConvs.length > 0 && (
          <div className="px-3 pb-1">
            <div className="flex items-center gap-1.5 px-1 pb-1.5">
              <Pin className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Pinned
              </span>
              <ChevronDown className="ml-auto h-3 w-3 text-muted-foreground" />
            </div>
            {pinnedConvs.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isActive={conv.id === activeConversationId}
                onClick={() => {
                  onSelectConversation(conv.id)
                  onClose?.()
                }}
              />
            ))}
          </div>
        )}

        {otherConvs.length > 0 && (
          <div className="px-3 pb-1">
            <div className="flex items-center gap-1.5 px-1 pb-1.5 pt-2">
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Recent
              </span>
              <ChevronDown className="ml-auto h-3 w-3 text-muted-foreground" />
            </div>
            {otherConvs.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isActive={conv.id === activeConversationId}
                onClick={() => {
                  onSelectConversation(conv.id)
                  onClose?.()
                }}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Current user */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Avatar className="h-8 w-8 border border-sidebar-border">
              <AvatarFallback className="bg-primary text-[10px] font-semibold text-primary-foreground">
                YU
              </AvatarFallback>
            </Avatar>
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-sidebar bg-online" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-xs font-medium text-sidebar-foreground">you.eth</p>
            <p className="truncate font-mono text-[10px] text-muted-foreground">0x1a2b...3c4d</p>
          </div>
          <Shield className="h-3.5 w-3.5 text-primary" />
        </div>
      </div>
    </div>
  )
}

function ConversationItem({
  conversation,
  isActive,
  onClick,
}: {
  conversation: Conversation
  isActive: boolean
  onClick: () => void
}) {
  const user = getOtherUser(conversation)
  const lastMsg = conversation.lastMessage

  const statusColor = {
    online: "bg-online",
    away: "bg-chart-4",
    offline: "bg-muted-foreground",
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-all",
        isActive
          ? "bg-sidebar-accent"
          : "hover:bg-sidebar-accent/50"
      )}
    >
      <div className="relative shrink-0">
        <Avatar className="h-9 w-9 border border-sidebar-border">
          <AvatarFallback
            className={cn(
              "text-[11px] font-semibold",
              isActive
                ? "bg-primary text-primary-foreground"
                : "bg-sidebar-accent text-sidebar-accent-foreground"
            )}
          >
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-sidebar",
            statusColor[user.status]
          )}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span
              className={cn(
                "truncate text-xs font-medium",
                isActive ? "text-sidebar-foreground" : "text-sidebar-foreground/80"
              )}
            >
              {user.name}
            </span>
            {user.verified && (
              <Shield className="h-3 w-3 shrink-0 text-primary" />
            )}
          </div>
          <span className="shrink-0 text-[10px] text-muted-foreground">
            {formatTime(lastMsg.timestamp)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className="truncate text-[11px] text-muted-foreground">
            {lastMsg.senderId === "user-0" && (
              <span className="text-muted-foreground/70">You: </span>
            )}
            {lastMsg.type === "image"
              ? "Sent an image"
              : lastMsg.type === "file"
                ? lastMsg.fileName || "Sent a file"
                : lastMsg.type === "voice"
                  ? "Voice message"
                  : lastMsg.type === "nft"
                    ? "Shared an NFT"
                    : lastMsg.type === "transaction"
                      ? `Sent ${lastMsg.txAmount} ${lastMsg.txToken}`
                      : truncateMessage(lastMsg.content)}
          </p>
          <div className="flex items-center gap-1">
            {conversation.encrypted && (
              <Shield className="h-2.5 w-2.5 text-muted-foreground/50" />
            )}
            {conversation.unreadCount > 0 && (
              <Badge
                variant="default"
                className="h-4 min-w-4 rounded-full px-1 text-[9px] font-bold"
              >
                {conversation.unreadCount}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}
