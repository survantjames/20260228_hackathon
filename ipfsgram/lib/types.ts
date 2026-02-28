export interface Post {
  text: string;
  image: string; // base64 data URI
  timestamp: number;
}

export interface FeedIndex {
  username: string;
  displayName: string;
  posts: string[]; // array of CIDs
}

export interface UserProfile {
  username: string;
  displayName: string;
  apiUrl: string; // e.g. http://1.2.3.4:5001
  gatewayUrl: string; // e.g. http://1.2.3.4:8080
  ipnsKeyId: string; // the IPNS key ID (k51...)
  ipnsKeyName: string; // ipfsgram-{username}
  feedCid: string; // current feed CID
}

export interface FollowedUser {
  ipnsKeyId: string;
  username: string;
  displayName: string;
}

export interface ResolvedPost extends Post {
  cid: string;
  authorUsername: string;
  authorDisplayName: string;
}
