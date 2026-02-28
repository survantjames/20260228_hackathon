import { EventEmitter } from 'events'

export interface Post {
  cid: string
  author: string
  channel: string
  content: string
  timestamp: number
  imageCid?: string
}

class PostStore extends EventEmitter {
  private posts: Post[] = []
  private seenCids = new Set<string>()

  add(post: Post) {
    if (this.seenCids.has(post.cid)) return // dedup — pubsub may echo our own posts
    this.seenCids.add(post.cid)
    this.posts.push(post)
    this.emit('post', post)
  }

  getByChannel(channel: string): Post[] {
    return this.posts.filter(p => p.channel === channel).slice(-200)
  }
}

// Use globalThis to survive Next.js hot-reload in dev without losing posts.
const g = globalThis as typeof globalThis & { __postStore?: PostStore }
if (!g.__postStore) g.__postStore = new PostStore()
const store = g.__postStore

export default store
