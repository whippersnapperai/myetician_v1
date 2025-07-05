
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAUFUIhPIVJfBbliM8YiYMX1jbRrq4l3_w",
  authDomain: "project-594504357737.firebaseapp.com",
  projectId: "project-594504357737",
  storageBucket: "project-594504357737.appspot.com",
  messagingSenderId: "594504357737",
  appId: "1:594504357737:web:e98ac2c7957b2ff21ccff8",
};

export const isFirebaseConfigured =
  !!firebaseConfig.apiKey &&
  !!firebaseConfig.authDomain &&
  !!firebaseConfig.projectId &&
  !firebaseConfig.apiKey.includes("PASTE_YOUR");

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
} else if (typeof window === 'undefined') {
  console.warn(
    "Firebase configuration is missing or incomplete. The app will run in a limited, offline mode. Please check your .env file and make sure all NEXT_PUBLIC_FIREBASE_* variables are set correctly with values from your Firebase project console."
  );
}

export { app, auth, db };
