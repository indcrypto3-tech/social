
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
// Ensure ENCRYPTION_KEY is exactly 32 bytes (64 hex characters if hex, or raw bytes).
// For simplicity in this env, we'll assume it's a 32-char string or handle padding/hashing.
// A safe production way: Key should be a 32-byte Buffer.
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '12345678901234567890123456789012'; // Fallback for dev only

export function encrypt(text: string): string {
    if (!text) return text;

    // Key must be 32 bytes
    const key = Buffer.from(ENCRYPTION_KEY).subarray(0, 32);
    // IV must be 16 bytes for GCM
    const iv = randomBytes(16);

    const cipher = createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    // Return IV:AuthTag:EncryptedContent
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decrypt(encryptedText: string): string {
    if (!encryptedText) return encryptedText;

    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
        // Fallback for unencrypted tokens (during migration or dev)
        return encryptedText;
    }

    const [ivHex, authTagHex, contentHex] = parts;

    const key = Buffer.from(ENCRYPTION_KEY).subarray(0, 32);
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(contentHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}
