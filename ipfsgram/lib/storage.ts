import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, FollowedUser } from './types';

const PROFILE_KEY = 'ipfsgram_profile';
const FOLLOWING_KEY = 'ipfsgram_following';

export async function getProfile(): Promise<UserProfile | null> {
  const raw = await AsyncStorage.getItem(PROFILE_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export async function getFollowing(): Promise<FollowedUser[]> {
  const raw = await AsyncStorage.getItem(FOLLOWING_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function addFollowing(user: FollowedUser): Promise<void> {
  const following = await getFollowing();
  // Don't add duplicates
  if (following.some((u) => u.ipnsKeyId === user.ipnsKeyId)) return;
  following.push(user);
  await AsyncStorage.setItem(FOLLOWING_KEY, JSON.stringify(following));
}
