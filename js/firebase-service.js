// firebase-service.js

import { auth, db } from 'js./firebase-config.js';
import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/9.21.0/firebase-auth.js";
import {
  doc, setDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";

export async function registerUser(email, password, username) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Добавляем пользователя в Firestore
    await setDoc(doc(db, "users", user.uid), {
      username: username,
      email: user.email,
      avatar: username.charAt(0).toUpperCase(),
      created: serverTimestamp(),
      role: "user"
    });

    console.log("Пользователь успешно зарегистрирован и добавлен в базу Firestore");
  } catch (error) {
    console.error("Ошибка регистрации:", error);
    throw error;
  }
}
