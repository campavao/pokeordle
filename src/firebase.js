import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
const firebaseConfig = {
  apiKey: import.meta.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: 'pokeordle.firebaseapp.com',
  projectId: 'pokeordle',
  storageBucket: 'pokeordle.appspot.com',
  messagingSenderId: import.meta.env.REACT_APP_FIREBASE_SENDER_ID,
  appId: import.meta.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: import.meta.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};
const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
