// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.DATABASE_KEY,
  authDomain: process.env.DATABASE_URL,
  projectId: "scana-dash",
  storageBucket: process.env.APP_BUCKET,
  messagingSenderId: process.env.SENDER_ID,
  appId: process.env.APP_ID,
  measurementId: "G-Q3B3Y25YNF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app