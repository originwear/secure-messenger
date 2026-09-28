-- Supabase SQL Setup for Secure Messenger
-- Run these commands in the Supabase SQL Editor (Database -> SQL Editor)
-- Replace 'auth' schema with your actual auth schema if different

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username VARCHAR(255) NOT NULL UNIQUE,
  public_key_hex TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES users(id),
  recipient_id UUID NOT NULL REFERENCES users(id),
  encrypted_payload TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  contact_id UUID NOT NULL REFERENCES users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, contact_id),
  CONSTRAINT no_self_contact CHECK (user_id != contact_id)
);

-- Create indexes for faster queries
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id);
CREATE INDEX idx_messages_timestamp ON messages(timestamp);
CREATE INDEX idx_contacts_user ON contacts(user_id);
CREATE INDEX idx_contacts_contact ON contacts(contact_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can read their own profile
CREATE POLICY users_select_own ON users
  FOR SELECT USING (auth.uid() = id);

-- RLS Policy: Users can read all public keys (needed for encryption)
CREATE POLICY users_select_all ON users
  FOR SELECT USING (true);

-- RLS Policy: Users can update their own profile
CREATE POLICY users_update_own ON users
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policy: Users can read messages they send or receive
CREATE POLICY messages_select_own ON messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- RLS Policy: Users can insert their own messages
CREATE POLICY messages_insert_own ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- RLS Policy: Users can read their own contacts
CREATE POLICY contacts_select_own ON contacts
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own contacts
CREATE POLICY contacts_insert_own ON contacts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete their own contacts
CREATE POLICY contacts_delete_own ON contacts
  FOR DELETE USING (auth.uid() = user_id);

-- Grant realtime permissions (for live message updates)
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE contacts;
