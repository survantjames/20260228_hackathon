"use client"

import { useState } from "react"
import Link from "next/link"
import { Hash, Plus, Settings, Search, Shield } from "lucide-react"
import { cn } from "@/lib/utils"

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

interface ChannelSidebarProps {
  channel: string
  channels: string[]
  username: string
  onSaveUsername: (name: string) => void
}

export function ChannelSidebar({
  channel,
  channels,
  username,
  onSaveUsername,
}: ChannelSidebarProps) {
  const [search, setSearch] = useState("")
  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState("")

  const filtered = channels.filter((ch) =>
    ch.toLowerCase().includes(search.toLowerCase())
  )

  const saveName = () => {
    if (nameDraft.trim()) onSaveUsername(nameDraft.trim())
    setEditingName(false)
  }

  return (
    <div className="flex h-full flex-col bg-sidebar">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Hash className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-sidebar-foreground">IPFS Chat</h1>
            <p className="font-mono text-[10px] text-muted-foreground">decentralized</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
            aria-label="New channel"
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
            placeholder="Search channels..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-xs text-sidebar-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
      </div>

      {/* Channel list */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        <div className="flex items-center gap-1.5 px-1 pb-1.5 pt-1">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Channels
          </span>
        </div>
        {filtered.map((ch) => (
          <Link
            key={ch}
            href={`/channel/${ch}`}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium transition-all mb-0.5",
              ch === channel
                ? "bg-sidebar-accent text-sidebar-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            )}
          >
            <Hash className="h-3.5 w-3.5 shrink-0" />
            <span>{ch}</span>
          </Link>
        ))}
      </div>

      {/* User panel */}
      <div className="border-t border-sidebar-border p-3">
        {editingName ? (
          <div className="flex gap-1.5">
            <input
              autoFocus
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveName()
                if (e.key === "Escape") setEditingName(false)
              }}
              placeholder="Your name"
              className="flex-1 rounded-lg bg-input px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <button
              onClick={saveName}
              className="rounded-lg bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Save
            </button>
          </div>
        ) : (
          <button
            onClick={() => { setNameDraft(username); setEditingName(true) }}
            className="flex w-full items-center gap-2.5 rounded-lg px-1 py-1 transition-colors hover:bg-sidebar-accent text-left"
          >
            <div className="relative shrink-0">
              {username ? (
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-semibold text-white"
                  style={{ background: avatarColor(username) }}
                >
                  {getInitials(username)}
                </div>
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-muted-foreground">
                  ?
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-sidebar bg-online" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-sidebar-foreground">
                {username || "Set your name"}
              </p>
              <p className="truncate text-[10px] text-muted-foreground">
                {username ? "click to edit" : "required to chat"}
              </p>
            </div>
            <Shield className="h-3.5 w-3.5 shrink-0 text-primary" />
          </button>
        )}
      </div>
    </div>
  )
}
