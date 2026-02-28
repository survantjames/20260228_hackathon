import { EventEmitter } from 'events'

export interface Post {
  cid: string
  author: string
  channel: string
  content: string
  timestamp: number
}

class PostStore extends EventEmitter {
  private posts: Post[] = []

  add(post: Post) {
    this.posts.push(post)
    this.emit('post', post)
  }

  getByChannel(channel: string): Post[] {
    return this.posts.filter(p => p.channel === channel).slice(-200)
  }
}

// Use globalThis to survive Next.js hot-reload in dev without losing posts.
// In production on a single server this persists across requests.
// For multi-instance deployments, replace with Vercel KV + Pusher/Ably.
const g = globalThis as typeof globalThis & { __postStore?: PostStore }
if (!g.__postStore) g.__postStore = new PostStore()
const store = g.__postStore

export default store
