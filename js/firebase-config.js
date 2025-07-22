// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBwvgFZ7P4ERGpghFoh2BbETfRLRnJ_im0",
  authDomain: "blesk-impeii-auth.firebaseapp.com",
  projectId: "blesk-impeii-auth",
  storageBucket: "blesk-impeii-auth.firebasestorage.app",
  messagingSenderId: "476696385489",
  appId: "1:476696385489:web:279bb33eb7eda3fc63b2f0",
  measurementId: "G-ZH5D51H9FE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);