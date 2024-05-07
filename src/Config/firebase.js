
import { initializeApp } from "firebase/app";
import { getDatabase} from "firebase/database";
import { getStorage } from "firebase/storage";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyCyL_tdbtD2XEHE7FNz6aqhuf-Zet8bBug",
  authDomain: "lyricalwings-b7333.firebaseapp.com",
  databaseURL: "https://lyricalwings-b7333-default-rtdb.firebaseio.com",
  projectId: "lyricalwings-b7333",
  storageBucket: "lyricalwings-b7333.appspot.com",
  messagingSenderId: "317875842561",
  appId: "1:317875842561:web:98173c7bb9cbcd00ed9a00",
  measurementId: "G-6X5MXQ99NP"
};

// Initialize Firebase
 const app = initializeApp(firebaseConfig);
 const db = getDatabase(app); 
 const storage = getStorage(app);
const auth = getAuth(app);

const emailPasswordSignUp = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

const emailPasswordLogin = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

const googleLogin = () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

export { app, db, storage, auth, emailPasswordSignUp, emailPasswordLogin, googleLogin };

