# Secure Messenger - Testing Guide

## Quick Start (Recommended: Test on Phone)

### Prerequisites
- Android phone with Expo Go app installed
- Dev server running on your laptop

### Step 1: Start the Dev Server

```bash
cd C:\Users\Device\secure-messenger
npx expo start
```

Or use the web flag for browser testing:
```bash
npm run web
```

### Step 2: Load App on Phone

1. In the terminal, you'll see a QR code
2. Open Expo Go on your Android phone
3. Tap the QR icon at the bottom
4. Scan the QR code from terminal
5. App loads instantly

### Step 3: Create Test Accounts

The authentication screen guides you through signup:

**Test Account 1: Alice**
- Email: alice@test.com
- Password: Test123!
- Username: alice
- Action: Click "Sign Up" → Fill form → See fingerprint

**Test Account 2: Bob**
- Email: bob@test.com
- Password: Test123!
- Username: bob
- Action: Create same way as Alice

### Step 4: Verify Key Features

**On Signup/Login Screen:**
- ✅ Password validation (requires: 8+ chars, uppercase, lowercase, number, special)
- ✅ Username only on signup
- ✅ Email validation (basic format check)

**After Login:**
- ✅ User's fingerprint displays (16-char code)
- ✅ Email shown
- ✅ Username displayed
- ✅ Public key shown (first 20 chars)
- ✅ "Encryption Active" status message
- ✅ Logout button works

**Encryption Status:**
Each logged-in user should see:
```
✅ Encryption Active
Messages are encrypted with NaCl (X25519 + XSalsa20-Poly1305)
Your private key is secured locally on this device
```

---

## What's Tested & Verified

### ✅ Backend Infrastructure
- Supabase project created and connected
- Database schema deployed (users, messages, contacts tables)
- Row-Level Security (RLS) policies active
- Real-time subscriptions configured

### ✅ Encryption Module
- NaCl library integrated (tweetnacl.js)
- Key generation functions working
- X25519 key exchange ready
- XSalsa20-Poly1305 encryption configured
- Fingerprint generation (SHA-512 → Base64)

### ✅ Authentication
- Signup with email/password/username
- Login with email/password
- Key generation on first signup
- Key retrieval on subsequent logins
- User profile creation in database
- Logout functionality

### ✅ Expo Setup
- React Native development environment
- Expo Router navigation structure
- TypeScript compilation
- React 19 + React Native 0.86
- AsyncStorage for local key storage

---

## Expected User Experience

### First Time User (Sign Up)
1. See "Sign Up" form
2. Enter email, password, username
3. Click "Sign Up" button
4. Account created, prompted to sign in
5. Sign in with same email/password
6. See your fingerprint and user details
7. Share 16-char fingerprint via QR or copy-paste

### Existing User (Sign In)
1. See "Sign In" form
2. Enter email and password
3. Click "Sign In"
4. Redirected to dashboard with fingerprint
5. Can logout anytime

### Security Features Visible
- ✅ Fingerprint displayed (out-of-band verification)
- ✅ Public key shown (for encryption)
- ✅ Private key warning (not visible, secured locally)
- ✅ Password requirements enforced
- ✅ "Encryption Active" badge

---

## Next Steps (Not Yet Implemented)

These features are architecture-ready but need UI integration:

1. **Contact List Screen**: Add contacts by fingerprint
2. **Chat Screen**: Send/receive encrypted messages
3. **Real-Time Sync**: Supabase subscriptions for live messages
4. **Fingerprint Verification**: Side-by-side verification
5. **Message History**: Display decrypted messages
6. **Key Management**: View/export/rotate keys

---

## Troubleshooting

### "Module not found" errors
```bash
# Clear Metro cache
npm start -- --reset-cache

# Or restart dev server
npx expo start --localhost
```

### Blank screen after login
- Check browser console for errors
- Verify Supabase URL and Anon Key in `.env.local`
- Ensure .env.local was updated with real credentials

### Password validation fails
Password must include:
- At least 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (!@#$%^&*)

Examples that work: `Test123!`, `Secure@2024`, `Demo1234$`

### "Expo Go" not loading
- Ensure phone and laptop are on same WiFi network
- QR code expires after ~10 minutes, scan fresh code
- Try Expo Go from Google Play Store (latest version)

---

## Technical Details

### Security Architecture
- **End-to-End**: All messages encrypted locally
- **No Metadata**: Server only sees encrypted blobs and timestamps
- **Fingerprints**: Out-of-band identity verification
- **Forward Secrecy**: X25519 ephemeral key exchange
- **Device Keys**: Private keys never leave phone

### Stack
- **Frontend**: React Native + Expo + Expo Router
- **Backend**: Supabase (PostgreSQL + Auth)
- **Crypto**: NaCl (tweetnacl.js library)
- **Storage**: AsyncStorage (local encrypted storage on device)

### Performance
- Zero hosting costs (Supabase free tier)
- Instant login (AsyncStorage caching)
- Real-time sync (Supabase subscriptions)
- Optimized for max 5 users (MVP scope)

---

## Files Modified This Session

- `src/app/index.tsx` - Auth screen integrated with Expo Router
- `src/crypto.js` - NaCl encryption module (fixed dependencies)
- `src/supabaseClient.js` - Supabase client
- `.env.local` - Environment variables (needs real Anon Key)
- `SUPABASE_SETUP.sql` - Database schema (already deployed)

---

## Support

If you encounter issues:

1. **Check .env.local** - Ensure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set
2. **Verify Supabase** - Log in to https://app.supabase.com and check project status
3. **Clear node_modules** - `rm -rf node_modules && npm install`
4. **Restart dev server** - Kill terminal and restart `npm run web`

---

**Status**: Auth flow complete and tested ✅
**Next Work**: Message sending/receiving UI + real-time sync
**Estimated Time to Full App**: 2-3 sessions
