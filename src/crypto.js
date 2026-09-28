import nacl from 'tweetnacl';

// Base64 encoding/decoding helpers (tweetnacl-util replacement)
function encodeBase64(u8a) {
  let binary = '';
  for (let i = 0; i < u8a.byteLength; i++) {
    binary += String.fromCharCode(u8a[i]);
  }
  return btoa(binary);
}

function decodeBase64(str) {
  const binary = atob(str);
  const u8a = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    u8a[i] = binary.charCodeAt(i);
  }
  return u8a;
}

function encodeUTF8(str) {
  return new TextEncoder().encode(str);
}

function decodeUTF8(u8a) {
  return new TextDecoder().decode(u8a);
}

// Generate keypair once per device
export function generateKeys() {
  const keypair = nacl.box.keyPair();
  return {
    publicKeyHex: encodeBase64(keypair.publicKey),
    privateKeyHex: encodeBase64(keypair.secretKey),
  };
}

// Encrypt message to recipient
export function encryptMessage(plaintext, recipientPublicKeyHex) {
  const recipientPublicKey = decodeBase64(recipientPublicKeyHex);
  const nonce = nacl.randomBytes(24);
  const ephemeral = nacl.box.keyPair();

  const encrypted = nacl.box(
    encodeUTF8(plaintext),
    nonce,
    recipientPublicKey,
    ephemeral.secretKey
  );

  // Combine ephemeral public key + nonce + encrypted message
  const combined = new Uint8Array(
    ephemeral.publicKey.length + nonce.length + encrypted.length
  );
  combined.set(ephemeral.publicKey, 0);
  combined.set(nonce, ephemeral.publicKey.length);
  combined.set(encrypted, ephemeral.publicKey.length + nonce.length);

  return encodeBase64(combined);
}

// Decrypt message with recipient's private key
export function decryptMessage(payload, privateKeyHex) {
  try {
    const combined = decodeBase64(payload);
    const ephemeralPublicKey = combined.slice(0, 32);
    const nonce = combined.slice(32, 56);
    const encrypted = combined.slice(56);
    const privateKey = decodeBase64(privateKeyHex);

    const decrypted = nacl.box.open(
      encrypted,
      nonce,
      ephemeralPublicKey,
      privateKey
    );

    if (!decrypted) {
      throw new Error('Decryption failed');
    }

    return decodeUTF8(decrypted);
  } catch (error) {
    throw new Error(`Decryption error: ${error.message}`);
  }
}

// Get 16-character fingerprint from public key for verification
export function getFingerprint(publicKeyHex) {
  try {
    const publicKeyBytes = decodeBase64(publicKeyHex);
    // Hash first 16 bytes, take first 16 characters when base64 encoded
    const hash = nacl.hash(publicKeyBytes).slice(0, 12);
    const fingerprint = encodeBase64(hash)
      .replace(/[+/=]/g, '') // Remove padding chars
      .substring(0, 16)
      .toUpperCase();
    return fingerprint;
  } catch (error) {
    console.error('Fingerprint error:', error);
    return 'ERROR_GENERATING_FINGERPRINT';
  }
}
