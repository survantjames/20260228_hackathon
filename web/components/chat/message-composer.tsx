"use client"

import { useState, useRef, type KeyboardEvent, type ChangeEvent } from "react"
import { Plus, Send, Smile, ImageIcon, X, Mic, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface MessageComposerProps {
  onSend: (text: string, imageCid?: string) => void
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
  const [pendingImage, setPendingImage] = useState<{ file: File; preview: string } | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageCid, setImageCid] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSend = () => {
    const text = content.trim()
    if ((!text && !imageCid) || disabled || sending || uploadingImage) return
    onSend(text, imageCid ?? undefined)
    setContent("")
    setPendingImage(null)
    setImageCid(null)
    setShowAttachments(false)
    if (textareaRef.current) textareaRef.current.style.height = "auto"
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

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const preview = URL.createObjectURL(file)
    setPendingImage({ file, preview })
    setShowAttachments(false)
    setUploadingImage(true)
    setImageCid(null)

    try {
      const form = new FormData()
      form.append("file", file)
      const res = await fetch("/api/media", { method: "POST", body: form })
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`)
      const { cid } = await res.json()
      setImageCid(cid)
    } catch (err) {
      console.error("Image upload failed:", err)
      setPendingImage(null)
    } finally {
      setUploadingImage(false)
      // Reset input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const removeImage = () => {
    if (pendingImage) URL.revokeObjectURL(pendingImage.preview)
    setPendingImage(null)
    setImageCid(null)
  }

  const canSend = (content.trim() || imageCid) && !disabled && !sending && !uploadingImage

  return (
    <div className="border-t border-border">
      {/* Attachment picker */}
      {showAttachments && (
        <div className="border-b border-border px-4 py-2.5">
          <div className="flex items-center gap-1">
            <button
              onClick={() => { fileInputRef.current?.click(); setShowAttachments(false) }}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <ImageIcon className="h-4 w-4 text-primary" />
              <span className="text-xs">Photo / Image</span>
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

      {/* Pending image preview */}
      {pendingImage && (
        <div className="border-b border-border px-4 py-2">
          <div className="relative inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pendingImage.preview}
              alt="pending upload"
              className="h-20 w-20 rounded-lg border border-border object-cover"
            />
            {uploadingImage && (
              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/60">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            )}
            {!uploadingImage && (
              <button
                onClick={removeImage}
                className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
                aria-label="Remove image"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          {uploadingImage && (
            <p className="mt-1 text-[10px] text-muted-foreground">Uploading to IPFS…</p>
          )}
          {imageCid && (
            <p className="mt-1 font-mono text-[10px] text-primary">
              ipfs://{imageCid.slice(0, 20)}…
            </p>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Main composer */}
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

        {canSend ? (
          <button
            onClick={handleSend}
            disabled={!canSend}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Send"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
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
