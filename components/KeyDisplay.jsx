import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../supabaseClient';
import { getFingerprint } from '../crypto';

export default function KeyDisplay({ onBack, currentUserId }) {
  const [publicKey, setPublicKey] = useState('');
  const [fingerprint, setFingerprint] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadKeys();
  }, [currentUserId]);

  const loadKeys = async () => {
    try {
      const { data } = await supabase
        .from('users')
        .select('public_key_hex, username')
        .eq('id', currentUserId)
        .single();

      if (data) {
        setPublicKey(data.public_key_hex);
        setFingerprint(getFingerprint(data.public_key_hex));
      }
    } finally {
      setLoading(false);
    }
  };

  const shareKey = async () => {
    try {
      await Share.share({
        message: `My public key for Secure Messenger:\n\n${publicKey}\n\nFingerprint: ${fingerprint}`,
        title: 'My Secure Messenger Public Key',
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Keys</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Fingerprint</Text>
          <Text style={styles.description}>
            Share this 16-character code with your contacts for manual verification.
            Compare it with their fingerprint to ensure you're talking to the right person.
          </Text>
          <View style={styles.fingerprintBox}>
            <Text style={styles.fingerprintText}>{fingerprint}</Text>
          </View>
          <TouchableOpacity style={styles.button} onPress={shareKey}>
            <Text style={styles.buttonText}>Share My Key</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Public Key (Full)</Text>
          <Text style={styles.description}>
            Your public key is stored on the server. Other users use it to encrypt messages to you.
          </Text>
          <View style={styles.keyBox}>
            <Text style={styles.keyText}>{publicKey}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security Notes</Text>
          <Text style={styles.note}>
            • Your private key is stored only on your device in encrypted storage
          </Text>
          <Text style={styles.note}>
            • Never share your private key with anyone
          </Text>
          <Text style={styles.note}>
            • Always verify contact fingerprints before trusting them
          </Text>
          <Text style={styles.note}>
            • Messages are encrypted end-to-end; the server cannot read them
          </Text>
        </View>
      </View>
    </ScrollView>
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
  header: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    color: '#fff',
    fontSize: 16,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    lineHeight: 18,
  },
  fingerprintBox: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  fingerprintText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  keyBox: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  keyText: {
    fontSize: 11,
    color: '#333',
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  note: {
    fontSize: 13,
    color: '#555',
    marginBottom: 8,
    lineHeight: 18,
    marginLeft: 8,
  },
});
