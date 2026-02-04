import { initializeApp, getApps } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

const requireConfig = () => {
  const values = Object.values(firebaseConfig);
  const ok = values.every((v) => typeof v === "string" && v.length > 0);
  if (!ok) throw new Error("Firebase env non configurées");
};

const isClient = typeof window !== "undefined";
let app: ReturnType<typeof initializeApp> | undefined = undefined;
if (isClient) {
  app = getApps().length ? getApps()[0] : (() => {
    requireConfig();
    return initializeApp(firebaseConfig);
  })();
}

const _auth: Auth | undefined = isClient && app ? getAuth(app) : undefined;
const _db: Firestore | undefined = isClient && app ? getFirestore(app) : undefined;
const _storage: FirebaseStorage | undefined = isClient && app ? getStorage(app) : undefined;

export const auth = _auth as Auth;
export const db = _db as Firestore;
export const storage = _storage as FirebaseStorage;
export default app;
