import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { listKeys, generateKey, uploadJson, publishToIpns } from '../lib/ipfs';
import { saveProfile } from '../lib/storage';
import { FeedIndex } from '../lib/types';
import { useAuth } from './_layout';

const IPFS_API_URL = 'http://44.234.6.138:5001';

export default function SetupScreen() {
  const { setHasProfile } = useAuth();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleSubmit = async () => {
    const trimmedUsername = username.trim().toLowerCase();
    const trimmedDisplay = displayName.trim();

    if (!trimmedUsername || !trimmedDisplay) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    setLoading(true);
    try {
      // 1. Verify connectivity
      setStatus('Connecting to IPFS node...');
      const keys = await listKeys(IPFS_API_URL);

      const keyName = `ipfsgram-${trimmedUsername}`;

      // 2. Check if key already exists or create it
      let keyId: string;
      const existing = keys.Keys.find((k) => k.Name === keyName);
      if (existing) {
        keyId = existing.Id;
        setStatus('Found existing IPNS key...');
      } else {
        setStatus('Creating IPNS key...');
        const newKey = await generateKey(IPFS_API_URL, keyName);
        keyId = newKey.Id;
      }

      // 3. Upload empty feed index
      setStatus('Creating feed...');
      const emptyFeed: FeedIndex = {
        username: trimmedUsername,
        displayName: trimmedDisplay,
        posts: [],
      };
      const feedCid = await uploadJson(IPFS_API_URL, emptyFeed);

      // 4. Publish to IPNS (this is slow!)
      setStatus('Publishing to IPNS (this may take 10-30s)...');
      await publishToIpns(IPFS_API_URL, feedCid, keyName);

      // 5. Save profile
      await saveProfile({
        username: trimmedUsername,
        displayName: trimmedDisplay,
        apiUrl: IPFS_API_URL,
        gatewayUrl: IPFS_API_URL.replace(':5001', ':8080'),
        ipnsKeyId: keyId,
        ipnsKeyName: keyName,
        feedCid,
      });

      // 6. Tell root layout we have a profile now
      setHasProfile(true);
    } catch (err: any) {
      Alert.alert('Setup Failed', err.message || 'Could not connect to IPFS node.');
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
      <View style={styles.inner}>
        <Text style={styles.title}>IPFSGram</Text>
        <Text style={styles.subtitle}>Decentralized photo sharing</Text>

        <TextInput
          style={styles.input}
          placeholder="Username (e.g. alice)"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Display Name (e.g. Alice)"
          value={displayName}
          onChangeText={setDisplayName}
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Get Started</Text>
          )}
        </TouchableOpacity>

        {status ? <Text style={styles.status}>{status}</Text> : null}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    padding: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#0095f6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
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
