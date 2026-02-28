import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { ResolvedPost } from '../lib/types';

interface Props {
  post: ResolvedPost;
}

export default function PostCard({ post }: Props) {
  const date = new Date(post.timestamp);
  const timeAgo = getTimeAgo(date);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.author}>{post.authorDisplayName}</Text>
        <Text style={styles.username}>@{post.authorUsername}</Text>
        <Text style={styles.time}>{timeAgo}</Text>
      </View>
      {post.image ? (
        <Image source={{ uri: post.image }} style={styles.image} resizeMode="cover" />
      ) : null}
      {post.text ? <Text style={styles.text}>{post.text}</Text> : null}
    </View>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginBottom: 1,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#dbdbdb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 6,
  },
  author: {
    fontWeight: '600',
    fontSize: 14,
  },
  username: {
    color: '#666',
    fontSize: 13,
  },
  time: {
    color: '#999',
    fontSize: 12,
    marginLeft: 'auto',
  },
  image: {
    width: '100%',
    aspectRatio: 1,
  },
  text: {
    padding: 12,
    fontSize: 14,
    lineHeight: 20,
  },
});
