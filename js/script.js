// Ожидаем полной загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    // ======================
    // 1. Инициализация альбома
    // ======================
    const album = document.querySelector('.posts-album');
    const openAlbumBtn = document.querySelector('.album-open-btn'); // Нужно добавить эту кнопку в HTML
    const closeAlbumBtn = document.querySelector('.album-close');
    const postsContainer = document.querySelector('.posts-container');

    // ======================
    // 2. Загрузка постов из posts-data.js
    // ======================
    function loadPosts() {
        historicalPosts.forEach((post, index) => {
            const postElement = document.createElement('div');
            postElement.className = 'album-post';
            postElement.dataset.id = index;
            
            postElement.innerHTML = `
                <div class="album-post-content">
                    <div class="album-post-header">
                        <div class="post-era-badge">${post.era}</div>
                    </div>
                    <div class="album-post-body">
                        <h3 class="album-post-title">${post.title}</h3>
                        <div class="album-post-date">${post.date}</div>
                        <p class="album-post-text">${post.content}</p>
                        <div class="album-post-hashtags">
                            ${post.hashtags.map(tag => 
                                `<span class="album-post-hashtag">${tag}</span>`
                            ).join('')}
                        </div>
                    </div>
                </div>
            `;
            
            postsContainer.appendChild(postElement);
        });
    }

    // ======================
    // 3. Управление альбомом
    // ======================
    function openAlbum() {
        album.classList.add('active');
        document.body.style.overflow = 'hidden'; // Блокируем скролл страницы
    }

    function closeAlbum() {
        album.classList.remove('active');
        document.body.style.overflow = '';
        resetFullscreenPost();
    }

    // ======================
    // 4. Полноэкранный просмотр поста
    // ======================
    function setupPostInteractions() {
        document.querySelectorAll('.album-post').forEach(post => {
            post.addEventListener('click', function() {
                const postId = this.dataset.id;
                showFullscreenPost(postId);
            });
        });
    }

    function showFullscreenPost(postId) {
        // Скрываем все посты
        document.querySelectorAll('.album-post').forEach(p => {
            p.style.display = 'none';
        });
        
        // Показываем только выбранный
        const post = document.querySelector(`.album-post[data-id="${postId}"]`);
        post.style.display = 'flex';
        post.classList.add('fullscreen-post');
        
        // Добавляем кнопку назад
        const backBtn = document.createElement('button');
        backBtn.className = 'back-to-album';
        backBtn.innerHTML = '← Вернуться к альбому';
        backBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            resetFullscreenPost();
        });
        
        post.querySelector('.album-post-content').prepend(backBtn);
    }

    function resetFullscreenPost() {
        document.querySelectorAll('.album-post').forEach(p => {
            p.style.display = 'flex';
            p.classList.remove('fullscreen-post');
        });
        
        document.querySelectorAll('.back-to-album').forEach(btn => btn.remove());
    }

    // ======================
    // 5. Инициализация
    // ======================
    loadPosts();
    setupPostInteractions();
    
    // Назначение обработчиков (добавьте кнопку открытия в HTML)
    if (openAlbumBtn) openAlbumBtn.addEventListener('click', openAlbum);
    if (closeAlbumBtn) closeAlbumBtn.addEventListener('click', closeAlbum);

    // ======================
    // 6. Дополнительные функции
    // ======================
    // Плавная прокрутка к посту при открытии
    function scrollToPost(postId) {
        const post = document.querySelector(`.album-post[data-id="${postId}"]`);
        post.scrollIntoView({ behavior: 'smooth' });
    }
});