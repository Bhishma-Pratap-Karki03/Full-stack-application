import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA4ZbML7yppyHhkCqbVYUKci1t6nH3auU4",
  authDomain: "skill-sync-44787.firebaseapp.com",
  projectId: "skill-sync-44787",
  storageBucket: "skill-sync-44787.firebasestorage.app",
  messagingSenderId: "664429803921",
  appId: "1:664429803921:web:2cb4b77c867584e9110230",
  measurementId: "G-ZC9F2Q983H"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };