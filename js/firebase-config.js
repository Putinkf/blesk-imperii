// firebase-config.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBwvgFZ7P4ERGpghFoh2BbETfRLRnJ_im0",
  authDomain: "blesk-impeii-auth.firebaseapp.com",
  projectId: "blesk-impeii-auth",
  storageBucket: "blesk-impeii-auth.firebasestorage.app",
  messagingSenderId: "476696385489",
  appId: "1:476696385489:web:279bb33eb7eda3fc63b2f0",
  measurementId: "G-ZH5D51H9FE"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
