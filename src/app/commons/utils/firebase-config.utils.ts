// src/lib/firebaseClient.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth, browserLocalPersistence, setPersistence } from "firebase/auth";
import { env } from "next-runtime-env";

/**
 * ⚙️ Firebase Config — đọc từ biến môi trường runtime (chạy cả client)
 */
const firebaseConfig = {
  apiKey: env("NEXT_PUBLIC_FIREBASE_API_KEY"),
  authDomain: env("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
  projectId: env("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
  storageBucket: env("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: env("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
  appId: env("NEXT_PUBLIC_FIREBASE_APP_ID"),
  measurementId: env("NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID"),
};

/**
 * 🧩 Khởi tạo Firebase chỉ một lần
 */
function createFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) return getApp();
  return initializeApp(firebaseConfig);
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let provider: GoogleAuthProvider | null = null;

/**
 * 🚀 Chỉ khởi tạo ở client-side để tránh lỗi SSR
 */
if (typeof window !== "undefined") {
  app = createFirebaseApp();
  auth = getAuth(app);
  provider = new GoogleAuthProvider();

  // Hiển thị popup chọn tài khoản Google
  provider.setCustomParameters({ prompt: "select_account" });

  // ✅ Safari fix: dùng local persistence để lưu token ổn định hơn
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.warn("Firebase persistence setup failed:", err);
  });
}

/**
 * 🧩 Export để dùng trong client
 */
export { app, auth, provider };
