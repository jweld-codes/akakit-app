// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";



// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "",
  authDomain: "akakitapp.firebaseapp.com",
  projectId: "",
  storageBucket: "akakitapp.firebasestorage.app",
  messagingSenderId: "",
  appId: ""
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db=getFirestore(app);
