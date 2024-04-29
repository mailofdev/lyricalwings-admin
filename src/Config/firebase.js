
import { initializeApp } from "firebase/app";
import { getDatabase} from "firebase/database";
import { getStorage } from "firebase/storage";


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
export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app); 
export const storage = getStorage(app);