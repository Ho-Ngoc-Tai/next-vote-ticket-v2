import CryptoJS from "crypto-js";
import { env } from "next-runtime-env";

/**
 * Lấy secret key cho encryption/decryption
 * - Server-side: ưu tiên CRYPTO_JS_SECRET_KEY (không expose), fallback NEXT_PUBLIC_CRYPTO_JS_SECRET_KEY
 * - Client-side: dùng NEXT_PUBLIC_CRYPTO_JS_SECRET_KEY hoặc next-runtime-env
 */
const getSecretKey = (): string => {
  // Server-side: ưu tiên dùng biến không có NEXT_PUBLIC_ để bảo mật
  if (typeof window === "undefined") {
    const serverKey = process.env.CRYPTO_JS_SECRET_KEY || env("NEXT_PUBLIC_CRYPTO_JS_SECRET_KEY") || "";

    if (!serverKey) {
      console.error("❌ [SERVER] CRYPTO_JS_SECRET_KEY is not configured");
    } else {
      console.warn("✅ [SERVER] Using secret key, length:", serverKey.length);
    }

    return serverKey;
  }

  // Client-side: dùng NEXT_PUBLIC_ hoặc next-runtime-env
  const clientKey = env("NEXT_PUBLIC_CRYPTO_JS_SECRET_KEY") || "";

  if (!clientKey) {
    console.warn("⚠️ [CLIENT] NEXT_PUBLIC_CRYPTO_JS_SECRET_KEY is not configured");
  }

  return clientKey;
};

export const encryptCryptoJS = (input: string) => {
  const secretKey = getSecretKey();
  if (!secretKey) {
    console.error("❌ Cannot encrypt: Secret key is missing");
    throw new Error("Encryption secret key is missing");
  }

  try {
    return CryptoJS.AES.encrypt(input, secretKey).toString();
  } catch (error) {
    console.error("❌ Encryption error:", error);
    throw error;
  }
};

export const decryptCryptoJS = (input: string) => {
  const secretKey = getSecretKey();
  if (!secretKey) {
    console.error("❌ Cannot decrypt: Secret key is missing");
    throw new Error("Decryption secret key is missing");
  }

  if (!input || typeof input !== "string") {
    console.error("❌ Invalid input for decryption:", typeof input);
    throw new Error("Invalid encrypted input");
  }

  try {
    const decrypted = CryptoJS.AES.decrypt(input, secretKey).toString(CryptoJS.enc.Utf8);

    if (!decrypted) {
      console.error("❌ Decryption failed: Empty result. Check if secret key matches.");
      console.error("❌ Encrypted input length:", input.length);
      console.error("❌ Secret key length:", secretKey.length);
      console.error("❌ Encrypted input (first 50 chars):", input.substring(0, 50));
      throw new Error("Decryption failed: Invalid secret key or corrupted data");
    }

    return decrypted;
  } catch (error) {
    console.error("❌ Decryption error:", error);
    console.error("❌ Encrypted input (first 50 chars):", input.substring(0, 50));
    throw error;
  }
};

export const shouldEncrypt = () => {
  return env("NEXT_PUBLIC_ENABLE_ENCRYPT") === "true" || process.env.NEXT_PUBLIC_ENABLE_ENCRYPT === "true";
};
