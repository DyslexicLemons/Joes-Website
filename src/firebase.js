// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDKnWfCo6BEuPZMvl-ue_xjYu43z39LQqg",
  authDomain: "joes-website-cc756.firebaseapp.com",
  projectId: "joes-website-cc756",
  storageBucket: "joes-website-cc756.firebasestorage.app",
  messagingSenderId: "868844319836",
  appId: "1:868844319836:web:f96781fe3f05e29a18e299",
  measurementId: "G-LMZPBZWNFD"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
