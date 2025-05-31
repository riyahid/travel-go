import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import Constants from 'expo-constants';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey || "YOUR_API_KEY",
  authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain || "your-app.firebaseapp.com",
  projectId: Constants.expoConfig?.extra?.firebaseProjectId || "your-app",
  storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket || "your-app.appspot.com",
  messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId || "your-sender-id",
  appId: Constants.expoConfig?.extra?.firebaseAppId || "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app; 