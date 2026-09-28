# Secure Messenger

A minimal, end-to-end encrypted messaging app for Android inspired by Threema. Built with React Native/Expo and NaCl encryption.

## Features

- **End-to-End Encryption**: Uses NaCl (tweetnacl.js) for X25519 key exchange and encrypted messaging
- **Zero-Knowledge Backend**: Server stores only encrypted payloads; plaintext never leaves your device
- **Contact Verification**: Share fingerprints to verify you're talking to the right person
- **No Read Receipts**: Simple, clean UX — messages appear when opened
- **Minimal UI**: Focus on security and usability for small groups (5 users max)

## Architecture

```
Client (React Native)
  ↓ Encrypted Payload (HTTPS)
Supabase Cloud (Backend)
  ├─ Authentication
  ├─ Key Storage (public keys only)
  └─ Message Storage (encrypted blobs)
```

## Prerequisites

- **Node.js** (v16+) and npm
- **Expo CLI**: `npm install -g expo-cli`
- **Android Emulator** or physical Android phone with Expo Go app
- **Supabase Account** (free tier sufficient for 5 users)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd secure-messenger
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In the SQL Editor, paste the contents of `SUPABASE_SETUP.sql` and run it
3. Get your **Project URL** and **Anon Key** from:
   - Settings → API
   - Copy the "Project URL" and "anon public" key

### 3. Configure Environment Variables

Edit `.env.local`:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run the App

**Option A: Android Emulator**
```bash
npm run android
```

**Option B: Physical Phone (Expo Go)**
```bash
npx expo start
# Scan QR code with Expo Go app
```

## First Time Setup

1. **Create Accounts**: Sign up on the login screen
2. **Share Keys**: Go to the "🔑 Keys" tab, share your fingerprint with other users
3. **Add Contacts**: On "💬 Contacts" tab, click "+ Add Contact" and select users by their fingerprint
4. **Verify & Chat**: Once contacts are added, start messaging!

## Project Structure

```
secure-messenger/
├── App.js                      # Main navigation & state
├── crypto.js                   # NaCl encryption/decryption
├── supabaseClient.js           # Supabase setup
├── .env.local                  # Environment variables (DO NOT COMMIT)
├── SUPABASE_SETUP.sql          # Database schema
├── components/
│   ├── AuthScreen.jsx          # Login/signup
│   ├── ChatScreen.jsx          # Messaging UI
│   ├── ContactList.jsx         # Contact management
│   └── KeyDisplay.jsx          # Key verification
├── package.json
└── README.md
```

## Security Model

### Key Generation
- **On first login**: Device generates X25519 keypair
- **Private key**: Stored locally in React Native AsyncStorage (encrypted by device OS)
- **Public key**: Stored on Supabase, visible to all users (needed for encryption)

### Message Encryption
1. User types message
2. App fetches recipient's public key from server
3. App encrypts with NaCl box (X25519 + XSalsa20-Poly1305)
4. Encrypted blob sent to server
5. Recipient decrypts with their private key

### What Server Can't See
- Plaintext messages
- Private keys
- User identities (only public keys and usernames)

### What To Verify
- **Fingerprint**: Short hash of public key. Compare via:
  - QR code scan (future enhancement)
  - Voice/video call
  - In-person meeting

## Limitations

- **No group chat** (1:1 only for simplicity)
- **No forward secrecy** (no session ratcheting like Signal)
- **No message editing/deletion** (immutable by design)
- **No file sharing** yet (text only for MVP)
- **5-user max** (design constraint)

## Future Enhancements

- [ ] QR code key exchange
- [ ] File/image sharing (encrypted)
- [ ] Typing indicators (optional, privacy-conscious)
- [ ] Message search
- [ ] Backup/restore (encrypted)
- [ ] Group chat

## Deployment

### Production Build for Android

```bash
# Build APK for testing
eas build --platform android --profile preview

# Build for production
eas build --platform android --profile production
```

(Requires Expo account and EAS CLI setup)

## Security Considerations

### For 5-User Prototype:
✅ Good enough:
- Encryption at rest (client-side)
- Zero-knowledge backend
- Fingerprint verification

⚠️ Not implemented (but OK for MVP):
- Forward secrecy (assumes device isn't compromised)
- Perfect forward secrecy ratcheting
- Encrypted backups
- Key rotation

### Recommendations:
1. **Use only on personal trusted networks**
2. **Always verify fingerprints** before trusting contacts
3. **Don't delete private key file** (unrecoverable)
4. **Update frequently** as features/security improve

## Troubleshooting

### "Failed to decrypt" error
- Ensure you're using the correct private key
- Check that contact's public key is correct
- Try deleting and re-adding the contact

### Messages not syncing
- Check internet connection
- Verify Supabase credentials in `.env.local`
- Check Supabase project status (supabase.com/dashboard)
- Restart the app

### Blank contact list
- Ensure other users have signed up
- Check Row Level Security policies in Supabase
- Verify `users` table has entries

## License

MIT

## Support

For issues or questions:
1. Check this README
2. Review the code comments in `crypto.js`
3. Test with fresh Supabase project
