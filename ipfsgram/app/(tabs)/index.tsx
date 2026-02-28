import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { getProfile, getFollowing } from '../../lib/storage';
import { resolveIpns, fetchFeedIndex, fetchPost } from '../../lib/ipfs';
import { ResolvedPost, UserProfile, FollowedUser } from '../../lib/types';
import PostCard from '../../components/PostCard';

export default function FeedScreen() {
  const [posts, setPosts] = useState<ResolvedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFeed = useCallback(async () => {
    try {
      const profile = await getProfile();
      if (!profile) return;

      const following = await getFollowing();

      // Include self in the feed
      const allUsers: { ipnsKeyId: string; username: string; displayName: string }[] = [
        {
          ipnsKeyId: profile.ipnsKeyId,
          username: profile.username,
          displayName: profile.displayName,
        },
        ...following,
      ];

      // Resolve all IPNS keys in parallel
      const results = await Promise.allSettled(
        allUsers.map(async (user) => {
          const feedCid = await resolveIpns(profile.apiUrl, user.ipnsKeyId);
          const feed = await fetchFeedIndex(profile.apiUrl, feedCid);

          // Fetch latest 10 posts
          const postCids = feed.posts.slice(0, 10);
          const postResults = await Promise.allSettled(
            postCids.map((cid) => fetchPost(profile.apiUrl, cid)),
          );

          return postResults
            .filter((r) => r.status === 'fulfilled')
            .map((r) => ({
              ...(r as PromiseFulfilledResult<any>).value,
              cid: postCids[postResults.indexOf(r)],
              authorUsername: user.username || feed.username,
              authorDisplayName: user.displayName || feed.displayName,
            })) as ResolvedPost[];
        }),
      );

      const allPosts = results
        .filter((r) => r.status === 'fulfilled')
        .flatMap((r) => (r as PromiseFulfilledResult<ResolvedPost[]>).value)
        .sort((a, b) => b.timestamp - a.timestamp);

      setPosts(allPosts);
    } catch (err) {
      console.error('Feed load error:', err);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadFeed().finally(() => setLoading(false));
  }, [loadFeed]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFeed();
    setRefreshing(false);
  }, [loadFeed]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading feed...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={posts}
      keyExtractor={(item, index) => item.cid || String(index)}
      renderItem={({ item }) => <PostCard post={item} />}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={posts.length === 0 ? styles.center : undefined}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No posts yet</Text>
          <Text style={styles.emptyText}>
            Create a post or scan someone's QR code to follow them.
          </Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
  empty: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
});
