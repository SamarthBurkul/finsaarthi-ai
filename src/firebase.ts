import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Firebase config - Replace with your actual values from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyAJhlKFihWkXXgSA5O169IvNJw_ra1WCeg",
  authDomain: "finsaarthi-89698.firebaseapp.com",
  projectId: "finsaarthi-89698",
  storageBucket: "finsaarthi-89698.firebasestorage.app",
  messagingSenderId: "609023109118",
  appId: "1:609023109118:web:ca0c394c4dacb0fadf42af"
};

// Initialize Firebase (only if not already initialized)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Auth & Google provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Set additional Google provider settings (optional)
googleProvider.setCustomParameters({
  prompt: "select_account",
});