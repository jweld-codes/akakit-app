// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD9GKif66MyOo263aNNc-EFOlgxjZl6_B0",
  authDomain: "akakitapp.firebaseapp.com",
  projectId: "akakitapp",
  storageBucket: "akakitapp.firebasestorage.app",
  messagingSenderId: "573915777369",
  appId: "1:573915777369:web:58a9db8b253ddeac36a448"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db=getFirestore(app);
