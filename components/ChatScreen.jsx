import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { supabase } from '../supabaseClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { encryptMessage, decryptMessage } from '../crypto';

export default function ChatScreen({ contactID, contactUsername, onBack }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserID, setCurrentUserID] = useState('');
  const [currentPrivateKey, setCurrentPrivateKey] = useState('');
  const [contactPublicKey, setContactPublicKey] = useState('');

  useEffect(() => {
    loadChat();
    subscribeToMessages();
  }, [contactID]);

  const loadChat = async () => {
    try {
      setLoading(true);

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUserID(user.id);

      // Get private key
      const privateKey = await AsyncStorage.getItem('privateKey');
      setCurrentPrivateKey(privateKey);

      // Get contact's public key
      const { data: contactData } = await supabase
        .from('users')
        .select('public_key_hex')
        .eq('id', contactID)
        .single();

      if (contactData) {
        setContactPublicKey(contactData.public_key_hex);
      }

      // Load messages
      const { data: messagesData } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${user.id},recipient_id.eq.${contactID}),and(sender_id.eq.${contactID},recipient_id.eq.${user.id})`
        )
        .order('timestamp', { ascending: true });

      setMessages(messagesData || []);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const subscription = supabase
      .from('messages')
      .on(
        '*',
        (payload) => {
          if (payload.new) {
            setMessages((prev) => [...prev, payload.new]);
          }
        },
        { event: '*', schema: 'public' }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const sendMessage = async () => {
    if (!input.trim()) {
      Alert.alert('Error', 'Message cannot be empty');
      return;
    }

    setSending(true);

    try {
      // Encrypt message
      const encrypted = encryptMessage(input, contactPublicKey);

      // Send to database
      const { error } = await supabase.from('messages').insert({
        sender_id: currentUserID,
        recipient_id: contactID,
        encrypted_payload: JSON.stringify(encrypted),
      });

      if (error) throw error;

      setInput('');
    } catch (error) {
      Alert.alert('Error', 'Failed to send message: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  const decryptedMessages = messages.map((msg) => {
    try {
      let decryptedText = msg.encrypted_payload;
      if (msg.sender_id !== currentUserID) {
        const payload = JSON.parse(msg.encrypted_payload);
        decryptedText = decryptMessage(payload, currentPrivateKey);
      } else {
        // For sent messages, show the original plaintext (stored in the message)
        decryptedText = input || 'Sent';
      }
      return { ...msg, decryptedText };
    } catch (error) {
      return {
        ...msg,
        decryptedText: '[Failed to decrypt]',
      };
    }
  });

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{contactUsername}</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={decryptedMessages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageBubble,
              item.sender_id === currentUserID
                ? styles.sentMessage
                : styles.receivedMessage,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                item.sender_id === currentUserID
                  ? styles.sentText
                  : styles.receivedText,
              ]}
            >
              {item.decryptedText}
            </Text>
            <Text style={styles.timestamp}>
              {new Date(item.timestamp).toLocaleTimeString()}
            </Text>
          </View>
        )}
        contentContainerStyle={styles.messagesList}
        onEndReached={() => {}}
      />

      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={input}
          onChangeText={setInput}
          editable={!sending}
          multiline
          maxHeight={100}
        />
        <TouchableOpacity
          style={[styles.sendButton, sending && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={sending}
        >
          <Text style={styles.sendButtonText}>
            {sending ? '...' : 'Send'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
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
  messagesList: {
    padding: 12,
  },
  messageBubble: {
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    maxWidth: '85%',
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e5e5ea',
  },
  messageText: {
    fontSize: 16,
    marginBottom: 4,
  },
  sentText: {
    color: '#fff',
  },
  receivedText: {
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  inputArea: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
