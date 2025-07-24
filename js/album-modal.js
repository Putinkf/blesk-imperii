document.addEventListener('DOMContentLoaded', () => {
  // Элементы интерфейса
  const openBtn = document.getElementById('openAlbum');
  const albumModal = document.getElementById('postsAlbum');
  const closeBtn = document.getElementById('albumClose');
  const searchInput = document.getElementById('albumSearch');
  const albumContainer = document.getElementById('albumContainer');
  const modalsContainer = document.getElementById('modals-container');
  
  // Данные постов
  const postsData = window.postLinks || [];

  // Функция для безопасного вывода текста (очистка HTML)
  function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    })[char]);
  }

  // Рендер звезд рейтинга
  function renderStars(rating) {
    let starsHtml = '';
    const roundedRating = Math.round(rating || 0);
    for (let i = 1; i <= 5; i++) {
      starsHtml += `<span class="star-mini">${i <= roundedRating ? '⭐' : '☆'}</span>`;
    }
    return starsHtml;
  }

  // Создаём карточку поста для альбома
  function createPostCard(post) {
    const card = document.createElement('article');
    card.className = 'album-post';
    card.dataset.postId = post.id;
    card.innerHTML = `
      <div class="post-category">${escapeHtml(post.era)}</div>
      <div class="post-content">
        <h3 class="post-title">${escapeHtml(post.title)}</h3>
        <p class="post-preview">${escapeHtml(post.text).slice(0, 130)}...</p>
        <div class="post-mini-meta">
          <span class="post-date">${new Date(post.date).toLocaleDateString('ru-RU')}</span>
          <div class="post-rating-mini">
            <div class="rating-stars-mini">${renderStars(post.rating)}</div>
            <span>${(post.rating || 0).toFixed(1)}</span>
          </div>
        </div>
      </div>
    `;
    return card;
  }

  // Создаём модальное окно для поста
  function createModal(post) {
    // Если модалка уже есть, не создаём заново
    if (document.getElementById(`modal-${post.id}`)) return;

    const modalHtml = `
      <div class="post-modal" id="modal-${post.id}" role="dialog" aria-modal="true" tabindex="-1">
        <div class="modal-content">
          <button class="modal-close" aria-label="Закрыть">&times;</button>
          <div class="modal-header">
            <div class="modal-category">${escapeHtml(post.era)}</div>
            <h2 class="modal-title">${escapeHtml(post.title)}</h2>
            <div class="modal-date">${new Date(post.date).toLocaleDateString('ru-RU')}</div>
          </div>
          <div class="modal-body">
            <div class="modal-text">${escapeHtml(post.text).replace(/\n/g, '<br>')}</div>
          </div>
          <div class="modal-rating-section">
            <h3>Оцените статью</h3>
            <div class="rating-display">
              ${[1,2,3,4,5].map(i => `<span class="rating-star" data-rating="${i}">⭐</span>`).join('')}
              <span class="rating-value">${(post.rating || 0).toFixed(1)}</span>
              <span class="rating-count">(0 оценок)</span>
            </div>
          </div>
          <div class="comments-section">
            <h3>Комментарии</h3>
            <div class="comment-form">
              <textarea class="comment-input" placeholder="Поделитесь своими мыслями..."></textarea>
              <button class="comment-submit">Добавить комментарий</button>
            </div>
            <div class="comments-list"></div>
          </div>
        </div>
      </div>`;
    modalsContainer.insertAdjacentHTML('beforeend', modalHtml);
  }

  // Обновление альбома (генерация карточек и модалок)
  function renderAlbum(posts) {
    albumContainer.innerHTML = '';
    modalsContainer.innerHTML = '';
    
    if (!posts.length) {
      albumContainer.innerHTML = '<p>Посты не найдены.</p>';
      return;
    }
    
    posts.forEach(post => {
      albumContainer.appendChild(createPostCard(post));
      createModal(post);
    });
  }

  // Открытие модального окна по id
  function openModalById(id) {
    const modal = document.getElementById(`modal-${id}`);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      modal.focus(); // Фокусируем модальное окно для доступности
    }
  }

  // Закрытие модального окна
  function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }

  // Добавляем комментарий в список
  function addComment(container, text) {
    const commentBlock = document.createElement('div');
    commentBlock.className = 'comment';
    commentBlock.innerHTML = `
      <div class="comment-author">Гость</div>
      <div class="comment-text">${escapeHtml(text)}</div>
      <div class="comment-date">${new Date().toLocaleDateString('ru-RU')}</div>
    `;
    container.appendChild(commentBlock);
    commentBlock.scrollIntoView({ behavior: 'smooth' });
  }

  // Фильтрация постов по поисковому запросу
  function filterPosts(term) {
    if (!term) return postsData;
    const words = term.trim().toLowerCase().split(/\s+/);
    return postsData.filter(post => {
      const searchString = [post.title, post.text, (post.hashtags || []).join(' ')].join(' ').toLowerCase();
      return words.every(word => searchString.includes(word));
    });
  }

  // Обработчики событий для альбома
  openBtn.addEventListener('click', e => {
    e.preventDefault();
    albumModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    renderAlbum(postsData);
    searchInput.value = '';
  });

  closeBtn.addEventListener('click', () => {
    albumModal.classList.remove('active');
    document.body.style.overflow = '';
  });

  albumModal.addEventListener('click', e => {
    if (e.target === albumModal) {
      albumModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  // Обработчики событий для карточек и модалок
  albumContainer.addEventListener('click', (e) => {
    const card = e.target.closest('.album-post');
    if (card) {
      openModalById(card.dataset.postId);
    }
  });

  modalsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-close') || e.target.classList.contains('post-modal')) {
      // Клик по кнопке закрытия или оверлею
      let modal;
      if (e.target.classList.contains('post-modal')) modal = e.target;
      else modal = e.target.closest('.post-modal');
      if (modal) closeModal(modal);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const activeModal = document.querySelector('.post-modal.active');
      if (activeModal) closeModal(activeModal);
      else if (albumModal.classList.contains('active')) {
        albumModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    }
  });

  // Обработка клика по звездам рейтинга внутри модалки
  modalsContainer.addEventListener('click', (e) => {
    if (!e.target.classList.contains('rating-star')) return;

    const rating = parseInt(e.target.dataset.rating);
    const ratingDisplay = e.target.parentElement;
    const stars = ratingDisplay.querySelectorAll('.rating-star');
    const ratingValue = ratingDisplay.querySelector('.rating-value');
    const ratingCount = ratingDisplay.querySelector('.rating-count');
    
    // Обновляем звёзды
    stars.forEach((star, idx) => {
      star.classList.toggle('active', idx < rating);
    });
    
    // Обновляем текстовое значение рейтинга
    ratingValue.textContent = rating.toFixed(1);
    
    // Обновляем счетчик оценок
    const currentCount = parseInt(ratingCount.textContent.match(/\d+/) || 0);
    ratingCount.textContent = `(${currentCount + 1} оценок)`;

    // TODO: здесь вызовите отправку рейтинга на сервер/базу!
    console.log(`Поставлен рейтинг ${rating} для поста`);
  });

  // Обработка комментариев — делегирование
  modalsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('comment-submit')) {
      const form = e.target.closest('.comment-form');
      const input = form.querySelector('.comment-input');
      const text = input.value.trim();
      if (!text) return;

      const modal = e.target.closest('.post-modal');
      const commentsList = modal.querySelector('.comments-list');
      addComment(commentsList, text);
      input.value = '';

      // TODO: отправка комментария на сервер/базу
      console.log(`Добавлен комментарий: ${text}`);
    }
  });

  // Поиск с задержкой
  let searchDebounce;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
      const filtered = filterPosts(searchInput.value);
      renderAlbum(filtered);
    }, 250);
  });

  // Инициализация
  renderAlbum(postsData);
});