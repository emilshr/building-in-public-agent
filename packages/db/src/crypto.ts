import crypto from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32;
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function getEncryptionSecret(): string {
  const secret = process.env.ENCRYPTION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("ENCRYPTION_SECRET must be set and at least 32 characters");
  }
  return secret;
}

function deriveKey(salt: Buffer, userId: string): Buffer {
  return Buffer.from(
    crypto.hkdfSync(
      "sha256",
      getEncryptionSecret(),
      salt,
      `api-key-encryption:${userId}`,
      KEY_LENGTH,
    ),
  );
}

/**
 * Encrypts a plaintext API key using AES-256-GCM with a per-user derived key.
 * Returns a base64-encoded string containing: salt + iv + authTag + ciphertext.
 */
export function encryptApiKey(plaintext: string, userId: string): string {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = deriveKey(salt, userId);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  const result = Buffer.concat([salt, iv, authTag, encrypted]);
  return result.toString("base64");
}

/**
 * Decrypts a base64-encoded encrypted API key blob.
 * Expects format: salt (16 bytes) + iv (12 bytes) + authTag (16 bytes) + ciphertext.
 */
export function decryptApiKey(encryptedBlob: string, userId: string): string {
  const data = Buffer.from(encryptedBlob, "base64");

  const salt = data.subarray(0, SALT_LENGTH);
  const iv = data.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const authTag = data.subarray(
    SALT_LENGTH + IV_LENGTH,
    SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH,
  );
  const ciphertext = data.subarray(
    SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH,
  );

  const key = deriveKey(salt, userId);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}
