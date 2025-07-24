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
    initAlbumModal(); // Добавлена инициализация модального окна альбома
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

// === РЕЙТИНГОВАЯ СИСТЕМА ДЛЯ ПОСТОВ ===
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

// === МОДАЛЬНОЕ ОКНО АЛЬБОМА ===
function initAlbumModal() {
    const openAlbumBtn = document.getElementById('openAlbum');
    const albumModal = document.getElementById('postsAlbum');
    const closeBtn = document.getElementById('albumClose');
    const overlay = albumModal.querySelector('.album-overlay');
    
    if (!openAlbumBtn || !albumModal) return;

    // Открытие модального окна
    openAlbumBtn.addEventListener('click', function(e) {
        e.preventDefault();
        albumModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Инициализация альбома при первом открытии
        if (!albumModal.dataset.initialized) {
            initAlbumContent();
            albumModal.dataset.initialized = 'true';
        }
    });

    // Закрытие модального окна
    function closeModal() {
        albumModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);

    // Закрытие по ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && albumModal.classList.contains('active')) {
            closeModal();
        }
    });
}

// Инициализация контента альбома
function initAlbumContent() {
    const albumContainer = document.getElementById('albumContainer');
    const searchInput = document.getElementById('albumSearch');
    
    // Загрузка данных альбома
    fetchAlbumData()
        .then(posts => {
            renderAlbumPosts(posts, albumContainer);
            setupAlbumSearch(posts, searchInput, albumContainer);
        })
        .catch(error => {
            console.error('Ошибка загрузки данных альбома:', error);
            albumContainer.innerHTML = '<div class="album-error">Не удалось загрузить исторические записи. Пожалуйста, попробуйте позже.</div>';
        });
}

// Загрузка данных для альбома
function fetchAlbumData() {
    // В реальном приложении здесь будет fetch к API или файлу с данными
    return new Promise((resolve) => {
        // Заглушка с тестовыми данными
        setTimeout(() => {
            resolve([
                {
                    id: 'album-1',
                    title: 'Самая длинноволосая династия Европы',
                    date: 'V-VIII век н.э.',
                    content: 'Меровинги - первая династия франкских королей, известные своими длинными волосами как символом власти.',
                    hashtags: ['#факты', '#средневековье']
                },
                {
                    id: 'album-2',
                    title: 'День, когда демократия умерла под гусеницами',
                    date: 'Октябрь 1993',
                    content: 'Штурм Дома Советов в Москве - один из самых трагических эпизодов современной российской истории.',
                    hashtags: ['#факты', '#россия']
                }
                // Можно добавить больше постов
            ]);
        }, 300);
    });
}

// Рендер постов в альбоме
function renderAlbumPosts(posts, container) {
    if (!posts || !posts.length) {
        container.innerHTML = '<div class="album-empty">Исторические записи не найдены</div>';
        return;
    }

    container.innerHTML = posts.map(post => `
        <div class="album-card" data-id="${post.id}">
            <div class="album-card-header">
                <h3 class="album-card-title">${post.title}</h3>
                <div class="album-card-date">${post.date}</div>
            </div>
            <div class="album-card-content">
                <p>${post.content}</p>
                <div class="album-card-tags">
                    ${post.hashtags.map(tag => `<span class="album-tag">${tag}</span>`).join('')}
                </div>
            </div>
            <button class="album-card-more">Подробнее</button>
        </div>
    `).join('');

    // Добавляем обработчики для кнопок "Подробнее"
    container.querySelectorAll('.album-card-more').forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.album-card');
            const postId = card.dataset.id;
            showNotification(`Открыт пост: ${card.querySelector('.album-card-title').textContent}`);
            // Здесь можно добавить логику открытия полного поста
        });
    });
}

// Настройка поиска по альбому
function setupAlbumSearch(posts, searchInput, container) {
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        
        if (!searchTerm) {
            renderAlbumPosts(posts, container);
            return;
        }
        
        const filteredPosts = posts.filter(post => 
            post.title.toLowerCase().includes(searchTerm) ||
            post.content.toLowerCase().includes(searchTerm) ||
            post.hashtags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
        
        renderAlbumPosts(filteredPosts, container);
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
            animateNumber(subscriberElement, data.subscribers);
        }
        
        console.log('✅ Данные Telegram обновлены:', data.updated);
    } catch (error) {
        console.error('❌ Ошибка загрузки данных Telegram:', error);
        
        // Fallback значения при ошибке
        const subscriberElement = document.querySelector('#subscriber-count');
        if (subscriberElement && subscriberElement.textContent === '900+') {
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
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
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
    
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
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

// Остальные вспомогательные функции (scrollToElement, isElementInViewport, debounce) остаются без изменений
// ...