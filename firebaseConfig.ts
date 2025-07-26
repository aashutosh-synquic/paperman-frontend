import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB6Iv52LP84c7wYlsRM6xAtnixqOrxZndY",
  authDomain: "paperman-crm.firebaseapp.com",
  projectId: "paperman-crm",
  storageBucket: "paperman-crm.firebasestorage.app",
  messagingSenderId: "168025657307",
  appId: "1:168025657307:web:6da1fa3cf2f57ae9a4e1fe"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
