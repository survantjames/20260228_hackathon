"use client"

import { useState, useRef, type KeyboardEvent } from "react"
import { Plus, Send, Smile, Paperclip, Mic, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface MessageComposerProps {
  onSend: (text: string) => void
  disabled: boolean
  placeholder: string
  sending?: boolean
}

export function MessageComposer({
  onSend,
  disabled,
  placeholder,
  sending = false,
}: MessageComposerProps) {
  const [content, setContent] = useState("")
  const [showAttachments, setShowAttachments] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    const text = content.trim()
    if (!text || disabled) return
    onSend(text)
    setContent("")
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
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

  return (
    <div className="border-t border-border">
      {showAttachments && (
        <div className="border-b border-border px-4 py-2.5">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowAttachments(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Paperclip className="h-4 w-4 text-primary" />
              <span className="text-xs">Attach file</span>
            </button>
            <button
              onClick={() => setShowAttachments(false)}
              className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      <div className="flex items-end gap-2 px-4 py-3">
        <button
          onClick={() => setShowAttachments(!showAttachments)}
          disabled={disabled}
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
            showAttachments
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
          )}
          aria-label="Attachments"
        >
          {showAttachments ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </button>

        <div className="flex min-h-9 flex-1 items-end rounded-xl bg-secondary px-3 py-2">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="max-h-[120px] flex-1 resize-none bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed"
          />
          <div className="flex items-center gap-0.5 pb-0.5 pl-2">
            <button
              className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Emoji"
            >
              <Smile className="h-4 w-4" />
            </button>
          </div>
        </div>

        {content.trim() ? (
          <button
            onClick={handleSend}
            disabled={disabled || sending}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Send"
          >
            {sending ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        ) : (
          <button
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Voice message"
          >
            <Mic className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
