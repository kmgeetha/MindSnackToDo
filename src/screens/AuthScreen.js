// src/screens/AuthScreen.js
import React from 'react';
import { View, Text, Button } from 'react-native';
import { SignIn, SignedIn, SignedOut, useAuth, useUser } from '@clerk/clerk-expo';
import { useNavigation } from '@react-navigation/native';

export default function AuthScreen() {
  const nav = useNavigation();

  return (
    <View style={{ flex: 1 }}>
      <SignedIn>
        <SignedInApp nav={nav} />
      </SignedIn>
      <SignedOut>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 24, marginBottom: 20 }}>Welcome — Sign in</Text>
          <SignIn
            // Clerk SignIn component: show Google and Email options based on your Clerk dashboard
            routing="path"
            path="/"
            afterSignInUrl="/"
          />
        </View>
      </SignedOut>
    </View>
  );
}

function SignedInApp({ nav }) {
  const { signOut } = useAuth();
  const { user } = useUser();

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20 }}>Hello, {user?.firstName || user?.primaryEmailAddress?.emailAddress}</Text>
      <Button title="Go to Todos" onPress={() => nav.replace('Home')} />
      <View style={{ height: 12 }} />
      <Button title="Sign out" onPress={() => signOut()} />
    </View>
  );
}
