class HistoricalAlbum {
    constructor() {
        this.userRatings = JSON.parse(localStorage.getItem('historicalRatings') || '{}');
        this.userRatingCounts = JSON.parse(localStorage.getItem('historicalRatingCounts') || '{}');
        this.currentSharePost = null;
        this.postsContainer = document.getElementById('postsContainer');
        this.shareModal = document.getElementById('shareModal');

        this.modal = document.getElementById('postModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.modalEra = document.getElementById('modalEra');
        this.modalDate = document.getElementById('modalDate');
        this.modalContent = document.getElementById('modalContent');
        this.modalTags = document.getElementById('modalTags');
        this.closeModal = document.querySelector('.close-modal');

        this.searchInput = document.getElementById('searchInput');
        this.searchButton = document.getElementById('searchButton');

        // Собираем все посты из возможных источников
        this.allPosts = window.historicalPosts || [];

        this.init();
    }

    init() {
        this.bindUIActions();
        this.renderInitialPosts();
        this.renderPosts(this.allPosts);
        this.bindSearch();
        this.bindModal();
        this.bindPostEvents();
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

    renderInitialPosts() {
        if (!this.postsContainer) return;

        const postsToDisplay = window.postLinks || window.historicalPosts || [];

        postsToDisplay.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'post-card';
            postElement.innerHTML = `
                <h2>${post.title}</h2>
                <div class="post-era">${post.era}</div>
                <div class="post-date">${this.formatDate(post.date)}</div>
                <p>${post.text || post.content}</p>
                <div class="tags">${this.renderTags(post.hashtags)}</div>
            `;
            this.postsContainer.appendChild(postElement);
        });
    }

    formatDate(dateString) {
        return dateString && dateString.includes('-') 
            ? dateString.split('-').reverse().join('.') 
            : dateString || '';
    }

    renderTags(tags) {
        return tags ? tags.map(tag => `<span class="tag">${tag}</span>`).join('') : '';
    }

    openAlbum() {
        console.log('🔄 Открываем альбом...');
        const album = document.getElementById('postsAlbum');
        if (album) {
            album.classList.add('active');
            document.body.style.overflow = 'hidden';
            this.renderPosts(this.allPosts);
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

    renderPosts(posts) {
        if (!this.postsContainer) {
            console.error('❌ Контейнер постов не найден');
            return;
        }

        this.postsContainer.innerHTML = '';

        if (!posts || !posts.length) {
            this.postsContainer.innerHTML = `
                <div class="album-post">
                    <div class="album-post-content">
                        <h2>⚠️ Ничего не найдено</h2>
                        <p>Попробуйте изменить запрос поиска</p>
                    </div>
                </div>
            `;
            return;
        }

        posts.forEach((post) => {
            const postCard = document.createElement('div');
            postCard.className = 'post-card';
            postCard.innerHTML = `
                <h3>${post.title || 'Без названия'}</h3>
                <div class="post-meta">
                    <span class="era">${post.era || 'Эпоха не указана'}</span>
                    <span class="date">${this.formatDate(post.date)}</span>
                </div>
                <p class="preview">${this.getPreview(post.text || post.content)}</p>
                <div class="tags">
                    ${this.renderTags(post.hashtags)}
                </div>
            `;

            postCard.addEventListener('click', () => this.openModal(post));
            this.postsContainer.appendChild(postCard);
        });
    }

    getPreview(text) {
        if (!text) return '';
        return text.length > 100 ? text.substring(0, 100) + '...' : text;
    }

	openModal(post) {
		if (!this.modal) return;

		this.modalTitle.textContent = post.title || '';
		this.modalEra.textContent = post.era || '';
		this.modalDate.textContent = this.formatDate(post.date) || '';
		this.modalContent.textContent = post.text || post.content || '';
		this.modalTags.innerHTML = this.renderTags(post.hashtags);

		// Отображаем модалку
		this.modal.style.display = 'block';
		document.body.style.overflow = 'hidden';
	
		// Добавляем анимационные классы
		const modalContentBlock = this.modal.querySelector('.modal-content');
		modalContentBlock.classList.add('post-open-animation');
		// Принудительно запустить перерисовку, чтобы CSS анимация сработала
		void modalContentBlock.offsetWidth;
		modalContentBlock.classList.add('active');
	}

    bindModal() {
        if (!this.closeModal || !this.modal) return;

        this.closeModal.addEventListener('click', () => {
            this.modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });

        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }

    bindSearch() {
        if (!this.searchInput || !this.searchButton) return;

        this.searchButton.addEventListener('click', () => this.searchPosts());

        this.searchInput.addEventListener('keyup', e => {
            if (e.key === 'Enter') this.searchPosts();
        });
    }

    searchPosts() {
        const term = this.searchInput.value.toLowerCase();
        const filtered = term
            ? this.allPosts.filter(post =>
                  (post.title && post.title.toLowerCase().includes(term)) ||
                  (post.era && post.era.toLowerCase().includes(term)) ||
                  (post.text && post.text.toLowerCase().includes(term)) ||
                  (post.content && post.content.toLowerCase().includes(term)) ||
                  (post.hashtags && post.hashtags.some(tag => tag.toLowerCase().includes(term)))
              )
            : this.allPosts;
        this.renderPosts(filtered);
    }

    bindPostEvents() {
        // Реализация событий рейтинга из твоего первого кода
        document.querySelectorAll('.rating-stars-album').forEach(ratingContainer => {
            const postId = ratingContainer.dataset.postId;
            const stars = ratingContainer.querySelectorAll('.rating-star-album');

            if (!this.userRatings[postId]) {
                stars.forEach((star, i) => {
                    star.addEventListener('click', () => {
                        const rating = i + 1;
                        this.ratePost(postId, rating);
                        this.updateRatingDisplay(ratingContainer, rating);
                    });
                    star.addEventListener('mouseenter', () => {
                        this.highlightStars(stars, i + 1);
                    });
                });
                ratingContainer.addEventListener('mouseleave', () => {
                    this.resetStarsHighlight(stars);
                });
            }
        });
    }

    ratePost(postId, rating) {
        if (this.userRatings[postId]) return;

        this.userRatings[postId] = rating;
        localStorage.setItem('historicalRatings', JSON.stringify(this.userRatings));

        this.userRatingCounts[postId] = (this.userRatingCounts[postId] || 0) + 1;
        localStorage.setItem('historicalRatingCounts', JSON.stringify(this.userRatingCounts));

        console.log(`✅ Пост ${postId} оценен на ${rating} звезд`);
    }

    updateRatingDisplay(container, rating) {
        const postId = container.dataset.postId;
        const stars = container.querySelectorAll('.rating-star-album');
        const info = container.parentElement.querySelector('.rating-info');
        const stats = container.parentElement.querySelector('.rating-stats');

        stars.forEach((star, i) => {
            star.classList.toggle('active', i < rating);
            star.classList.add('disabled');
            star.title = 'Вы уже оценили этот пост';
        });

        info.textContent = `Ваша оценка: ${rating}/5`;

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
        if (container) container.classList.toggle('active');
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
        if (this.shareModal) this.shareModal.classList.add('active');
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
                navigator.clipboard.writeText(url)
                    .then(() => {
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
                    })
                    .catch(() => {
                        prompt('Скопируйте ссылку:', url);
                    });
            };
        }
    }

    closeShareModal() {
        if (this.shareModal) this.shareModal.classList.remove('active');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('🏛️ Инициализация исторического альбома...');
    window.album = new HistoricalAlbum();
});
