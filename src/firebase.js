// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAtURwwQKg6c-T-fhbCq1dhwZTHn480l80",
  authDomain: "rkjewellersauth.firebaseapp.com",
  projectId: "rkjewellersauth",
  storageBucket: "rkjewellersauth.appspot.com",
  messagingSenderId: "323448023466",
  appId: "1:323448023466:web:10ab772d109922dc08a3d3",
  measurementId: "G-7MY0E8SH9K" // optional, safe to keep
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export { signOut };