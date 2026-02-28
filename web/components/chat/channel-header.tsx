"use client"

import { Hash, MoreHorizontal, Globe } from "lucide-react"

interface ChannelHeaderProps {
  channel: string
}

const CHANNEL_DESCRIPTIONS: Record<string, string> = {
  general: "General discussion, on IPFS",
  random: "Random topics and links",
  media: "Images, files and media",
}

export function ChannelHeader({ channel }: ChannelHeaderProps) {
  const description = CHANNEL_DESCRIPTIONS[channel] ?? `#${channel} channel`

  return (
    <header className="flex items-center justify-between border-b border-border px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
          <Hash className="h-5 w-5 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h2 className="text-sm font-semibold text-foreground">{channel}</h2>
            <span className="flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium text-primary">
              <Globe className="h-2.5 w-2.5" />
              IPFS
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
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
