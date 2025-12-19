// firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Firebase config from Vite env variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: "finsaarthi-89698.firebasestorage.app",
  messagingSenderId: "609023109118",
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase app (avoid re‑initializing in Vite HMR)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Auth + Google provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: "select_account",
});

export default app;
