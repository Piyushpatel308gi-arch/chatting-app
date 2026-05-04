import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDnNAG-0Fp9JM9s-gduvgpetQq4Wfzh_gU",
  authDomain: "chattingapp-bf6a7.firebaseapp.com",
  projectId: "chattingapp-bf6a7",
  storageBucket: "chattingapp-bf6a7.firebasestorage.app",
  messagingSenderId: "189493526708",
  appId: "1:189493526708:web:1abbbe07ceca017a4817e1",
  measurementId: "G-S3SSBD2JCZ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);