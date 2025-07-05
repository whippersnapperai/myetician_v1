import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// --- Firebase Configuration ---
// This object contains the credentials for your Firebase project.
// It's crucial that these values exactly match the ones in your
// Firebase project's settings to ensure a secure and successful connection.
const firebaseConfig = {
  apiKey: "AIzaSyAUFUIhPIVJfBbliM8YiYMX1jbRrq4l3_w",
  authDomain: "project-594504357737.firebaseapp.com",
  projectId: "project-594504357737",
  storageBucket: "project-594504357737.appspot.com",
  messagingSenderId: "594504357737",
  appId: "1:594504357737:web:e98ac2c7957b2ff21ccff8",
};

// --- Firebase Initialization ---
// We initialize the Firebase app, auth, and database instances here.
// This logic ensures that Firebase is only initialized once, preventing
// errors that can occur from re-initialization on hot reloads.
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

// We hardcode this to true because the configuration is now baked into the code.
// This satisfies other parts of the app that check this flag.
export const isFirebaseConfigured = true;

export { app, auth, db };
