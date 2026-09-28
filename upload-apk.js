const fs = require('fs');
const https = require('https');

// Configuration
const owner = 'originwear';
const repo = 'secure-messenger';
const tagName = 'v1.0.0';
const apkPath = './android/app/build/outputs/apk/release/app-release.apk';

// Get token from environment
const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

if (!token) {
  console.log('⚠️  No GitHub token found in environment variables.');
  console.log('Set GITHUB_TOKEN or GH_TOKEN environment variable.');
  console.log('\nExample:');
  console.log('  export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx');
  console.log('  node upload-apk.js');
  process.exit(1);
}

// Read APK file
if (!fs.existsSync(apkPath)) {
  console.error(`❌ APK file not found: ${apkPath}`);
  process.exit(1);
}

const fileBuffer = fs.readFileSync(apkPath);
const fileName = 'app-release.apk';
const fileSize = (fileBuffer.length / 1024).toFixed(2);

console.log(`📦 Preparing to upload APK...`);
console.log(`   File: ${fileName}`);
console.log(`   Size: ${fileSize} KB`);

// Step 1: Get release ID
const getReleaseOptions = {
  hostname: 'api.github.com',
  path: `/repos/${owner}/${repo}/releases/tags/${tagName}`,
  method: 'GET',
  headers: {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'secure-messenger-uploader'
  }
};

const getReleaseReq = https.request(getReleaseOptions, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    if (res.statusCode !== 200) {
      console.error(`❌ Failed to get release: ${res.statusCode}`);
      console.error(data);
      process.exit(1);
    }

    const release = JSON.parse(data);
    const releaseId = release.id;
    console.log(`✓ Found release ID: ${releaseId}`);

    // Step 2: Upload APK
    uploadAPK(releaseId);
  });
});

getReleaseReq.on('error', (e) => {
  console.error(`❌ Error: ${e.message}`);
  process.exit(1);
});

getReleaseReq.end();

function uploadAPK(releaseId) {
  const uploadUrl = `/repos/${owner}/${repo}/releases/${releaseId}/assets?name=${fileName}`;

  console.log(`\n📤 Uploading APK to release...`);

  const uploadOptions = {
    hostname: 'uploads.github.com',
    path: uploadUrl,
    method: 'POST',
    headers: {
      'Authorization': `token ${token}`,
      'Content-Type': 'application/octet-stream',
      'Content-Length': fileBuffer.length,
      'User-Agent': 'secure-messenger-uploader'
    }
  };

  const uploadReq = https.request(uploadOptions, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      if (res.statusCode === 201) {
        const asset = JSON.parse(data);
        console.log(`✓ Upload successful!`);
        console.log(`\n📥 Download URL:`);
        console.log(`   ${asset.browser_download_url}`);
        console.log(`\n✅ APK is now available for distribution!`);
      } else if (res.statusCode === 422) {
        // Asset might already exist, try to delete and re-upload
        console.log(`⚠️  Asset already exists, attempting to replace...`);
        deleteAndReupload(releaseId);
      } else {
        console.error(`❌ Upload failed: ${res.statusCode}`);
        console.error(data);
        process.exit(1);
      }
    });
  });

  uploadReq.on('error', (e) => {
    console.error(`❌ Upload error: ${e.message}`);
    process.exit(1);
  });

  uploadReq.write(fileBuffer);
  uploadReq.end();
}

function deleteAndReupload(releaseId) {
  const deleteUrl = `/repos/${owner}/${repo}/releases/assets`;

  // Get all assets for this release
  const getAssetsOptions = {
    hostname: 'api.github.com',
    path: `/repos/${owner}/${repo}/releases/${releaseId}/assets`,
    method: 'GET',
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'secure-messenger-uploader'
    }
  };

  const getAssetsReq = https.request(getAssetsOptions, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const assets = JSON.parse(data);
      const existingAsset = assets.find(a => a.name === fileName);

      if (existingAsset) {
        // Delete existing asset
        const deleteAssetOptions = {
          hostname: 'api.github.com',
          path: `/repos/${owner}/${repo}/releases/assets/${existingAsset.id}`,
          method: 'DELETE',
          headers: {
            'Authorization': `token ${token}`,
            'User-Agent': 'secure-messenger-uploader'
          }
        };

        const deleteReq = https.request(deleteAssetOptions, (res) => {
          if (res.statusCode === 204) {
            console.log(`✓ Existing asset deleted`);
            // Now upload the new one
            uploadAPK(releaseId);
          } else {
            console.error(`❌ Failed to delete existing asset`);
            process.exit(1);
          }
        });

        deleteReq.on('error', (e) => {
          console.error(`❌ Delete error: ${e.message}`);
          process.exit(1);
        });

        deleteReq.end();
      }
    });
  });

  getAssetsReq.on('error', (e) => {
    console.error(`❌ Error getting assets: ${e.message}`);
    process.exit(1);
  });

  getAssetsReq.end();
}
