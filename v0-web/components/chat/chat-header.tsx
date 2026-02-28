"use client"

import {
  Phone,
  Video,
  Shield,
  MoreHorizontal,
  ArrowLeft,
  Copy,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { User } from "@/lib/chat-data"
import { cn } from "@/lib/utils"

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

interface ChatHeaderProps {
  user: User
  encrypted: boolean
  onBack?: () => void
}

export function ChatHeader({ user, encrypted, onBack }: ChatHeaderProps) {
  const statusText = {
    online: "Online",
    away: "Away",
    offline: "Offline",
  }

  const statusColor = {
    online: "bg-online",
    away: "bg-chart-4",
    offline: "bg-muted-foreground",
  }

  return (
    <header className="flex items-center justify-between border-b border-border px-4 py-3">
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:hidden"
            aria-label="Back to conversations"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
        <div className="relative">
          <Avatar className="h-9 w-9 border border-border">
            <AvatarFallback className="bg-primary text-[11px] font-semibold text-primary-foreground">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <span
            className={cn(
              "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background",
              statusColor[user.status]
            )}
          />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h2 className="text-sm font-semibold text-foreground">{user.name}</h2>
            {user.verified && (
              <Shield className="h-3.5 w-3.5 text-primary" />
            )}
            {encrypted && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium text-primary">
                      <Shield className="h-2.5 w-2.5" />
                      E2E
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>End-to-end encrypted</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  statusColor[user.status]
                )}
              />
              <span className="text-[10px] text-muted-foreground">
                {statusText[user.status]}
              </span>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex items-center gap-0.5 font-mono text-[10px] text-muted-foreground transition-colors hover:text-foreground">
                    {user.walletAddress}
                    <Copy className="h-2.5 w-2.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy wallet address</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Voice call"
        >
          <Phone className="h-4 w-4" />
        </button>
        <button
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Video call"
        >
          <Video className="h-4 w-4" />
        </button>
        <button
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="More options"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}
