// Класс для управления историческим альбомом
class HistoricalAlbum {
    constructor() {
        this.userRatings = JSON.parse(localStorage.getItem('historicalRatings') || '{}');
        this.userRatingCounts = JSON.parse(localStorage.getItem('historicalRatingCounts') || '{}');
        this.currentSharePost = null;
        this.postsContainer = document.getElementById('postsContainer');
        this.shareModal = document.getElementById('shareModal');
        this.init();
    }

    init() {
        this.bindUIActions();
    }

    bindUIActions() {
        const openButton = document.getElementById('openAlbum');
        if (openButton) {
            openButton.addEventListener('click', e => {
                e.preventDefault();
                this.openAlbum();
            });
        }

        const closeButton = document.getElementById('albumClose');
        if (closeButton) {
            closeButton.addEventListener('click', () => this.closeAlbum());
        }

        const shareCloseButton = document.getElementById('shareClose');
        if (shareCloseButton) {
            shareCloseButton.addEventListener('click', () => this.closeShareModal());
        }
        
        if (this.shareModal) {
            this.shareModal.addEventListener('click', e => {
                if (e.target === this.shareModal) this.closeShareModal();
            });
        }
    }

    openAlbum() {
        console.log('🔄 Открываем альбом...');
        const album = document.getElementById('postsAlbum');
        if (album) {
            album.classList.add('active');
            document.body.style.overflow = 'hidden';
            this.renderPosts();
            this.bindPostEvents();
        }
    }

    closeAlbum() {
        console.log('🔄 Закрываем альбом...');
        const album = document.getElementById('postsAlbum');
        if (album) {
            album.classList.remove('active');
            document.body.style.overflow = '';
            if (this.postsContainer) {
                this.postsContainer.innerHTML = '';
            }
        }
    }

    renderPosts() {
        if (!this.postsContainer) {
            console.error('❌ Контейнер постов не найден');
            return;
        }
        
        this.postsContainer.innerHTML = '';

        if (typeof postLinks === 'undefined' || !postLinks.length) {
            this.postsContainer.innerHTML = `
                <div class="album-post">
                    <div class="album-post-content">
                        <h2>⚠️ Данные недоступны</h2>
                        <p>Ссылки на посты не найдены. Проверьте подключение файла data.js</p>
                    </div>
                </div>
            `;
            return;
        }

        console.log(`📊 Загружаем ${postLinks.length} постов в альбом`);

        postLinks.forEach((postData, idx) => {
            const postEl = this.createPostElement(postData, idx + 1);
            this.postsContainer.appendChild(postEl);
        });
    }

    createPostElement(postData, number) {
        const div = document.createElement('div');
        div.classList.add('album-post');
        
        // Получаем статистику рейтинга для поста
        const averageRating = this.calculateAverageRating(postData.id);
        const totalRatings = this.userRatingCounts[postData.id] || 0;
        const userRating = this.userRatings[postData.id] || 0;
        const hasUserRated = userRating > 0;
        
        const hashtagsHtml = postData.hashtags ? 
            `<div class="album-post-hashtags">
                ${postData.hashtags.map(tag => 
                    `<span class="album-post-hashtag">${tag}</span>`
                ).join('')}
            </div>` : '';
        
        div.innerHTML = `
            <div class="album-post-content">
                <div class="album-post-header">
                    <div class="post-era-badge">${postData.era}</div>
                </div>
                <div class="album-post-body">
                    <h2 class="album-post-title">${postData.title}</h2>
                    <div class="album-post-text">
                        <p>${postData.text}</p>
                    </div>
                    ${hashtagsHtml}
                </div>
                
                <div class="post-interactions">
                    <div class="interaction-group">
                        <div class="rating-system">
                            <div class="rating-stars-album" data-post-id="${postData.id}">
                                ${[1, 2, 3, 4, 5].map(i => 
                                    `<span class="rating-star-album ${userRating >= i ? 'active' : ''} ${hasUserRated ? 'disabled' : ''}" 
                                           data-rating="${i}" 
                                           ${hasUserRated ? 'title="Вы уже оценили этот пост"' : 'title="Оценить ' + i + ' звезд"'}>★</span>`
                                ).join('')}
                            </div>
                            <div class="rating-info">
                                ${hasUserRated 
                                    ? `Ваша оценка: ${userRating}/5` 
                                    : 'Оцените пост (1-5 звезд)'
                                }
                            </div>
                            <div class="rating-stats">
                                ${totalRatings > 0 
                                    ? `Средняя оценка: ${averageRating}/5 (${totalRatings} ${this.getRatingWord(totalRatings)})` 
                                    : 'Пока нет оценок'
                                }
                            </div>
                        </div>
                    </div>
                    <div class="interaction-group">
                        <button class="comment-btn" onclick="album.toggleComments('${postData.id}')">💬 Обсуждение</button>
                        <button class="share-btn" onclick="album.sharePost('${postData.id}', '${postData.title.replace(/'/g, "\\'")}')">📤 Поделиться</button>
                    </div>
                </div>
                
                <div class="album-comments" id="comments-${postData.id}">
                    <div class="album-comment-form">
                        <input type="text" class="album-comment-input" placeholder="Поделитесь мыслями об этом историческом событии..." />
                        <button class="album-comment-submit" onclick="album.addComment('${postData.id}')">✨ Отправить</button>
                    </div>
                    <div class="album-comments-list" id="comments-list-${postData.id}"></div>
                </div>
            </div>
        `;
        return div;
    }

    bindPostEvents() {
        document.querySelectorAll('.rating-stars-album').forEach(ratingContainer => {
            const postId = ratingContainer.dataset.postId;
            const stars = ratingContainer.querySelectorAll('.rating-star-album');
            
            // Проверяем, не оценил ли пользователь уже этот пост
            if (!this.userRatings[postId]) {
                stars.forEach((star, i) => {
                    star.addEventListener('click', () => {
                        const rating = i + 1;
                        this.ratePost(postId, rating);
                        this.updateRatingDisplay(ratingContainer, rating);
                    });

                    // Hover эффект только для неоцененных постов
                    star.addEventListener('mouseenter', () => {
                        this.highlightStars(stars, i + 1);
                    });
                });

                // Убираем подсветку при уходе мыши
                ratingContainer.addEventListener('mouseleave', () => {
                    this.resetStarsHighlight(stars);
                });
            }
        });
    }

    ratePost(postId, rating) {
        // Предотвращаем повторную оценку
        if (this.userRatings[postId]) {
            console.log('Пост уже оценен');
            return;
        }

        // Сохраняем оценку пользователя
        this.userRatings[postId] = rating;
        localStorage.setItem('historicalRatings', JSON.stringify(this.userRatings));

        // Увеличиваем счетчик оценок
        if (!this.userRatingCounts[postId]) {
            this.userRatingCounts[postId] = 0;
        }
        this.userRatingCounts[postId]++;
        localStorage.setItem('historicalRatingCounts', JSON.stringify(this.userRatingCounts));

        console.log(`✅ Пост ${postId} оценен на ${rating} звезд`);
    }

    updateRatingDisplay(container, rating) {
        const postId = container.dataset.postId;
        const stars = container.querySelectorAll('.rating-star-album');
        const info = container.parentElement.querySelector('.rating-info');
        const stats = container.parentElement.querySelector('.rating-stats');
        
        // Обновляем визуальное отображение звезд
        stars.forEach((star, i) => {
            if (i < rating) {
                star.classList.add('active');
            }
            star.classList.add('disabled');
            star.title = 'Вы уже оценили этот пост';
        });
        
        // Обновляем текстовую информацию
        info.textContent = `Ваша оценка: ${rating}/5`;
        
        // Обновляем статистику
        const averageRating = this.calculateAverageRating(postId);
        const totalRatings = this.userRatingCounts[postId] || 0;
        stats.textContent = `Средняя оценка: ${averageRating}/5 (${totalRatings} ${this.getRatingWord(totalRatings)})`;
    }

    highlightStars(stars, rating) {
        stars.forEach((star, i) => {
            if (i < rating) {
                star.style.color = '#ffd700';
                star.style.transform = 'scale(1.1)';
            } else {
                star.style.color = 'var(--border-color)';
                star.style.transform = 'scale(1)';
            }
        });
    }

    resetStarsHighlight(stars) {
        stars.forEach(star => {
            if (!star.classList.contains('active')) {
                star.style.color = 'var(--border-color)';
                star.style.transform = 'scale(1)';
            }
        });
    }

    calculateAverageRating(postId) {
        // В реальном приложении здесь был бы запрос к серверу
        // Для демонстрации используем локальные данные
        const userRating = this.userRatings[postId];
        return userRating ? userRating.toFixed(1) : '0.0';
    }

    getRatingWord(count) {
        if (count === 1) return 'оценка';
        if (count >= 2 && count <= 4) return 'оценки';
        return 'оценок';
    }

    toggleComments(postId) {
        const container = document.getElementById(`comments-${postId}`);
        if (container) {
            container.classList.toggle('active');
        }
    }

    addComment(postId) {
        const input = document.querySelector(`#comments-${postId} .album-comment-input`);
        const commentsList = document.getElementById(`comments-list-${postId}`);
        
        if (input && input.value.trim() && commentsList) {
            const commentDiv = document.createElement('div');
            commentDiv.className = 'album-comment-item';
            commentDiv.innerHTML = `
                <div class="album-comment-author">🎭 Анонимный историк</div>
                <div class="album-comment-text">${input.value}</div>
                <div class="album-comment-date">📅 ${new Date().toLocaleDateString('ru-RU')}</div>
            `;
            
            commentsList.appendChild(commentDiv);
            input.value = '';
        }
    }

    sharePost(postId, title) {
        this.currentSharePost = { postId, title };
        this.setupShareLinks(title);
        if (this.shareModal) {
            this.shareModal.classList.add('active');
        }
    }

    setupShareLinks(title) {
        const url = `https://t.me/analinhistory/${this.currentSharePost.postId}`;
        const text = `Интересный исторический пост: ${title}`;
        
        const shareVK = document.getElementById('shareVK');
        const shareTelegram = document.getElementById('shareTelegram');
        const shareWhatsApp = document.getElementById('shareWhatsApp');
        const copyLink = document.getElementById('copyLink');
        
        if (shareVK) shareVK.href = `https://vk.com/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`;
        if (shareTelegram) shareTelegram.href = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
        if (shareWhatsApp) shareWhatsApp.href = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
        
        if (copyLink) {
            copyLink.onclick = e => {
                e.preventDefault();
                navigator.clipboard.writeText(url).then(() => {
                    // Создаем временное уведомление
                    const notification = document.createElement('div');
                    notification.textContent = '🔗 Ссылка скопирована в буфер обмена!';
                    notification.style.cssText = `
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        background: var(--accent-color);
                        color: white;
                        padding: 10px 20px;
                        border-radius: 5px;
                        z-index: 10003;
                        font-family: 'Crimson Text', serif;
                    `;
                    document.body.appendChild(notification);
                    setTimeout(() => notification.remove(), 2000);
                }).catch(() => {
                    prompt('Скопируйте ссылку:', url);
                });
            };
        }
    }

    closeShareModal() {
        if (this.shareModal) {
            this.shareModal.classList.remove('active');
        }
    }
}

// Инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏛️ Инициализация исторического альбома...');
    window.album = new HistoricalAlbum();
});
