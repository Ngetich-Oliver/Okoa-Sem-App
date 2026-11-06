import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const getFirebaseConfig = () => {
  const env = import.meta.env;

  const config = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
  };

  if (!config.apiKey || !config.authDomain || !config.projectId || !config.appId) {
    console.warn("Firebase env vars are missing. Using a safe demo fallback.");
    return {
      apiKey: "AIzaSyDemoKeyForGoogleAuthUIPreviewOnly",
      authDomain: "demo-google-login.firebaseapp.com",
      projectId: "demo-google-login",
      storageBucket: "demo-google-login.appspot.com",
      messagingSenderId: "1234567890",
      appId: "1:1234567890:web:demo1234567890",
    };
  }

  return config;
};

const app = getApps().length ? getApp() : initializeApp(getFirebaseConfig());

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);