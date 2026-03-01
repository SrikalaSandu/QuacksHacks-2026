// src/lib/firebase.js
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

// IMPORTANT: Replace with your actual Firebase config
// Get this from: Firebase Console > Project Settings > Add App
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'AIzaSyDemoKey123456789ABCDEFGHIJKLMNOP',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '1:123456789:web:abcdef123456789',
}

// Initialize Firebase
let app
let db = null

try {
  app = initializeApp(firebaseConfig)
  db = getFirestore(app)
} catch (err) {
  console.warn('Firebase initialization failed:', err.message)
  db = null
}

export { db }
