import { describe, it, expect, beforeAll } from "vitest";
import { encryptApiKey, decryptApiKey } from "./crypto.js";

beforeAll(() => {
  process.env.ENCRYPTION_SECRET =
    "test-secret-that-is-at-least-32-characters-long!!";
});

describe("encryptApiKey / decryptApiKey", () => {
  it("round-trips a plaintext key", () => {
    const plaintext = "sk-test-1234567890abcdef";
    const userId = "user-1";

    const encrypted = encryptApiKey(plaintext, userId);
    const decrypted = decryptApiKey(encrypted, userId);

    expect(decrypted).toBe(plaintext);
  });

  it("produces different ciphertext each time (random salt+iv)", () => {
    const plaintext = "sk-test-key";
    const userId = "user-1";

    const a = encryptApiKey(plaintext, userId);
    const b = encryptApiKey(plaintext, userId);

    expect(a).not.toBe(b);
  });

  it("fails to decrypt with a different userId", () => {
    const plaintext = "sk-test-key";
    const encrypted = encryptApiKey(plaintext, "user-1");

    expect(() => decryptApiKey(encrypted, "user-2")).toThrow();
  });

  it("fails to decrypt tampered ciphertext", () => {
    const plaintext = "sk-test-key";
    const userId = "user-1";
    const encrypted = encryptApiKey(plaintext, userId);

    const tampered = Buffer.from(encrypted, "base64");
    tampered.writeUInt8(tampered[tampered.length - 1]! ^ 0xff, tampered.length - 1);

    expect(() =>
      decryptApiKey(tampered.toString("base64"), userId),
    ).toThrow();
  });
});
