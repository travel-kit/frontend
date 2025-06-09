"use client"

import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getDatabase } from 'firebase/database';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDZrXE2yCa2kJnKvpu3_hYD91CV3tqnnBc",
  authDomain: "travel-kit-614fe.firebaseapp.com",
  projectId: "travel-kit-614fe",
  storageBucket: "travel-kit-614fe.firebasestorage.app",
  messagingSenderId: "581856022223",
  appId: "1:581856022223:web:5286222ebf8440841eb1ba",
  measurementId: "G-1Y9DMV7JN2",
  databaseURL: "https://travel-kit-614fe-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics only in browser environment
let analytics = null;
if (typeof window !== 'undefined') {
  isSupported().then(yes => yes && (analytics = getAnalytics(app)));
}

const db = getDatabase(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, analytics, db, auth, googleProvider }; 