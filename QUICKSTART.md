# Quick Start Guide

## 5-Minute Setup

### Step 1: Supabase Setup (3 minutes)

1. Go to [supabase.com](https://supabase.com) → Create Account
2. Create a new project
3. Go to **SQL Editor** → Copy & paste all SQL from `SUPABASE_SETUP.sql` → Run
4. Go to **Settings → API** → Copy:
   - Project URL (starts with https://...)
   - Anon Key (long string)

### Step 2: Update .env.local (1 minute)

Edit `.env.local` and paste your Supabase credentials:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 3: Run the App (1 minute)

```bash
cd secure-messenger
npm run android
# OR: npx expo start (then scan QR with Expo Go app)
```

That's it! 🎉

---

## What's Included

✅ **Crypto Module** (`crypto.js`)
- NaCl encryption/decryption
- Key generation
- Fingerprint hashing

✅ **Components**
- `AuthScreen.jsx` - Sign up / Login
- `ChatScreen.jsx` - 1:1 messaging
- `ContactList.jsx` - Manage contacts
- `KeyDisplay.jsx` - Show your keys & fingerprint

✅ **Backend**
- Supabase integration
- User authentication
- Row Level Security (RLS)

✅ **Navigation**
- Bottom tab navigation
- Contact switching

---

## Testing with 2 Users

1. Create Account 1 on Device A (or Emulator A)
2. Create Account 2 on Device B (or Emulator B)
3. On Device A: Go to Keys tab → Share fingerprint with Device B
4. On Device B: Go to Contacts → Add Account 1 → Select by fingerprint
5. Open chat and start messaging!

All messages are **encrypted end-to-end**. 🔐

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Cannot find module" | Run `npm install` again |
| Blank contact list | Check Supabase RLS policies; restart app |
| "Failed to decrypt" | Verify contact's public key; re-add contact |
| Supabase connection error | Check `.env.local` credentials; verify project is online |

---

## Next Steps

1. ✅ Create Supabase project
2. ✅ Update `.env.local`
3. ✅ Run `npm run android` or `npx expo start`
4. ✅ Test with 2+ accounts
5. Optional: Deploy APK with EAS (`eas build`)

Happy secure messaging! 🚀
