// Основная логика сайта "Блеск Империи"

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', function() {
    // Запуск всех компонентов
    initPreloader();
    initThemeToggle();
    initSidebarMenu();
    initScrollTop();
    initScrollAnimations();
    initPostRatings();
    initTelegramData();
});

// === ПРЕЛОАДЕР ===
function initPreloader() {
    window.addEventListener('load', function() {
        const preloader = document.getElementById('preloader');
        setTimeout(() => {
            preloader.classList.add('hidden');
            setTimeout(() => {
                if (preloader.parentNode) {
                    preloader.remove();
                }
            }, 500);
        }, 1500);
    });
}

// === ПЕРЕКЛЮЧАТЕЛЬ ТЕМЫ ===
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const html = document.documentElement;

    // Загрузка сохраненной темы
    const savedTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', savedTheme);
    themeIcon.textContent = savedTheme === 'light' ? '🌙' : '☀️';

    // Обработчик переключения темы
    themeToggle.addEventListener('click', function() {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        html.setAttribute('data-theme', newTheme);
        themeIcon.textContent = newTheme === 'light' ? '🌙' : '☀️';
        localStorage.setItem('theme', newTheme);
        
        // Анимация переключения
        themeToggle.style.transform = 'rotate(360deg)';
        setTimeout(() => {
            themeToggle.style.transform = '';
        }, 300);
    });
}

// === БОКОВОЕ МЕНЮ ===
function initSidebarMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebarMenu = document.getElementById('sidebarMenu');

    // Переключение меню
    menuToggle.addEventListener('click', function() {
        sidebarMenu.classList.toggle('open');
    });

    // Закрытие меню при клике вне его
    document.addEventListener('click', function(e) {
        if (!sidebarMenu.contains(e.target) && !menuToggle.contains(e.target)) {
            sidebarMenu.classList.remove('open');
        }
    });

    // Закрытие меню при клике на ссылку (для плавной навигации)
    const navLinks = sidebarMenu.querySelectorAll('.sidebar-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Если ссылка ведет к якорю на той же странице
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
            
            // Закрываем меню
            sidebarMenu.classList.remove('open');
        });
    });
}

// === КНОПКА "НАВЕРХ" ===
function initScrollTop() {
    const scrollTop = document.getElementById('scrollTop');

    // Показ/скрытие кнопки при скролле
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollTop.classList.add('visible');
        } else {
            scrollTop.classList.remove('visible');
        }
    });

    // Прокрутка наверх при клике
    scrollTop.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// === АНИМАЦИИ ПРИ СКРОЛЛЕ ===
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Добавляем небольшую задержку для последовательной анимации
                if (entry.target.dataset.delay) {
                    entry.target.style.transitionDelay = entry.target.dataset.delay + 's';
                }
            }
        });
    }, observerOptions);

    // Наблюдаем за всеми элементами с классом scroll-animate
    document.querySelectorAll('.scroll-animate').forEach((el, index) => {
        // Добавляем небольшую задержку для каждого элемента
        el.dataset.delay = (index * 0.1).toString();
        observer.observe(el);
    });
}

// === РЕЙТИНГОВАЯ СИСТЕМА ДЛЯ ОБЫЧНЫХ ПОСТОВ ===
function initPostRatings() {
    const userRatings = JSON.parse(localStorage.getItem('postRatings') || '{}');

    document.querySelectorAll('.rating-stars').forEach(ratingContainer => {
        const postId = ratingContainer.parentElement.parentElement.dataset.postId;
        const stars = ratingContainer.querySelectorAll('.rating-star');
        
        // Восстанавливаем сохраненный рейтинг
        if (userRatings[postId]) {
            const rating = userRatings[postId];
            stars.forEach((star, index) => {
                if (index < rating) {
                    star.classList.add('active');
                }
            });
            
            const countElement = ratingContainer.parentElement.querySelector('.rating-count');
            if (countElement) {
                countElement.textContent = `(1 оценка)`;
            }
            return; // Если уже оценено, не добавляем обработчики
        }
        
        // Добавляем обработчики для неоцененных постов
        stars.forEach((star, index) => {
            star.addEventListener('click', function() {
                if (userRatings[postId]) return; // Предотвращаем повторную оценку
                
                const rating = index + 1;
                
                // Обновляем визуальное отображение
                stars.forEach((s, i) => {
                    if (i < rating) {
                        s.classList.add('active');
                    } else {
                        s.classList.remove('active');
                    }
                });
                
                // Сохраняем в localStorage
                userRatings[postId] = rating;
                localStorage.setItem('postRatings', JSON.stringify(userRatings));
                
                // Обновляем счетчик оценок
                const countElement = ratingContainer.parentElement.querySelector('.rating-count');
                if (countElement) {
                    countElement.textContent = `(1 оценка)`;
                }
                
                // Показываем уведомление
                showNotification(`Спасибо за оценку! Вы поставили ${rating} ${rating === 1 ? 'звезду' : rating <= 4 ? 'звезды' : 'звезд'}`);
            });
            
            // Hover эффект
            star.addEventListener('mouseenter', function() {
                if (userRatings[postId]) return;
                
                const hoverRating = index + 1;
                stars.forEach((s, i) => {
                    if (i < hoverRating) {
                        s.style.color = '#ffd700';
                    } else {
                        s.style.color = 'var(--border-color)';
                    }
                });
            });
        });
        
        // Убираем hover при уходе мыши
        ratingContainer.addEventListener('mouseleave', function() {
            if (userRatings[postId]) return;
            
            stars.forEach((star) => {
                star.style.color = '';
            });
        });
    });
}

// === ОБНОВЛЕНИЕ ДАННЫХ TELEGRAM ===
function initTelegramData() {
    updateTelegramData();
    
    // Обновляем данные каждые 30 минут
    setInterval(updateTelegramData, 1800000);
}

async function updateTelegramData() {
    try {
        const response = await fetch('./docs/telegram-data.json?v=' + Math.random());
        const data = await response.json();
        
        // Обновляем счетчик подписчиков
        const subscriberElement = document.querySelector('#subscriber-count');
        if (subscriberElement && data.subscribers) {
            // Анимация изменения числа
            animateNumber(subscriberElement, data.subscribers);
        }
        
        console.log('✅ Данные Telegram обновлены:', data.updated);
        
    } catch (error) {
        console.error('❌ Ошибка загрузки данных Telegram:', error);
        
        // Fallback значения при ошибке
        const subscriberElement = document.querySelector('#subscriber-count');
        if (subscriberElement && subscriberElement.textContent === '900+') {
            // Если данные не загрузились, показываем приблизительное значение
            subscriberElement.textContent = '950+';
        }
    }
}

// === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===

// Анимация изменения числа
function animateNumber(element, newValue) {
    const currentValue = element.textContent.replace(/[^\d]/g, '');
    const targetValue = newValue.replace(/[^\d]/g, '');
    
    if (currentValue !== targetValue) {
        element.style.transform = 'scale(1.1)';
        element.style.color = 'var(--accent-color)';
        
        setTimeout(() => {
            element.textContent = newValue;
            element.style.transform = '';
            element.style.color = '';
        }, 200);
    }
}

// Показ уведомлений
function showNotification(message, type = 'success', duration = 3000) {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Стили для уведомления
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: var(--accent-color);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 5px 15px var(--shadow-medium);
        z-index: 10000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        max-width: 300px;
        font-size: 0.9rem;
        font-weight: 600;
    `;
    
    document.body.appendChild(notification);
    
    // Показываем уведомление
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Скрываем и удаляем уведомление
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, duration);
}

// Утилита для плавной прокрутки к элементу
function scrollToElement(elementId, offset = 0) {
    const element = document.getElementById(elementId.replace('#', ''));
    if (element) {
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

// Утилита для проверки видимости элемента
function isElementInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Утилита для дебаунса (ограничение частоты вызовов функции)
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Отслеживание производительности (для разработки)
if (window.performance) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const loadTime = performance.now();
            console.log(`🏛️ Сайт "Блеск Империи" полностью загружен за ${loadTime.toFixed(2)}ms`);
        }, 0);
    });
}

// Обработка ошибок JavaScript
window.addEventListener('error', function(e) {
    console.error('❌ Ошибка JavaScript на сайте "Блеск Империи":', e.error);
});

// Отслеживание онлайн/офлайн статуса
window.addEventListener('online', () => {
    showNotification('🌐 Соединение восстановлено', 'success', 2000);
});

window.addEventListener('offline', () => {
    showNotification('🔌 Нет интернет-соединения', 'warning', 5000);
});

// Экспорт функций для использования в других модулях (если нужно)
window.HistoricalSite = {
    scrollToElement,
    showNotification,
    isElementInViewport,
    debounce
};
