import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD2eV8QCOGZF9rbU94Zg6kCf3sAMip3wzc",
  authDomain: "bbhatt-portfolio.firebaseapp.com",
  projectId: "bbhatt-portfolio",
  storageBucket: "bbhatt-portfolio.firebasestorage.app",
  messagingSenderId: "360510698748",
  appId: "1:360510698748:web:74103730898eb3394ad379",
  measurementId: "G-0737C3J0L6"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Authentication
const auth = getAuth(app);

// Initialize Firestore (Database)
const db = getFirestore(app);

// Initialize Analytics (Conditional)
let analytics = null;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
}).catch((err) => {
  console.warn("Firebase Analytics is not supported in this environment:", err);
});

export { app, analytics, db, auth };