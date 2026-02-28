import React, { createContext, useContext, useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { getProfile } from '../lib/storage';

type AuthContextType = {
  hasProfile: boolean;
  setHasProfile: (v: boolean) => void;
};

export const AuthContext = createContext<AuthContextType>({
  hasProfile: false,
  setHasProfile: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    (async () => {
      const profile = await getProfile();
      setHasProfile(!!profile);
      setIsReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const inSetup = segments[0] === 'setup';

    if (!hasProfile && !inSetup) {
      router.replace('/setup');
    } else if (hasProfile && inSetup) {
      router.replace('/(tabs)');
    }
  }, [isReady, hasProfile, segments]);

  if (!isReady) return null;

  return (
    <AuthContext.Provider value={{ hasProfile, setHasProfile }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="setup" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </AuthContext.Provider>
  );
}
