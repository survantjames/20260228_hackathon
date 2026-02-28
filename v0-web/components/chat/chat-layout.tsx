"use client"

import { useState, useCallback } from "react"
import { ConversationSidebar } from "./conversation-sidebar"
import { ChatWindow } from "./chat-window"
import { EmptyState } from "./empty-state"
import {
  conversations as initialConversations,
  messages as initialMessages,
  currentUser,
} from "@/lib/chat-data"
import type { Message, MessageType, Conversation } from "@/lib/chat-data"
import { cn } from "@/lib/utils"

export function ChatLayout() {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [allMessages, setAllMessages] = useState<Record<string, Message[]>>(initialMessages)
  const [allConversations, setAllConversations] = useState<Conversation[]>(initialConversations)

  const activeConversation = allConversations.find((c) => c.id === activeConversationId) || null
  const activeMessages = activeConversationId ? allMessages[activeConversationId] || [] : []

  const handleSendMessage = useCallback(
    (content: string, type: MessageType) => {
      if (!activeConversationId) return

      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        senderId: currentUser.id,
        type,
        content,
        timestamp: new Date(),
        reactions: [],
        read: true,
      }

      setAllMessages((prev) => ({
        ...prev,
        [activeConversationId]: [...(prev[activeConversationId] || []), newMessage],
      }))

      setAllConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeConversationId
            ? { ...conv, lastMessage: newMessage }
            : conv
        )
      )
    },
    [activeConversationId]
  )

  const handleSelectConversation = useCallback((id: string) => {
    setActiveConversationId(id)
    // Mark as read
    setAllConversations((prev) =>
      prev.map((conv) =>
        conv.id === id ? { ...conv, unreadCount: 0 } : conv
      )
    )
  }, [])

  const handleBack = useCallback(() => {
    setActiveConversationId(null)
  }, [])

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background">
      {/* Sidebar */}
      <div
        className={cn(
          "h-full w-full shrink-0 border-r border-border lg:w-80 xl:w-[340px]",
          activeConversationId ? "hidden lg:block" : "block"
        )}
      >
        <ConversationSidebar
          conversations={allConversations}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
        />
      </div>

      {/* Main chat area */}
      <div
        className={cn(
          "h-full min-w-0 flex-1",
          activeConversationId ? "block" : "hidden lg:block"
        )}
      >
        {activeConversation ? (
          <ChatWindow
            conversation={activeConversation}
            messages={activeMessages}
            onSendMessage={handleSendMessage}
            onBack={handleBack}
          />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  )
}
