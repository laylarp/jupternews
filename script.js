const STORAGE_COMMENTS_KEY = 'jupterNewsComments';
const STORAGE_USER_KEY = 'jupterNewsUser';
const STORAGE_LIKED_KEY = 'jupterNewsLiked';
const STORAGE_SUBSCRIBERS_KEY = 'jupterNewsSubscribers';

// Formspree endpoint
const FORM_ENDPOINT = 'https://formspree.io/f/mkgdpbzw';

const appState = {
  currentCategory: 'all',
  currentNews: [],
  displayedNews: 6,
  currentNewsId: null,
  userComments: JSON.parse(localStorage.getItem(STORAGE_COMMENTS_KEY)) || {},
  likedByUser: JSON.parse(localStorage.getItem(STORAGE_LIKED_KEY)) || [],
  userName: localStorage.getItem(STORAGE_USER_KEY) || null,
  subscribers: JSON.parse(localStorage.getItem(STORAGE_SUBSCRIBERS_KEY)) || []
};

// Ensure a persistent user name
if (!appState.userName) {
  const rand = Math.floor(1000 + Math.random() * 9000);
  appState.userName = `Usuário ${rand}`;
  localStorage.setItem(STORAGE_USER_KEY, appState.userName);
}

document.addEventListener('DOMContentLoaded', () => {
  const navListEl = document.getElementById('navList');
  const loadMoreBtn = document.getElementById('loadMoreBtn');
  const newsContainer = document.getElementById('newsContainer');
  const featuredContainer = document.getElementById('featuredContainer');
  const newsModal = document.getElementById('newsModal');
  const videoModal = document.getElementById('videoModal');
  const subscribeModal = document.getElementById('subscribeModal');
  const closeModalBtns = document.querySelectorAll('.close-modal');
  const subscribeBtn = document.getElementById('subscribeBtn');
  const menuToggle = document.getElementById('menuToggle');
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const commentText = document.getElementById('commentText');
  const submitCommentBtn = document.getElementById('submitCommentBtn');
  const confirmSubscribeBtn = document.getElementById('confirmSubscribeBtn');
  const footerSubscribeBtn = document.getElementById('footerSubscribeBtn');

  initializeApp();

  // Mobile menu toggle
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      navListEl.classList.toggle('active');
    });
  }

  // navigation delegation
  if (navListEl) {
    navListEl.addEventListener('click', (e) => {
      const link = e.target.closest('.nav-link');
      if (!link) return;
      e.preventDefault();
      const category = link.getAttribute('data-category');
      document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
      link.classList.add('active');
      filterByCategory(category);
      // Close mobile menu after selection
      navListEl.classList.remove('active');
    });
  }

  if (loadMoreBtn) loadMoreBtn.addEventListener('click', loadMoreNews);
  if (subscribeBtn) subscribeBtn.addEventListener('click', () => openModal(subscribeModal));
  if (searchBtn) searchBtn.addEventListener('click', searchNews);
  if (searchInput) searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') searchNews(); });

  if (commentText) {
    commentText.addEventListener('input', function () {
      const charCount = document.getElementById('charCount');
      if (charCount) charCount.textContent = `${this.value.length}/500`;
    });
  }

  closeModalBtns.forEach(btn => btn.addEventListener('click', closeAllModals));
  window.addEventListener('click', (event) => {
    if (event.target === newsModal) closeModal(newsModal);
    if (event.target === videoModal) closeModal(videoModal);
    if (event.target === subscribeModal) closeModal(subscribeModal);
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAllModals(); });

  if (submitCommentBtn) submitCommentBtn.addEventListener('click', submitCommentHandler);
  if (confirmSubscribeBtn) confirmSubscribeBtn.addEventListener('click', subscribeModalHandler);
  if (footerSubscribeBtn) footerSubscribeBtn.addEventListener('click', footerSubscribeHandler);

  // PWA SW registration
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(() => console.log('Service Worker registrado com sucesso'))
      .catch(err => console.log('Falha ao registrar Service Worker:', err));
  }

  // delegated like handling
  document.body.addEventListener('click', (e) => {
    const likeBtn = e.target.closest('.like-btn');
    if (likeBtn) {
      const newsId = parseInt(likeBtn.dataset.newsId, 10);
      const commentId = parseInt(likeBtn.dataset.commentId, 10);
      toggleLike(newsId, commentId);
    }
  });

  // --- core app functions ---
  function initializeApp() {
    // Check if newsData is available
    if (window.newsData && Array.isArray(window.newsData)) {
      appState.currentNews = [...window.newsData];
    } else {
      console.error('newsData não encontrado ou inválido');
      appState.currentNews = [];
    }
    
    loadFeaturedNews();
    loadInitialNews();
    loadTopNews();
    initializeAdSense();
    
    // Add click listeners to all news cards
    document.addEventListener('click', (e) => {
      const card = e.target.closest('.news-card, .main-featured, .secondary-featured');
      if (card) {
        const newsId = parseInt(card.getAttribute('data-id'), 10);
        if (newsId) openNewsModal(newsId);
      }
    });
    
    // Add click listeners to top news items
    document.addEventListener('click', (e) => {
      const topNewsItem = e.target.closest('#topNewsList li');
      if (topNewsItem) {
        const index = Array.from(topNewsItem.parentNode.children).indexOf(topNewsItem);
        const currentNews = getCurrentNews();
        if (currentNews[index]) {
          openNewsModal(currentNews[index].id);
        }
      }
    });
  }

  function loadFeaturedNews() {
    if (!featuredContainer) return;
    const featured = getCurrentNews().slice(0, 3);
    featuredContainer.innerHTML = '';
    
    if (featured.length === 0) {
      featuredContainer.innerHTML = '<p class="no-news">Nenhuma notícia em destaque.</p>';
      return;
    }
    
    featured.forEach((news, index) => {
      const article = document.createElement('article');
      article.className = index === 0 ? 'main-featured' : 'secondary-featured';
      article.setAttribute('data-id', news.id);
      const commentsCount = getCommentsCount(news.id);
      article.innerHTML = `
        <div class="news-image">
          <img src="${news.image}" alt="${escapeHtml(news.title)}" loading="lazy">
          <span class="category-label ${news.category}">${news.categoryName}</span>
          ${index===0?'<div class="featured-badge"><i class="fas fa-crown"></i> EM DESTAQUE</div>':''}
        </div>
        <div class="news-content">
          <h3 class="news-title">${escapeHtml(news.title)}</h3>
          ${index===0?`<p class="news-excerpt">${news.excerpt}</p>`:''}
          <div class="news-meta">
            <span><i class="far fa-clock"></i> ${news.time}</span>
            <span><i class="far fa-comment"></i> ${commentsCount} comentários</span>
          </div>
        </div>
      `;
      featuredContainer.appendChild(article);
    });
  }

  function loadInitialNews() {
    if (!newsContainer) return;
    newsContainer.innerHTML = '';
    appState.displayedNews = 6;
    const newsToShow = getCurrentNews().slice(0, appState.displayedNews);
    
    if (newsToShow.length === 0) {
      newsContainer.innerHTML = '<div class="no-news"><p>Nenhuma notícia encontrada nesta categoria.</p></div>';
      return;
    }
    
    newsToShow.forEach(n => newsContainer.appendChild(createNewsCard(n)));
    updateLoadMoreButton();
  }

  function loadMoreNews() {
    if (!newsContainer) return;
    const currentNews = getCurrentNews();
    const start = appState.displayedNews;
    const end = start + 3;
    const more = currentNews.slice(start, end);
    
    if (more.length === 0) {
      showNotification('Todas as notícias já foram carregadas!');
      return;
    }
    
    more.forEach(n => newsContainer.appendChild(createNewsCard(n)));
    appState.displayedNews = Math.min(end, currentNews.length);
    updateLoadMoreButton();
    
    // Scroll to the newly loaded content
    const newCards = newsContainer.querySelectorAll('.news-card');
    if (newCards.length > 0) {
      newCards[newCards.length - 1].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function createNewsCard(news) {
    const card = document.createElement('article');
    card.className = 'news-card';
    card.setAttribute('data-id', news.id);
    const commentsCount = getCommentsCount(news.id);
    card.innerHTML = `
      <div class="news-image">
        <img src="${news.image}" alt="${escapeHtml(news.title)}" loading="lazy">
        <span class="category-label ${news.category}">${news.categoryName}</span>
      </div>
      <div class="news-content">
        <h3 class="news-title">${escapeHtml(news.title)}</h3>
        <p class="news-excerpt">${news.excerpt}</p>
        <div class="news-meta">
          <span><i class="far fa-clock"></i> ${news.time}</span>
          <span><i class="far fa-comment"></i> ${commentsCount} comentários</span>
        </div>
      </div>
    `;
    return card;
  }

  function filterByCategory(category) {
    appState.currentCategory = category;
    const sectionTitle = document.getElementById('sectionTitle');
    const newsListTitle = document.getElementById('newsListTitle');
    if (category === 'all') {
      sectionTitle.textContent = 'Destaques do Dia';
      newsListTitle.textContent = 'Últimas Notícias';
    } else {
      const names = { 
        urgentes:'Urgentes', 
        economia:'Economia', 
        ciencia:'Ciência', 
        esportes:'Esportes', 
        cultura:'Cultura', 
        tecnologia:'Tecnologia', 
        saude:'Saúde' 
      };
      sectionTitle.textContent = `Destaques de ${names[category] || category}`;
      newsListTitle.textContent = `Notícias de ${names[category] || category}`;
    }
    loadInitialNews();
    if (category === 'all') {
      loadFeaturedNews();
    } else {
      loadCategoryFeatured(category);
    }
    loadTopNews();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function loadCategoryFeatured(category) {
    if (!featuredContainer) return;
    const items = appState.currentNews.filter(n => n.category === category).slice(0,3);
    featuredContainer.innerHTML = '';
    
    if (items.length === 0) { 
      featuredContainer.innerHTML = '<p class="no-news">Nenhuma notícia nesta categoria.</p>'; 
      return; 
    }
    
    items.forEach((news,index) => {
      const article = document.createElement('article');
      article.className = index===0?'main-featured':'secondary-featured';
      article.setAttribute('data-id', news.id);
      const commentsCount = getCommentsCount(news.id);
      article.innerHTML = `
        <div class="news-image">
          <img src="${news.image}" alt="${escapeHtml(news.title)}" loading="lazy">
          <span class="category-label ${news.category}">${news.categoryName}</span>
        </div>
        <div class="news-content">
          <h3 class="news-title">${escapeHtml(news.title)}</h3>
          <p class="news-excerpt">${news.excerpt}</p>
          <div class="news-meta">
            <span><i class="far fa-clock"></i> ${news.time}</span>
            <span><i class="far fa-comment"></i> ${commentsCount} comentários</span>
          </div>
        </div>
      `;
      featuredContainer.appendChild(article);
    });
  }

  function searchNews() {
    const term = (searchInput.value||'').trim().toLowerCase();
    if (!term) { 
      showNotification('Digite um termo para buscar.'); 
      return; 
    }
    
    appState.currentCategory = 'search';
    document.getElementById('sectionTitle').textContent = `Resultados para: "${term}"`;
    document.getElementById('newsListTitle').textContent = 'Notícias Encontradas';
    
    if (!newsContainer) return;
    newsContainer.innerHTML = '';
    
    const filtered = appState.currentNews.filter(n => 
      (n.title||'').toLowerCase().includes(term) || 
      (n.excerpt||'').toLowerCase().includes(term) || 
      (n.fullContent||'').toLowerCase().includes(term)
    );
    
    if (filtered.length === 0) { 
      newsContainer.innerHTML = `
        <div class="no-results">
          <i class="fas fa-search"></i>
          <h3>Nenhuma notícia encontrada</h3>
          <p>Tente outros termos.</p>
        </div>
      `; 
      if (loadMoreBtn) loadMoreBtn.style.display = 'none';
      return; 
    }
    
    filtered.forEach(n => newsContainer.appendChild(createNewsCard(n)));
    if (loadMoreBtn) loadMoreBtn.style.display = 'none';
    searchInput.value = '';
    
    // Scroll to results
    document.querySelector('.news-list').scrollIntoView({ behavior: 'smooth', block: 'start' });
    showNotification(`Encontradas ${filtered.length} notícias para "${term}"`);
  }

  function openNewsModal(newsId) {
    const modal = document.getElementById('newsModal');
    const modalContent = document.getElementById('modalNewsContent');
    const news = appState.currentNews.find(n => n.id === newsId);
    
    if (!news) { 
      showNotification('Notícia não encontrada'); 
      return; 
    }
    
    appState.currentNewsId = newsId;
    modalContent.innerHTML = `
      <div class="news-full">
        <h2>${escapeHtml(news.title)}</h2>
        <div class="news-meta-full">
          <span><i class="far fa-clock"></i> ${news.time}</span>
          <span><i class="far fa-comment"></i> <span id="modalCommentCount">${getCommentsCount(newsId)}</span> comentários</span>
          <span class="category-label ${news.category}">${news.categoryName}</span>
        </div>
        <div class="news-full-image">
          <img src="${news.image}" alt="${escapeHtml(news.title)}">
        </div>
        <div class="news-body">${news.fullContent || ''}</div>
      </div>
    `;
    loadComments(newsId);
    openModal(modal);
  }

  // COMMENTS (no replies, no delete)
  function getCommentsFor(newsId) {
    return appState.userComments[newsId] ? [...appState.userComments[newsId]] : [];
  }
  
  function getCommentsCount(newsId) { 
    return getCommentsFor(newsId).length; 
  }

  function loadComments(newsId) {
    const commentsList = document.getElementById('commentsList');
    const commentCount = document.getElementById('commentCount');
    const modalCommentCount = document.getElementById('modalCommentCount');
    const list = getCommentsFor(newsId);
    list.sort((a,b) => (b.timestamp||0) - (a.timestamp||0));
    
    if (commentCount) commentCount.textContent = `(${list.length})`;
    if (modalCommentCount) modalCommentCount.textContent = list.length;
    
    if (!commentsList) return;
    
    if (list.length === 0) { 
      commentsList.innerHTML = '<p class="no-comments">Seja o primeiro a comentar esta notícia!</p>'; 
      return; 
    }
    
    commentsList.innerHTML = list.map(c => renderCommentHtml(newsId, c)).join('');
    updateLikeButtons();
  }

  function renderCommentHtml(newsId, comment) {
    const likedClass = appState.likedByUser.includes(String(comment.id)) ? 'liked' : '';
    return `
      <div class="comment" data-comment-id="${comment.id}">
        <div class="comment-header">
          <div class="comment-author"><i class="fas fa-user"></i> ${escapeHtml(comment.author)}</div>
          <div class="comment-date">${escapeHtml(comment.date)}</div>
        </div>
        <div class="comment-text">${escapeHtml(comment.text)}</div>
        <div class="comment-actions-comment">
          <button class="like-btn ${likedClass}" data-news-id="${newsId}" data-comment-id="${comment.id}">
            <i class="far fa-thumbs-up"></i> Curtir (<span class="like-count">${comment.likes||0}</span>)
          </button>
        </div>
      </div>
    `;
  }

  function toggleLike(newsId, commentId) {
    const idStr = String(commentId);
    
    if (appState.likedByUser.includes(idStr)) { 
      showNotification('Você já curtiu este comentário.'); 
      return; 
    }
    
    if (!appState.userComments[newsId]) appState.userComments[newsId] = [];
    const comment = appState.userComments[newsId].find(c => c.id === commentId);
    
    if (!comment) { 
      showNotification('Comentário não encontrado.'); 
      return; 
    }
    
    comment.likes = (comment.likes||0) + 1;
    appState.likedByUser.push(idStr);
    localStorage.setItem(STORAGE_LIKED_KEY, JSON.stringify(appState.likedByUser));
    localStorage.setItem(STORAGE_COMMENTS_KEY, JSON.stringify(appState.userComments));
    
    loadComments(newsId);
    showNotification('Curtida registrada!');
  }

  function updateLikeButtons() {
    document.querySelectorAll('.like-btn').forEach(btn => {
      const cid = btn.dataset.commentId;
      if (appState.likedByUser.includes(String(cid))) {
        btn.classList.add('liked');
      } else {
        btn.classList.remove('liked');
      }
    });
  }

  function submitCommentHandler() {
    const textarea = document.getElementById('commentText');
    if (!textarea) return;
    
    const text = textarea.value.trim();
    if (!text) { 
      showNotification('Digite um comentário antes de enviar.'); 
      return; 
    }
    
    if (text.length > 500) { 
      showNotification('Máximo 500 caracteres.'); 
      return; 
    }
    
    const newsId = appState.currentNewsId;
    if (!newsId) { 
      showNotification('Abra uma notícia antes de comentar.'); 
      return; 
    }
    
    if (!appState.userComments[newsId]) appState.userComments[newsId] = [];
    const id = Date.now();
    const comment = { 
      id, 
      author: appState.userName, 
      text, 
      date: 'Agora mesmo', 
      timestamp: Date.now(), 
      likes: 0 
    };
    
    appState.userComments[newsId].push(comment);
    localStorage.setItem(STORAGE_COMMENTS_KEY, JSON.stringify(appState.userComments));
    
    textarea.value = '';
    document.getElementById('charCount').textContent = '0/500';
    loadComments(newsId);
    
    // Update counts in featured/news cards
    loadFeaturedNews();
    loadInitialNews();
    loadTopNews();
    
    showNotification('Comentário enviado com sucesso!');
  }

  // SUBSCRIPTION: send to Formspree and save locally
  async function subscribeToEndpoint(email) {
    const payload = {
      email,
      timestamp: new Date().toISOString(),
      source: window.location.href,
      message: `Novo assinante: ${email}`
    };
    
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 
          'Accept': 'application/json', 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        return { ok: true };
      } else {
        const text = await res.text();
        return { ok: false, status: res.status, body: text };
      }
    } catch (err) {
      return { ok: false, error: err.message || String(err) };
    }
  }

  async function subscribeModalHandler() {
    const emailInput = document.getElementById('subscribeEmail');
    const email = (emailInput.value || '').trim();
    
    if (!validateEmail(email)) { 
      showNotification('Por favor insira um e-mail válido.'); 
      return; 
    }
    
    // save locally
    if (!appState.subscribers.includes(email)) {
      appState.subscribers.push(email);
      localStorage.setItem(STORAGE_SUBSCRIBERS_KEY, JSON.stringify(appState.subscribers));
    }
    
    // send to Formspree
    confirmSubscribeBtn.disabled = true;
    confirmSubscribeBtn.textContent = 'Enviando...';
    
    const result = await subscribeToEndpoint(email);
    
    confirmSubscribeBtn.disabled = false;
    confirmSubscribeBtn.textContent = 'Confirmar Assinatura';
    
    if (result.ok) {
      showNotification('Assinatura recebida! Você receberá nossas notícias em breve.');
    } else {
      console.error('Formspree error', result);
      showNotification('Assinatura salva localmente. Houve um problema ao enviar o e-mail.');
    }
    
    // close modal
    const subscribeModal = document.getElementById('subscribeModal');
    if (subscribeModal) {
      closeModal(subscribeModal);
    }
    emailInput.value = '';
  }

  async function footerSubscribeHandler() {
    const emailInput = document.getElementById('newsletterEmail');
    const email = (emailInput.value || '').trim();
    
    if (!validateEmail(email)) { 
      showNotification('Por favor insira um e-mail válido.'); 
      return; 
    }
    
    if (!appState.subscribers.includes(email)) {
      appState.subscribers.push(email);
      localStorage.setItem(STORAGE_SUBSCRIBERS_KEY, JSON.stringify(appState.subscribers));
    }
    
    footerSubscribeBtn.disabled = true;
    const original = footerSubscribeBtn.innerHTML;
    footerSubscribeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    
    const result = await subscribeToEndpoint(email);
    
    footerSubscribeBtn.disabled = false;
    footerSubscribeBtn.innerHTML = original;
    
    if (result.ok) {
      showNotification('Assinatura recebida! Obrigado por se inscrever.');
    } else {
      console.error('Formspree error', result);
      showNotification('Assinatura salva localmente. Houve um problema ao enviar o e-mail.');
    }
    
    emailInput.value = '';
  }

  function loadTopNews() {
    const topList = document.getElementById('topNewsList');
    if (!topList) return;
    
    const top = [...appState.currentNews]
      .sort((a,b) => (getCommentsCount(b.id) - getCommentsCount(a.id)))
      .slice(0,5);
    
    topList.innerHTML = '';
    
    if (top.length === 0) {
      topList.innerHTML = '<li>Nenhuma notícia com comentários</li>';
      return;
    }
    
    top.forEach(n => {
      const li = document.createElement('li');
      li.textContent = n.title;
      li.title = n.title;
      topList.appendChild(li);
    });
  }

  // helpers
  function updateLoadMoreButton() {
    const currentNews = getCurrentNews();
    const hasMore = appState.displayedNews < currentNews.length;
    const btn = document.getElementById('loadMoreBtn');
    if (!btn) return;
    
    btn.style.display = hasMore ? 'block' : 'none';
    btn.disabled = !hasMore;
    btn.innerHTML = hasMore ? 
      '<i class="fas fa-plus"></i> Carregar Mais Notícias' : 
      '<i class="fas fa-check"></i> Todas as notícias carregadas';
  }

  function getCurrentNews() {
    if (appState.currentCategory === 'all') return appState.currentNews;
    if (appState.currentCategory === 'search') return appState.currentNews;
    return appState.currentNews.filter(n => n.category === appState.currentCategory);
  }

  function openModal(modal) { 
    modal.style.display = 'block'; 
    document.body.classList.add('modal-open'); 
    document.body.style.overflow = 'hidden'; 
  }
  
  function closeModal(modal) { 
    modal.style.display = 'none'; 
    document.body.classList.remove('modal-open'); 
    document.body.style.overflow = ''; 
  }
  
  function closeAllModals() { 
    document.querySelectorAll('.modal').forEach(m => closeModal(m)); 
  }

  function validateEmail(e) { 
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
    return re.test(e); 
  }

  function initializeAdSense() { 
    if (window.adsbygoogle) { 
      (adsbygoogle = window.adsbygoogle || []).push({}); 
    } 
  }

  function showNotification(msg) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => n.remove());
    
    const n = document.createElement('div');
    n.className = 'notification';
    n.innerHTML = `<i class="fas fa-check-circle"></i><span>${escapeHtml(msg)}</span>`;
    
    document.body.appendChild(n);
    
    // Trigger animation
    setTimeout(() => {
      n.style.opacity = '1';
      n.style.transform = 'translateY(-6px)';
    }, 10);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      n.style.opacity = '0';
      n.style.transform = 'translateY(0)';
      setTimeout(() => n.remove(), 300);
    }, 3000);
  }

  function escapeHtml(s){ 
    if(!s) return ''; 
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  // expose filterNews to global (footer links)
  window.filterNews = function(category) {
    const link = document.querySelector(`.nav-link[data-category="${category}"]`);
    if (link) {
      link.click();
    } else {
      // If link not found (mobile menu might be hidden), filter directly
      filterByCategory(category);
    }
  };
});