"use client"

import { useRef, useEffect } from "react"
import { Shield, Lock } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChatHeader } from "./chat-header"
import { MessageBubble } from "./message-bubble"
import { MessageComposer } from "./message-composer"
import type { Message, User, Conversation, MessageType } from "@/lib/chat-data"
import { currentUser, users } from "@/lib/chat-data"

function getOtherUser(conversation: Conversation): User {
  return conversation.participants.find((p) => p.id !== "user-0")!
}

function getUserById(id: string): User {
  if (id === "user-0") return currentUser
  return users.find((u) => u.id === id) || currentUser
}

interface ChatWindowProps {
  conversation: Conversation
  messages: Message[]
  onSendMessage: (content: string, type: MessageType) => void
  onBack?: () => void
}

export function ChatWindow({
  conversation,
  messages,
  onSendMessage,
  onBack,
}: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const otherUser = getOtherUser(conversation)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="flex h-full flex-col bg-background">
      <ChatHeader user={otherUser} encrypted={conversation.encrypted} onBack={onBack} />

      {/* Messages area */}
      <ScrollArea className="flex-1">
        <div ref={scrollRef} className="flex flex-col gap-3 px-4 py-4">
          {/* Encryption banner */}
          {conversation.encrypted && (
            <div className="mx-auto mb-2 flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5">
              <Lock className="h-3 w-3 text-primary" />
              <span className="text-[10px] font-medium text-primary">
                Messages are end-to-end encrypted
              </span>
            </div>
          )}

          {/* Date separator */}
          <div className="flex items-center gap-3 py-2">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] font-medium text-muted-foreground">Today</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {messages.map((msg, index) => {
            const isOwn = msg.senderId === "user-0"
            const sender = getUserById(msg.senderId)
            const prevMsg = index > 0 ? messages[index - 1] : null
            const showAvatar = !prevMsg || prevMsg.senderId !== msg.senderId

            return (
              <MessageBubble
                key={msg.id}
                message={msg}
                sender={sender}
                isOwn={isOwn}
                showAvatar={showAvatar}
              />
            )
          })}
        </div>
      </ScrollArea>

      <MessageComposer onSendMessage={onSendMessage} />
    </div>
  )
}
