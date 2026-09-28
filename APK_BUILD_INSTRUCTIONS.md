# Build Secure Messenger APK Locally

## Prerequisites
- Android SDK installed
- Node.js 18+
- Expo CLI

## Quick Build (5-10 minutes)

```bash
# 1. Clone the repository
git clone https://github.com/originwear/secure-messenger.git
cd secure-messenger

# 2. Install dependencies
npm install

# 3. Build with Expo
npx expo run:android

# 4. APK will be created at:
# android/app/build/outputs/apk/release/app-release.apk
```

## Online Alternative

If Android SDK not installed:
1. Visit: https://bitrise.io (free tier available)
2. Connect GitHub repo
3. Configure Expo build
4. Download APK

## For Distribution

Once APK is built, share the file via:
- Google Drive (private link)
- Dropbox
- GitHub Release
- AWS S3 (pre-signed URL)

---
**Security Note**: This app uses military-grade NaCl encryption. Verify signatures before installation.
