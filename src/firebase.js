import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAonTIsFsQuXRi8wVPJRtaffvfN9Rt9ccc",
  authDomain: "noize-dashboard.firebaseapp.com",
  projectId: "noize-dashboard",
  storageBucket: "noize-dashboard.firebasestorage.app",
  messagingSenderId: "421753622777",
  appId: "1:421753622777:web:f840a9bec38b1387841228",
  measurementId: "G-NHH1TSH4P3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
