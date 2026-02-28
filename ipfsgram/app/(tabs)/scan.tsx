import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { getProfile, addFollowing } from '../../lib/storage';
import { resolveIpns, fetchFeedIndex } from '../../lib/ipfs';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>Camera access is needed to scan QR codes.</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || loading) return;
    setScanned(true);
    setLoading(true);

    try {
      const profile = await getProfile();
      if (!profile) throw new Error('No profile found');

      const ipnsKeyId = data.trim();

      // Don't follow yourself
      if (ipnsKeyId === profile.ipnsKeyId) {
        Alert.alert('Oops', "That's your own QR code!");
        return;
      }

      // Resolve IPNS to get their feed
      setStatus('Resolving IPNS (may take 5-15s)...');
      const feedCid = await resolveIpns(profile.apiUrl, ipnsKeyId);

      setStatus('Fetching profile...');
      const feed = await fetchFeedIndex(profile.apiUrl, feedCid);

      // Save to following
      await addFollowing({
        ipnsKeyId,
        username: feed.username,
        displayName: feed.displayName,
      });

      Alert.alert(
        'Following!',
        `You are now following ${feed.displayName} (@${feed.username}).`,
      );
    } catch (err: any) {
      Alert.alert('Scan Failed', err.message || 'Could not resolve QR code.');
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text style={styles.status}>{status}</Text>
        </View>
      ) : (
        <>
          <CameraView
            style={styles.camera}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          />
          {scanned && (
            <View style={styles.overlay}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => setScanned(false)}
              >
                <Text style={styles.buttonText}>Scan Again</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.hint}>
            <Text style={styles.hintText}>
              Point your camera at another user's QR code to follow them
            </Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    padding: 32,
  },
  camera: {
    flex: 1,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  button: {
    backgroundColor: '#0095f6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    minWidth: 200,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  overlay: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  hint: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  hintText: {
    color: '#fff',
    fontSize: 14,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
    textAlign: 'center',
  },
  status: {
    color: '#666',
    marginTop: 16,
    fontSize: 14,
  },
});
