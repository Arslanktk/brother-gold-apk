import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDytB6CfrJehbJBa24CG4-ILPIg1eWWLvs",
  authDomain: "brother-gold.firebaseapp.com",
  projectId: "brother-gold",
  storageBucket: "brother-gold.firebasestorage.app",
  messagingSenderId: "526648069177",
  appId: "1:526648069177:web:f1abf5bef1ac74c4f711e8",
  measurementId: "G-TT9T1JCDY2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Enable offline persistence
db.enableIndexedDbPersistence().catch((err) => {
  if (err.code === 'failed-precondition') {
    console.log('Multiple tabs open, persistence can only be enabled in one tab at a time.');
  } else if (err.code === 'unimplemented') {
    console.log('The current browser does not support all of the features required to enable persistence');
  }
});

export default app;