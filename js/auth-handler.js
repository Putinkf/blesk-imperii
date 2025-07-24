// Система аутентификации для сайта "Блеск Империи"

class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.users = JSON.parse(localStorage.getItem('empireUsers') || '{}');
        this.sessions = JSON.parse(localStorage.getItem('empireSessions') || '{}');
        this.init();
    }

    init() {
        this.checkCurrentSession();
        this.bindEvents();
        this.updateUI();
    }

    bindEvents() {
        // Обработчики для формы входа
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Обработчики для формы регистрации
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Обработчик выхода
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

        // Проверяем пользователя
        const user = this.users[email];
        if (!user) {
            this.showNotification('Пользователь с таким email не найден', 'error');
            return;
        }

        // Простая проверка пароля (в реальном приложении используйте хеширование)
        if (user.password !== password) {
            this.showNotification('Неверный пароль', 'error');
            return;
        }

        // Создаем сессию
        const sessionId = this.generateSessionId();
        this.sessions[sessionId] = {
            userId: email,
            created: Date.now(),
            expires: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 дней
        };

        localStorage.setItem('empireSessions', JSON.stringify(this.sessions));
        localStorage.setItem('currentSession', sessionId);

        this.currentUser = user;
        this.showNotification('Добро пожаловать в Империю!', 'success');
        
        // Перенаправляем на главную страницу
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
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

        // Проверяем, существует ли пользователь
        if (this.users[email]) {
            this.showNotification('Пользователь с таким email уже существует', 'error');
            return;
        }

        // Создаем нового пользователя
        this.users[email] = {
            username: username,
            email: email,
            password: password, // В реальном приложении хешируйте пароль
            created: Date.now(),
            avatar: username.charAt(0).toUpperCase(),
            role: 'Историк Империи'
        };

        localStorage.setItem('empireUsers', JSON.stringify(this.users));

        this.showNotification('Аккаунт успешно создан! Теперь войдите в систему', 'success');
        
        // Перенаправляем на страницу входа
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    }

    checkCurrentSession() {
        const sessionId = localStorage.getItem('currentSession');
        if (!sessionId) return;

        const session = this.sessions[sessionId];
        if (!session) {
            localStorage.removeItem('currentSession');
            return;
        }

        // Проверяем, не истекла ли сессия
        if (Date.now() > session.expires) {
            delete this.sessions[sessionId];
            localStorage.setItem('empireSessions', JSON.stringify(this.sessions));
            localStorage.removeItem('currentSession');
            return;
        }

        // Восстанавливаем пользователя
        const user = this.users[session.userId];
        if (user) {
            this.currentUser = user;
        }
    }

    logout() {
        const sessionId = localStorage.getItem('currentSession');
        if (sessionId) {
            delete this.sessions[sessionId];
            localStorage.setItem('empireSessions', JSON.stringify(this.sessions));
            localStorage.removeItem('currentSession');
        }

        this.currentUser = null;
        this.showNotification('Вы вышли из системы', 'info');
        this.updateUI();
        
        // Если мы на странице, требующей авторизации, перенаправляем
        if (window.location.pathname.includes('profile') || window.location.pathname.includes('dashboard')) {
            window.location.href = 'index.html';
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
            // Пользователь авторизован
            if (authButtons) authButtons.style.display = 'none';
            if (userWelcome) {
                userWelcome.style.display = 'block';
                if (welcomeUserName) welcomeUserName.textContent = this.currentUser.username;
            }
            if (userProfile) {
                userProfile.style.display = 'block';
                if (userName) userName.textContent = this.currentUser.username;
                if (userAvatar) userAvatar.textContent = this.currentUser.avatar;
            }
        } else {
            // Пользователь не авторизован
            if (authButtons) authButtons.style.display = 'flex';
            if (userWelcome) userWelcome.style.display = 'none';
            if (userProfile) userProfile.style.display = 'none';
        }
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showNotification(message, type = 'info') {
        // Используем существующую функцию уведомлений из app.js
        if (window.HistoricalSite && window.HistoricalSite.showNotification) {
            window.HistoricalSite.showNotification(message, type, 3000);
        } else {
            // Fallback если функция недоступна
            alert(message);
        }
    }

    // Публичные методы для использования в других частях приложения
    isAuthenticated() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }
}

// Инициализация системы аутентификации
document.addEventListener('DOMContentLoaded', () => {
    window.AuthSystem = new AuthSystem();
});
