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
import { getFingerprint } from '../crypto';

export default function ContactList({ onSelectContact, currentUserId, onNavigateToKeys }) {
  const [contacts, setContacts] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [showAddContact, setShowAddContact] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [publicKey, setPublicKey] = useState('');

  useEffect(() => {
    loadContacts();
  }, [currentUserId]);

  const loadContacts = async () => {
    try {
      setLoading(true);

      // Get user's contacts
      const { data: contactsData } = await supabase
        .from('contacts')
        .select('contact_id, users!contacts_contact_id_fkey(id, username, public_key_hex)')
        .eq('user_id', currentUserId);

      setContacts(contactsData || []);

      // Get all other users for adding
      const { data: usersData } = await supabase
        .from('users')
        .select('id, username, public_key_hex')
        .neq('id', currentUserId);

      setAllUsers(usersData || []);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const addContact = async () => {
    if (!selectedUserId) {
      Alert.alert('Error', 'Please select a user');
      return;
    }

    try {
      const { error } = await supabase.from('contacts').insert({
        user_id: currentUserId,
        contact_id: selectedUserId,
      });

      if (error) throw error;

      setSelectedUserId('');
      setShowAddContact(false);
      loadContacts();
      Alert.alert('Success', 'Contact added!');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const filteredContacts = contacts.filter((contact) =>
    contact.users.username.toLowerCase().includes(searchText.toLowerCase())
  );

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
        <Text style={styles.headerTitle}>Contacts</Text>
        <TouchableOpacity
          style={styles.keyButton}
          onPress={onNavigateToKeys}
        >
          <Text style={styles.keyButtonText}>🔑</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Search contacts..."
        value={searchText}
        onChangeText={setSearchText}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowAddContact(!showAddContact)}
      >
        <Text style={styles.addButtonText}>
          {showAddContact ? '✕ Cancel' : '+ Add Contact'}
        </Text>
      </TouchableOpacity>

      {showAddContact && (
        <View style={styles.addContactForm}>
          <Text style={styles.formLabel}>Select user to add:</Text>
          <View style={styles.usersList}>
            {allUsers
              .filter((user) => !contacts.find((c) => c.contact_id === user.id))
              .map((user) => (
                <TouchableOpacity
                  key={user.id}
                  style={[
                    styles.userItem,
                    selectedUserId === user.id && styles.userItemSelected,
                  ]}
                  onPress={() => setSelectedUserId(user.id)}
                >
                  <Text style={styles.userItemText}>{user.username}</Text>
                  <Text style={styles.fingerprint}>
                    {getFingerprint(user.public_key_hex)}
                  </Text>
                </TouchableOpacity>
              ))}
          </View>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={addContact}
          >
            <Text style={styles.confirmButtonText}>Add Selected Contact</Text>
          </TouchableOpacity>
        </View>
      )}

      {filteredContacts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No contacts yet</Text>
          <Text style={styles.emptySubtext}>Add contacts to start messaging</Text>
        </View>
      ) : (
        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.contact_id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.contactItem}
              onPress={() =>
                onSelectContact(item.contact_id, item.users.username)
              }
            >
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{item.users.username}</Text>
                <Text style={styles.contactFingerprint}>
                  {getFingerprint(item.users.public_key_hex)}
                </Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          )}
        />
      )}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  keyButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  keyButtonText: {
    fontSize: 16,
  },
  searchInput: {
    margin: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  addButton: {
    marginHorizontal: 12,
    marginBottom: 12,
    paddingVertical: 10,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  addContactForm: {
    marginHorizontal: 12,
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  formLabel: {
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  usersList: {
    maxHeight: 150,
    marginBottom: 12,
  },
  userItem: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  userItemSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#007AFF',
  },
  userItemText: {
    fontWeight: '600',
    color: '#333',
  },
  fingerprint: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    fontFamily: 'monospace',
  },
  confirmButton: {
    backgroundColor: '#34C759',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
  },
  contactItem: {
    flexDirection: 'row',
    padding: 12,
    marginHorizontal: 12,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  contactFingerprint: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'monospace',
  },
  arrow: {
    fontSize: 24,
    color: '#007AFF',
  },
});
