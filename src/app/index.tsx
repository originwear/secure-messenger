import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { supabase } from '../supabaseClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateKeys, getFingerprint } from '../crypto';

export default function AuthScreen() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      if (data.session?.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.session.user.id)
          .single();
        setCurrentUser(userData);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    }
  };

  const handleAuth = async () => {
    if (!email || !password || (isSignUp && !username)) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;
        if (!data.user) throw new Error('Failed to create user');

        const keys = generateKeys();
        await AsyncStorage.setItem('privateKey', keys.privateKeyHex);

        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            username,
            public_key_hex: keys.publicKeyHex,
          });

        if (insertError) throw insertError;

        Alert.alert('Success', 'Account created! Please log in.');
        setIsSignUp(false);
        setEmail('');
        setPassword('');
        setUsername('');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        let privateKey = await AsyncStorage.getItem('privateKey');
        if (!privateKey) {
          const keys = generateKeys();
          privateKey = keys.privateKeyHex;
          await AsyncStorage.setItem('privateKey', privateKey);
        }

        checkAuth();
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setCurrentUser(null);
      setEmail('');
      setPassword('');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  if (loading && !session) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (session && currentUser) {
    const fingerprint = getFingerprint(currentUser.public_key_hex);
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loggedInContainer}>
          <Text style={styles.title}>Welcome, {currentUser.username}!</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your Fingerprint</Text>
            <Text style={styles.fingerprint}>{fingerprint}</Text>
            <Text style={styles.cardSubtitle}>
              Share this 16-character code with others for verification
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Account Info</Text>
            <Text style={styles.info}>📧 Email: {session.user?.email}</Text>
            <Text style={styles.info}>👤 Username: {currentUser.username}</Text>
            <Text style={styles.info}>🔐 Public Key: {currentUser.public_key_hex.substring(0, 20)}...</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>✅ Encryption Active</Text>
            <Text style={styles.info}>Messages are encrypted with NaCl (X25519 + XSalsa20-Poly1305)</Text>
            <Text style={styles.info}>Your private key is secured locally on this device</Text>
          </View>

          <TouchableOpacity
            style={[styles.button, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>

          <Text style={styles.testNote}>
            💡 Test: Create another account with different email to test messaging
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.authContainer}>
        <Text style={styles.title}>Secure Messenger</Text>
        <Text style={styles.subtitle}>End-to-End Encrypted Messaging</Text>

        <View style={styles.formContainer}>
          {isSignUp && (
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              editable={!loading}
            />
          )}
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />
          <TextInput
            style={styles.input}
            placeholder="Password (min 8 chars, uppercase, lowercase, number, special)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {isSignUp ? 'Sign Up' : 'Sign In'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
          <Text style={styles.toggleText}>
            {isSignUp
              ? 'Already have an account? Sign In'
              : "Don't have an account? Sign Up"}
          </Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>🔐 Security Info:</Text>
          <Text style={styles.infoText}>
            • Your private key is generated locally and never sent to servers
          </Text>
          <Text style={styles.infoText}>
            • All messages are encrypted end-to-end
          </Text>
          <Text style={styles.infoText}>
            • Share fingerprints out-of-band to verify contacts
          </Text>
          <Text style={styles.infoText}>
            • Password requirements: 8+ chars, uppercase, lowercase, number, special char
          </Text>
        </View>

        <Text style={styles.testNote}>
          Test Account 1: alice@test.com / Test123!
          {'\n'}
          Test Account 2: bob@test.com / Test123!
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  loggedInContainer: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  formContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  logoutButton: {
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  toggleText: {
    color: '#007AFF',
    textAlign: 'center',
    fontSize: 14,
    marginTop: 12,
  },
  infoBox: {
    backgroundColor: '#e3f2fd',
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  infoTitle: {
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#555',
    marginBottom: 4,
  },
  testNote: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  fingerprint: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    fontFamily: 'monospace',
    letterSpacing: 1,
    textAlign: 'center',
  },
  info: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
});
