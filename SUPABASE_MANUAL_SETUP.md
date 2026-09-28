# Supabase Manual Setup Guide

Since you want full control, here's exactly how to set up Supabase for the Secure Messenger app.

## Step 1: Create Supabase Account

1. Go to **https://supabase.com/dashboard/sign-up**
2. Sign up with your email (use hello@shoporiginwear.com or any email you prefer)
3. Check your email for verification link
4. Click the link to verify your account
5. You'll be redirected to the dashboard

## Step 2: Create a New Project

1. In the Supabase dashboard, click **"New project"** or **"Create"**
2. Fill in these details:
   - **Project name**: `secure-messenger` (or any name you like)
   - **Database password**: Create a strong password (you won't need this for our app)
   - **Region**: Choose closest to you (e.g., `us-east-1`)
   - **Pricing plan**: Free tier is fine for 5 users

3. Click **"Create new project"**
4. Wait 2-3 minutes for the project to initialize

## Step 3: Get Your Project Credentials

Once your project is created:

1. Go to **Settings** → **API** (in the left sidebar)
2. You'll see two keys:
   - **Project URL** (starts with `https://...supabase.co`) — copy this
   - **Anon Public Key** (a long string) — copy this
3. Also note the **Service Role Secret Key** (you may need this later)

## Step 4: Set Up Database Tables

1. In your Supabase project, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Copy & paste the ENTIRE contents of `SUPABASE_SETUP.sql` from your project
4. Click **"Run"** (or Ctrl+Enter)
5. Wait for the SQL to execute (should complete in <5 seconds)
6. You should see "Success" messages for each table creation

### What the SQL creates:
- `users` table — stores username & public keys
- `messages` table — stores encrypted messages
- `contacts` table — stores user contacts
- Row-level security policies — prevents cross-user access
- Indexes — for fast queries

## Step 5: Update Your .env.local

1. Open `/c/Users/Device/secure-messenger/.env.local` in any text editor
2. Replace the placeholder values:

```
EXPO_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY-HERE
```

Example (don't use these!):
```
EXPO_PUBLIC_SUPABASE_URL=https://abcd1234.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. Save the file

## Step 6: Verify Setup (Optional but Recommended)

In Supabase dashboard:
1. Go to **Table Editor** (left sidebar)
2. You should see 3 tables:
   - `users`
   - `messages`
   - `contacts`

If you see these, the database setup is complete! ✅

## Step 7: Run Your App

```bash
cd C:\Users\Device\secure-messenger
npm run android
# OR: npx expo start
```

The app should now connect to your Supabase backend.

## Troubleshooting

### "Table not found" error
- Make sure you ran the entire `SUPABASE_SETUP.sql` script
- Check that all tables appear in the Table Editor
- Try running the SQL again

### "Invalid credentials" error
- Double-check the URL and Anon Key in `.env.local`
- Make sure there are no extra spaces
- Make sure `.env.local` file exists (not `.env`)

### "RLS policy error"
- The policies created by the SQL will prevent some operations if not using auth
- Make sure you're signed in to the app before sending messages

## Next: Test the App

1. Sign up on the app (creates a user in Supabase)
2. Create 2+ accounts on 2 devices/emulators
3. Add contacts using fingerprints
4. Send encrypted messages!

All messages are encrypted end-to-end — even Supabase can't read them. 🔐

---

**Need help?** Check Supabase docs: https://supabase.com/docs
