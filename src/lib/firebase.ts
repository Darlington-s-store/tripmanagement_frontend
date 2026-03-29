import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAebZ-6Rv6BaPbs6Vu7h4JddIrgMTtWg9U",
  authDomain: "tripease-beadd.firebaseapp.com",
  databaseURL: "https://tripease-beadd-default-rtdb.firebaseio.com",
  projectId: "tripease-beadd",
  storageBucket: "tripease-beadd.firebasestorage.app",
  messagingSenderId: "84712210666",
  appId: "1:84712210666:web:eef9cf71086771bf175793",
  measurementId: "G-G0CY40NTRY"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGooglePopup = () => signInWithPopup(auth, googleProvider);
export const signInWithGoogleRedirect = () => signInWithRedirect(auth, googleProvider);
export { getRedirectResult };
