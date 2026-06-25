import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB2vGR4CJe5spSYk4oV8h7RUvDpmGg36fs",
  authDomain: "drixian.firebaseapp.com",
  projectId: "drixian",
  storageBucket: "drixian.firebasestorage.app",
  messagingSenderId: "979605593162",
  appId: "1:979605593162:web:e6483a9e21ed7e2cdb9ab3",
  measurementId: "G-LZMPEPPKC6"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
