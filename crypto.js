import nacl from 'tweetnacl';
import * as naclUtils from 'tweetnacl-util';

// Generate keypair once per device
export function generateKeys() {
  const keypair = nacl.box.keyPair();
  return {
    publicKeyHex: naclUtils.encodeBase64(keypair.publicKey),
    privateKeyHex: naclUtils.encodeBase64(keypair.secretKey),
  };
}

// Encrypt message to recipient
export function encryptMessage(plaintext, recipientPublicKeyHex) {
  const recipientPublicKey = naclUtils.decodeBase64(recipientPublicKeyHex);
  const nonce = nacl.randomBytes(24);
  const ephemeral = nacl.box.keyPair();

  const encrypted = nacl.box(
    naclUtils.decodeUTF8(plaintext),
    nonce,
    recipientPublicKey,
    ephemeral.secretKey
  );

  return {
    nonce: naclUtils.encodeBase64(nonce),
    ephemeral: naclUtils.encodeBase64(ephemeral.publicKey),
    ciphertext: naclUtils.encodeBase64(encrypted),
  };
}

// Decrypt message
export function decryptMessage(payload, privateKeyHex) {
  const privateKey = naclUtils.decodeBase64(privateKeyHex);
  const nonce = naclUtils.decodeBase64(payload.nonce);
  const ephemeralKey = naclUtils.decodeBase64(payload.ephemeral);
  const ciphertext = naclUtils.decodeBase64(payload.ciphertext);

  const plaintext = nacl.box.open(ciphertext, nonce, ephemeralKey, privateKey);
  if (!plaintext) throw new Error('Decryption failed');

  return naclUtils.encodeUTF8(plaintext);
}

// Generate fingerprint from public key (for manual verification)
export function getFingerprint(publicKeyHex) {
  const publicKey = naclUtils.decodeBase64(publicKeyHex);
  const hash = nacl.hash(publicKey);
  return naclUtils.encodeBase64(hash).slice(0, 16);
}
