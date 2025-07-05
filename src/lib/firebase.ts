import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// --- Firebase Configuration ---
// The configuration object below is a placeholder. You must replace it
// with your project's actual Firebase configuration to connect the app.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
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
