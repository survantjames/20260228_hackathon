"use client"

import { useState, useRef, type KeyboardEvent } from "react"
import {
  Plus,
  Send,
  Smile,
  Image as ImageIcon,
  FileText,
  Mic,
  ArrowUpRight,
  X,
  Paperclip,
  AtSign,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { MessageType } from "@/lib/chat-data"

interface MessageComposerProps {
  onSendMessage: (content: string, type: MessageType) => void
}

export function MessageComposer({ onSendMessage }: MessageComposerProps) {
  const [content, setContent] = useState("")
  const [showAttachments, setShowAttachments] = useState(false)
  const [recording, setRecording] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    if (content.trim()) {
      onSendMessage(content.trim(), "text")
      setContent("")
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
      }
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }

  const attachmentOptions = [
    { icon: ImageIcon, label: "Photo / Video", type: "image" as MessageType, color: "text-primary" },
    { icon: FileText, label: "Document", type: "file" as MessageType, color: "text-chart-2" },
    { icon: ArrowUpRight, label: "Send Tokens", type: "transaction" as MessageType, color: "text-chart-4" },
    { icon: AtSign, label: "Mention", type: "text" as MessageType, color: "text-chart-5" },
  ]

  return (
    <div className="border-t border-border">
      {/* Attachment picker */}
      {showAttachments && (
        <div className="border-b border-border px-4 py-2.5">
          <div className="flex items-center gap-1">
            {attachmentOptions.map((opt) => (
              <button
                key={opt.label}
                onClick={() => {
                  setShowAttachments(false)
                  if (opt.type !== "text") {
                    onSendMessage(`[${opt.label}]`, opt.type)
                  }
                }}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <opt.icon className={cn("h-4 w-4", opt.color)} />
                <span className="text-xs">{opt.label}</span>
              </button>
            ))}
            <button
              onClick={() => setShowAttachments(false)}
              className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Close attachments"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main composer */}
      <div className="flex items-end gap-2 px-4 py-3">
        <button
          onClick={() => setShowAttachments(!showAttachments)}
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
            showAttachments
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
          aria-label="Add attachment"
        >
          {showAttachments ? (
            <X className="h-4 w-4" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </button>

        <div className="flex min-h-9 flex-1 items-end rounded-xl bg-secondary px-3 py-2">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder="Type a message..."
            rows={1}
            className="max-h-[120px] flex-1 resize-none bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <div className="flex items-center gap-0.5 pb-0.5 pl-2">
            <button
              className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Add emoji"
            >
              <Smile className="h-4 w-4" />
            </button>
            <button
              className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Attach file"
            >
              <Paperclip className="h-4 w-4" />
            </button>
          </div>
        </div>

        {content.trim() ? (
          <button
            onClick={handleSend}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={() => setRecording(!recording)}
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
              recording
                ? "bg-destructive text-destructive-foreground animate-pulse"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
            aria-label={recording ? "Stop recording" : "Record voice message"}
          >
            <Mic className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
