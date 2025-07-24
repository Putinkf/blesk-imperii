// ---- Важно ----
// Импортируйте Firebase и firebaseConfig согласно вашему окружению.
// Пример импортов ES6 модулей:

import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { getDatabase, ref, set, get, child } from "firebase/database";
import { firebaseConfig } from "js/firebase-config";  // ваш файл с конфигом Firebase

class AuthSystem {
    constructor() {
        this.currentUser = null;

        // Инициализация Firebase
        this.app = initializeApp(firebaseConfig);
        this.auth = getAuth(this.app);
        this.db = getDatabase(this.app);

        this.init();
    }

    init() {
        this.bindEvents();

        // Подписка на изменение статуса авторизации
        onAuthStateChanged(this.auth, (user) => {
            if (user) {
                this.fetchUserData(user.uid).then(userData => {
                    this.currentUser = userData;
                    this.updateUI();
                }).catch(() => {
                    // Если не удалось получить данные, делаем текущего пользователя базовым объектом Firebase User
                    this.currentUser = { email: user.email, uid: user.uid };
                    this.updateUI();
                });
            } else {
                this.currentUser = null;
                this.updateUI();
            }
        });
    }

    bindEvents() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const email = formData.get('email').toLowerCase().trim();
        const password = formData.get('password');

        if (!email || !password) {
            this.showNotification('Пожалуйста, заполните все поля', 'error');
            return;
        }

        try {
            await signInWithEmailAndPassword(this.auth, email, password);
            this.showNotification('Добро пожаловать в Империю!', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const username = formData.get('username').trim();
        const email = formData.get('email').toLowerCase().trim();
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');

        // Валидация
        if (!username || !email || !password || !confirmPassword) {
            this.showNotification('Пожалуйста, заполните все поля', 'error');
            return;
        }

        if (password !== confirmPassword) {
            this.showNotification('Пароли не совпадают', 'error');
            return;
        }

        if (password.length < 6) {
            this.showNotification('Пароль должен содержать минимум 6 символов', 'error');
            return;
        }

        if (!this.validateEmail(email)) {
            this.showNotification('Введите корректный email адрес', 'error');
            return;
        }

        try {
            // Создаем пользователя в Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
            const user = userCredential.user;

            // Записываем дополнительные данные в Realtime Database
            await set(ref(this.db, 'users/' + user.uid), {
                username: username,
                email: email,
                created: Date.now(),
                avatar: username.charAt(0).toUpperCase(),
                role: 'Историк Империи'
            });

            this.showNotification('Аккаунт успешно создан! Теперь войдите в систему', 'success');

            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);

        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    async fetchUserData(uid) {
        const dbRef = ref(this.db);
        const snapshot = await get(child(dbRef, `users/${uid}`));
        if (snapshot.exists()) {
            return snapshot.val();
        } else {
            throw new Error('Данные пользователя не найдены');
        }
    }

    async logout() {
        try {
            await signOut(this.auth);
            this.currentUser = null;
            this.showNotification('Вы вышли из системы', 'info');
            this.updateUI();

            // Перенаправление при необходимости
            if (window.location.pathname.includes('profile') || window.location.pathname.includes('dashboard')) {
                window.location.href = 'index.html';
            }
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    updateUI() {
        const authButtons = document.getElementById('authButtons');
        const userWelcome = document.getElementById('userWelcome');
        const userProfile = document.getElementById('userProfile');
        const userName = document.getElementById('userName');
        const welcomeUserName = document.getElementById('welcomeUserName');
        const userAvatar = document.getElementById('userAvatar');

        if (this.currentUser) {
            if (authButtons) authButtons.style.display = 'none';
            if (userWelcome) {
                userWelcome.style.display = 'block';
                if (welcomeUserName) welcomeUserName.textContent = this.currentUser.username || this.currentUser.email;
            }
            if (userProfile) {
                userProfile.style.display = 'block';
                if (userName) userName.textContent = this.currentUser.username || this.currentUser.email;
                if (userAvatar) userAvatar.textContent = this.currentUser.avatar || (this.currentUser.username ? this.currentUser.username.charAt(0).toUpperCase() : this.currentUser.email.charAt(0).toUpperCase());
            }
        } else {
            if (authButtons) authButtons.style.display = 'flex';
            if (userWelcome) userWelcome.style.display = 'none';
            if (userProfile) userProfile.style.display = 'none';
        }
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showNotification(message, type = 'info') {
        if (window.HistoricalSite && window.HistoricalSite.showNotification) {
            window.HistoricalSite.showNotification(message, type, 3000);
        } else {
            alert(message);
        }
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.AuthSystem = new AuthSystem();
});
