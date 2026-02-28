import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getProfile, saveProfile } from '../../lib/storage';
import { uploadJson, fetchFeedIndex, publishToIpns } from '../../lib/ipfs';
import { Post, FeedIndex } from '../../lib/types';

export default function NewPostScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setImageBase64(result.assets[0].base64 || null);
    }
  };

  const handlePost = async () => {
    if (!imageBase64) {
      Alert.alert('Error', 'Please select an image first.');
      return;
    }

    setLoading(true);
    try {
      const profile = await getProfile();
      if (!profile) throw new Error('No profile found');

      // 1. Build post
      const post: Post = {
        text: text.trim(),
        image: `data:image/jpeg;base64,${imageBase64}`,
        timestamp: Date.now(),
      };

      // 2. Upload post to IPFS
      setStatus('Uploading post...');
      const postCid = await uploadJson(profile.apiUrl, post);

      // 3. Fetch current feed index
      setStatus('Updating feed...');
      let feed: FeedIndex;
      try {
        feed = await fetchFeedIndex(profile.apiUrl, profile.feedCid);
      } catch {
        feed = {
          username: profile.username,
          displayName: profile.displayName,
          posts: [],
        };
      }

      // 4. Prepend new post CID
      feed.posts.unshift(postCid);

      // 5. Upload updated feed
      const newFeedCid = await uploadJson(profile.apiUrl, feed);

      // 6. Publish to IPNS (slow!)
      setStatus('Publishing to IPNS (10-30s)...');
      await publishToIpns(profile.apiUrl, newFeedCid, profile.ipnsKeyName);

      // 7. Update local profile
      await saveProfile({ ...profile, feedCid: newFeedCid });

      setStatus('');
      setImageUri(null);
      setImageBase64(null);
      setText('');

      Alert.alert('Posted!', 'Your post is now on IPFS.');
    } catch (err: any) {
      Alert.alert('Post Failed', err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage} disabled={loading}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.preview} />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderIcon}>📷</Text>
              <Text style={styles.placeholderText}>Tap to select image</Text>
            </View>
          )}
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Write a caption..."
          value={text}
          onChangeText={setText}
          multiline
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handlePost}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Share to IPFS</Text>
          )}
        </TouchableOpacity>

        {status ? <Text style={styles.status}>{status}</Text> : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  scroll: {
    padding: 16,
  },
  imagePicker: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  preview: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
  },
  placeholder: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#eee',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  placeholderText: {
    color: '#999',
    fontSize: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#0095f6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  status: {
    textAlign: 'center',
    color: '#666',
    marginTop: 16,
    fontSize: 14,
  },
});
