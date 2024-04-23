// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth , GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "@firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDxteuZltNQDmOXTgqT23t8xFveppCTOaU",
  authDomain: "lyricalwings-619ac.firebaseapp.com",
  projectId: "lyricalwings-619ac",
  storageBucket: "lyricalwings-619ac.appspot.com",
  messagingSenderId: "749723940208",
  appId: "1:749723940208:web:102b6c9f5007125948cbb5",
  measurementId: "G-2225LRNCZD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const firestoreData = getFirestore(app); 
export const authData = getAuth(app); 
export const provider = new GoogleAuthProvider (); 