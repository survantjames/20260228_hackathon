import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { getProfile, getFollowing } from '../../lib/storage';
import { resolveIpns, fetchFeedIndex, fetchPost } from '../../lib/ipfs';
import { UserProfile, FollowedUser, ResolvedPost } from '../../lib/types';

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [following, setFollowing] = useState<FollowedUser[]>([]);
  const [myPosts, setMyPosts] = useState<ResolvedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const p = await getProfile();
      setProfile(p);
      if (!p) return;

      const f = await getFollowing();
      setFollowing(f);

      // Load own posts
      try {
        const feedCid = await resolveIpns(p.apiUrl, p.ipnsKeyId);
        const feed = await fetchFeedIndex(p.apiUrl, feedCid);

        const postResults = await Promise.allSettled(
          feed.posts.slice(0, 20).map((cid) => fetchPost(p.apiUrl, cid)),
        );

        const posts = postResults
          .filter((r) => r.status === 'fulfilled')
          .map((r, i) => ({
            ...(r as PromiseFulfilledResult<any>).value,
            cid: feed.posts[i],
            authorUsername: p.username,
            authorDisplayName: p.displayName,
          })) as ResolvedPost[];

        setMyPosts(posts);
      } catch {
        // May fail if no posts yet
      }
    } catch (err) {
      console.error('Profile load error:', err);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadData().finally(() => setLoading(false));
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  if (loading || !profile) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.displayName}>{profile.displayName}</Text>
        <Text style={styles.username}>@{profile.username}</Text>
      </View>

      <View style={styles.qrContainer}>
        <Text style={styles.sectionTitle}>Your QR Code</Text>
        <Text style={styles.qrHint}>Others can scan this to follow you</Text>
        <View style={styles.qrBox}>
          <QRCode value={profile.ipnsKeyId} size={200} />
        </View>
        <Text style={styles.keyId} numberOfLines={1} ellipsizeMode="middle">
          {profile.ipnsKeyId}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Following ({following.length})
        </Text>
        {following.length === 0 ? (
          <Text style={styles.emptyText}>
            Scan someone's QR code to follow them
          </Text>
        ) : (
          following.map((user) => (
            <View key={user.ipnsKeyId} style={styles.followItem}>
              <Text style={styles.followName}>{user.displayName}</Text>
              <Text style={styles.followUsername}>@{user.username}</Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Your Posts ({myPosts.length})
        </Text>
        {myPosts.length === 0 ? (
          <Text style={styles.emptyText}>No posts yet</Text>
        ) : (
          <View style={styles.grid}>
            {myPosts.map((post, i) => (
              <View key={post.cid || i} style={styles.gridItem}>
                {post.image ? (
                  <Image
                    source={{ uri: post.image }}
                    style={styles.gridImage}
                  />
                ) : (
                  <View style={[styles.gridImage, styles.textPost]}>
                    <Text numberOfLines={3} style={styles.textPostText}>
                      {post.text}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#dbdbdb',
  },
  displayName: {
    fontSize: 22,
    fontWeight: '700',
  },
  username: {
    fontSize: 15,
    color: '#666',
    marginTop: 2,
  },
  qrContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
    marginTop: 12,
  },
  qrBox: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    marginVertical: 12,
  },
  qrHint: {
    color: '#999',
    fontSize: 13,
    marginTop: 4,
  },
  keyId: {
    color: '#999',
    fontSize: 11,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    maxWidth: 260,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 12,
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
  },
  followItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  followName: {
    fontWeight: '600',
    fontSize: 15,
  },
  followUsername: {
    color: '#666',
    fontSize: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  gridItem: {
    width: '32.6%',
    aspectRatio: 1,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  textPost: {
    backgroundColor: '#eee',
    justifyContent: 'center',
    padding: 8,
  },
  textPostText: {
    fontSize: 11,
    color: '#333',
  },
});
