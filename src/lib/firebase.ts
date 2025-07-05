import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// --- Firebase Configuration ---
// The configuration object below is a placeholder. You must replace it
// with your project's actual Firebase configuration to connect the app.
const firebaseConfig = {
  apiKey: "AIzaSyAUFUIhPIVJfBbliM8YiYMX1jbRrq4l3_w",
  authDomain: "myetician.firebaseapp.com",
  databaseURL: "https://myetician-default-rtdb.firebaseio.com",
  projectId: "myetician",
  storageBucket: "myetician.firebasestorage.app",
  messagingSenderId: "594504357737",
  appId: "1:594504357737:web:e98ac2c7957b2ff21ccff8"
};

// Check if the configuration has been filled out
export const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY";

// --- Firebase Initialization ---
// This logic ensures that Firebase is only initialized once if configured.
let app: FirebaseApp;
let auth: Auth | undefined = undefined;
let db: Firestore | undefined = undefined;

if (isFirebaseConfigured) {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
} else {
    console.log("Firebase is not configured. Please add your credentials to src/lib/firebase.ts");
}

export { app, auth, db };
