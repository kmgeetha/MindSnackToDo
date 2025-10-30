// App.js
import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import Constants from 'expo-constants';
import { ClerkProvider, SignedIn, SignedOut, SignIn, useAuth } from '@clerk/clerk-expo';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import AddEditTaskScreen from './src/screens/AddEditTaskScreen';
import GroupsScreen from './src/screens/GroupsScreen';
import { initLocalDb } from './src/services/localDb';
import { useNetwork } from './src/hooks/useNetwork';
import { pushQueueToSupabase, pullRemoteAndMerge } from './src/services/syncManager';

const ClerkPublishableKey =
  Constants.expoConfig?.extra?.CLERK_PUBLISHABLE_KEY ||
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    (async () => {
      try {
        await initLocalDb();
        console.log('✅ Local DB initialized');
      } catch (e) {
        console.error('❌ DB init failed:', e);
      }
    })();
  }, []);

  console.log(12345);


  return (
    <ClerkProvider publishableKey={ClerkPublishableKey}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Auth" component={AuthScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="AddEdit" component={AddEditTaskScreen} />
          <Stack.Screen name="Groups" component={GroupsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ClerkProvider>
  );
}
