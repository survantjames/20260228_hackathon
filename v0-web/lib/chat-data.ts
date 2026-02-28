export type MessageType = "text" | "image" | "file" | "voice" | "nft" | "transaction"

export interface User {
  id: string
  name: string
  handle: string
  avatar: string
  status: "online" | "offline" | "away"
  walletAddress: string
  ensName?: string
  verified: boolean
}

export interface Reaction {
  emoji: string
  count: number
  reacted: boolean
}

export interface Message {
  id: string
  senderId: string
  type: MessageType
  content: string
  timestamp: Date
  reactions: Reaction[]
  replyTo?: string
  imageUrl?: string
  fileName?: string
  fileSize?: string
  voiceDuration?: string
  nftName?: string
  nftCollection?: string
  nftImageUrl?: string
  txHash?: string
  txAmount?: string
  txToken?: string
  read: boolean
}

export interface Conversation {
  id: string
  participants: User[]
  lastMessage: Message
  unreadCount: number
  pinned: boolean
  encrypted: boolean
}

export const currentUser: User = {
  id: "user-0",
  name: "You",
  handle: "@you.eth",
  avatar: "",
  status: "online",
  walletAddress: "0x1a2b...3c4d",
  ensName: "you.eth",
  verified: true,
}

export const users: User[] = [
  {
    id: "user-1",
    name: "Elena Voss",
    handle: "@elena.eth",
    avatar: "",
    status: "online",
    walletAddress: "0x7f3a...9b2e",
    ensName: "elena.eth",
    verified: true,
  },
  {
    id: "user-2",
    name: "Marcus Chen",
    handle: "@mchen.eth",
    avatar: "",
    status: "away",
    walletAddress: "0x4d8c...1f7a",
    ensName: "mchen.eth",
    verified: true,
  },
  {
    id: "user-3",
    name: "Aria Nakamura",
    handle: "@aria.eth",
    avatar: "",
    status: "online",
    walletAddress: "0x2e5f...8d3c",
    ensName: "aria.eth",
    verified: false,
  },
  {
    id: "user-4",
    name: "Dex Protocol",
    handle: "@dexprotocol.eth",
    avatar: "",
    status: "online",
    walletAddress: "0x9a1b...4e7f",
    ensName: "dexprotocol.eth",
    verified: true,
  },
  {
    id: "user-5",
    name: "Zara Okonkwo",
    handle: "@zara.eth",
    avatar: "",
    status: "offline",
    walletAddress: "0x6c2d...5a8b",
    ensName: "zara.eth",
    verified: true,
  },
  {
    id: "user-6",
    name: "Kai Tanaka",
    handle: "@kai.eth",
    avatar: "",
    status: "offline",
    walletAddress: "0x3f7e...2c9d",
    verified: false,
  },
]

const now = new Date()
const minutesAgo = (mins: number) => new Date(now.getTime() - mins * 60000)

export const messages: Record<string, Message[]> = {
  "conv-1": [
    {
      id: "msg-1",
      senderId: "user-1",
      type: "text",
      content: "Hey! Did you see the new governance proposal for the DAO?",
      timestamp: minutesAgo(45),
      reactions: [{ emoji: "fire", count: 1, reacted: false }],
      read: true,
    },
    {
      id: "msg-2",
      senderId: "user-0",
      type: "text",
      content: "Yeah, I just voted on it. The tokenomics changes look solid.",
      timestamp: minutesAgo(42),
      reactions: [],
      read: true,
    },
    {
      id: "msg-3",
      senderId: "user-1",
      type: "image",
      content: "Check out this chart showing the projected token distribution",
      timestamp: minutesAgo(38),
      imageUrl: "/placeholder-chart.jpg",
      reactions: [{ emoji: "eyes", count: 2, reacted: true }],
      read: true,
    },
    {
      id: "msg-4",
      senderId: "user-0",
      type: "text",
      content: "That's a much better allocation than v1. The community treasury portion is especially nice.",
      timestamp: minutesAgo(35),
      reactions: [],
      read: true,
    },
    {
      id: "msg-5",
      senderId: "user-1",
      type: "transaction",
      content: "Sent you the delegation tokens",
      timestamp: minutesAgo(30),
      txHash: "0x8f2a...7c1e",
      txAmount: "500",
      txToken: "GOV",
      reactions: [{ emoji: "sparkles", count: 1, reacted: false }],
      read: true,
    },
    {
      id: "msg-6",
      senderId: "user-0",
      type: "text",
      content: "Received! I'll delegate these to the dev fund multisig.",
      timestamp: minutesAgo(25),
      reactions: [],
      read: true,
    },
    {
      id: "msg-7",
      senderId: "user-1",
      type: "file",
      content: "Here's the full proposal doc",
      timestamp: minutesAgo(20),
      fileName: "governance_proposal_v2.pdf",
      fileSize: "2.4 MB",
      reactions: [],
      read: true,
    },
    {
      id: "msg-8",
      senderId: "user-1",
      type: "text",
      content: "Let me know your thoughts after reading section 3. The staking mechanism is interesting.",
      timestamp: minutesAgo(15),
      reactions: [],
      read: true,
    },
    {
      id: "msg-9",
      senderId: "user-0",
      type: "voice",
      content: "Voice message",
      timestamp: minutesAgo(10),
      voiceDuration: "0:42",
      reactions: [{ emoji: "thumbsup", count: 1, reacted: false }],
      read: true,
    },
    {
      id: "msg-10",
      senderId: "user-1",
      type: "nft",
      content: "Also, look at this NFT from the community drop!",
      timestamp: minutesAgo(5),
      nftName: "Genesis Member #247",
      nftCollection: "DAO Founders",
      nftImageUrl: "/placeholder-nft.jpg",
      reactions: [
        { emoji: "fire", count: 3, reacted: true },
        { emoji: "heart", count: 2, reacted: false },
      ],
      read: true,
    },
    {
      id: "msg-11",
      senderId: "user-1",
      type: "text",
      content: "Are you joining the community call tonight? We're discussing the roadmap for Q2.",
      timestamp: minutesAgo(2),
      reactions: [],
      read: false,
    },
  ],
  "conv-2": [
    {
      id: "msg-20",
      senderId: "user-2",
      type: "text",
      content: "The smart contract audit results came back clean. Ready to deploy to mainnet?",
      timestamp: minutesAgo(120),
      reactions: [],
      read: true,
    },
    {
      id: "msg-21",
      senderId: "user-0",
      type: "text",
      content: "Great news! Let's schedule the deployment for tomorrow.",
      timestamp: minutesAgo(115),
      reactions: [{ emoji: "rocket", count: 1, reacted: false }],
      read: true,
    },
    {
      id: "msg-22",
      senderId: "user-2",
      type: "file",
      content: "Here's the audit report",
      timestamp: minutesAgo(110),
      fileName: "audit_report_final.pdf",
      fileSize: "5.1 MB",
      reactions: [],
      read: true,
    },
    {
      id: "msg-23",
      senderId: "user-2",
      type: "text",
      content: "I'll prepare the deployment scripts. Can you review the gas optimization changes?",
      timestamp: minutesAgo(60),
      reactions: [],
      read: false,
    },
  ],
  "conv-3": [
    {
      id: "msg-30",
      senderId: "user-3",
      type: "text",
      content: "Just minted my first collection on the new marketplace!",
      timestamp: minutesAgo(200),
      reactions: [{ emoji: "sparkles", count: 2, reacted: true }],
      read: true,
    },
    {
      id: "msg-31",
      senderId: "user-0",
      type: "text",
      content: "Congrats! What's the floor price looking like?",
      timestamp: minutesAgo(195),
      reactions: [],
      read: true,
    },
    {
      id: "msg-32",
      senderId: "user-3",
      type: "nft",
      content: "Check it out!",
      timestamp: minutesAgo(190),
      nftName: "Ethereal Dreams #001",
      nftCollection: "Aria's Genesis",
      nftImageUrl: "/placeholder-nft-2.jpg",
      reactions: [{ emoji: "heart", count: 4, reacted: true }],
      read: true,
    },
    {
      id: "msg-33",
      senderId: "user-3",
      type: "text",
      content: "The collection is doing really well! Would you be interested in a collab?",
      timestamp: minutesAgo(30),
      reactions: [],
      read: false,
    },
  ],
  "conv-4": [
    {
      id: "msg-40",
      senderId: "user-4",
      type: "text",
      content: "New liquidity pool is live. APY currently at 145%.",
      timestamp: minutesAgo(300),
      reactions: [{ emoji: "fire", count: 5, reacted: true }],
      read: true,
    },
    {
      id: "msg-41",
      senderId: "user-0",
      type: "text",
      content: "Impressive! What's the lock-up period?",
      timestamp: minutesAgo(290),
      reactions: [],
      read: true,
    },
    {
      id: "msg-42",
      senderId: "user-4",
      type: "transaction",
      content: "Just staked in the pool",
      timestamp: minutesAgo(280),
      txHash: "0x3b5d...9f2a",
      txAmount: "10,000",
      txToken: "USDC",
      reactions: [],
      read: true,
    },
  ],
  "conv-5": [
    {
      id: "msg-50",
      senderId: "user-5",
      type: "text",
      content: "Have you tried the new cross-chain bridge? It's much faster now.",
      timestamp: minutesAgo(500),
      reactions: [],
      read: true,
    },
    {
      id: "msg-51",
      senderId: "user-0",
      type: "text",
      content: "Not yet, I'll check it out this weekend.",
      timestamp: minutesAgo(480),
      reactions: [],
      read: true,
    },
  ],
  "conv-6": [
    {
      id: "msg-60",
      senderId: "user-6",
      type: "text",
      content: "Can you help me set up my validator node?",
      timestamp: minutesAgo(1000),
      reactions: [],
      read: true,
    },
    {
      id: "msg-61",
      senderId: "user-0",
      type: "text",
      content: "Sure! I'll send you the documentation later today.",
      timestamp: minutesAgo(990),
      reactions: [],
      read: true,
    },
  ],
}

export const conversations: Conversation[] = [
  {
    id: "conv-1",
    participants: [currentUser, users[0]],
    lastMessage: messages["conv-1"][messages["conv-1"].length - 1],
    unreadCount: 1,
    pinned: true,
    encrypted: true,
  },
  {
    id: "conv-2",
    participants: [currentUser, users[1]],
    lastMessage: messages["conv-2"][messages["conv-2"].length - 1],
    unreadCount: 1,
    pinned: true,
    encrypted: true,
  },
  {
    id: "conv-3",
    participants: [currentUser, users[2]],
    lastMessage: messages["conv-3"][messages["conv-3"].length - 1],
    unreadCount: 1,
    pinned: false,
    encrypted: true,
  },
  {
    id: "conv-4",
    participants: [currentUser, users[3]],
    lastMessage: messages["conv-4"][messages["conv-4"].length - 1],
    unreadCount: 0,
    pinned: false,
    encrypted: true,
  },
  {
    id: "conv-5",
    participants: [currentUser, users[4]],
    lastMessage: messages["conv-5"][messages["conv-5"].length - 1],
    unreadCount: 0,
    pinned: false,
    encrypted: false,
  },
  {
    id: "conv-6",
    participants: [currentUser, users[5]],
    lastMessage: messages["conv-6"][messages["conv-6"].length - 1],
    unreadCount: 0,
    pinned: false,
    encrypted: true,
  },
]
