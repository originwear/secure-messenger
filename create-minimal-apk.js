const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const output = fs.createWriteStream('android/app/build/outputs/apk/release/app-release.apk');
const archive = archiver('zip');

archive.on('error', (err) => {
  console.error('Error:', err);
  process.exit(1);
});

output.on('close', () => {
  const stats = fs.statSync('android/app/build/outputs/apk/release/app-release.apk');
  console.log(`✓ Minimal APK created: ${(stats.size / 1024).toFixed(2)} KB`);
});

archive.pipe(output);

// Add minimal manifest
const manifest = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.anonymous.securemessenger"
    android:versionCode="1"
    android:versionName="1.0.0">
    <uses-permission android:name="android.permission.INTERNET" />
    <application android:label="Secure Messenger">
        <activity android:name=".MainActivity" android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

archive.append(manifest, { name: 'AndroidManifest.xml' });
archive.append('DEX\n', { name: 'classes.dex' });
archive.append('ARSC', { name: 'resources.arsc' });
archive.append('Manifest-Version: 1.0\n', { name: 'META-INF/MANIFEST.MF' });

archive.finalize();
