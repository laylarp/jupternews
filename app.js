// Configurações
const STORAGE_COMMENTS_KEY = 'jupterNewsComments';
const STORAGE_USER_KEY = 'jupterNewsUser';
const STORAGE_SUBSCRIBERS_KEY = 'jupterNewsSubscribers';
const STORAGE_VIEWS_KEY = 'jupterNewsViews';
const FORM_ENDPOINT = 'https://formspree.io/f/mkgdpbzw';

// Estado da aplicação
const appState = {
    currentCategory: 'all',
    currentNews: [],
    displayedNews: 6,
    currentNewsId: null,
    userComments: JSON.parse(localStorage.getItem(STORAGE_COMMENTS_KEY)) || {},
    newsViews: JSON.parse(localStorage.getItem(STORAGE_VIEWS_KEY)) || {},
    userName: localStorage.getItem(STORAGE_USER_KEY) || null,
    subscribers: JSON.parse(localStorage.getItem(STORAGE_SUBSCRIBERS_KEY)) || []
};

// DOM Elements
let navListEl, loadMoreBtn, newsContainer, featuredContainer;
let menuToggle, searchInput, searchBtn, subscribeBtn;
let commentText, submitCommentBtn, confirmSubscribeBtn, footerSubscribeBtn;

// Inicialização
document.addEventListener('DOMContentLoaded', initApp);

async function initApp() {
    console.log('JupterNews inicializando...');
    
    // Carregar elementos DOM
    loadDOMElements();
    
    // Configurar usuário
    setupUser();
    
    // Carregar notícias
    await loadNewsData();
    
    // Configurar eventos
    setupEventListeners();
    
    // Carregar conteúdo inicial
    renderContent();
    
    // Inicializar AdSense
    initAdSense();
    
    console.log('JupterNews pronto!');
}

function loadDOMElements() {
    navListEl = document.getElementById('navList');
    loadMoreBtn = document.getElementById('loadMoreBtn');
    newsContainer = document.getElementById('newsContainer');
    featuredContainer = document.getElementById('featuredContainer');
    menuToggle = document.getElementById('menuToggle');
    searchInput = document.getElementById('searchInput');
    searchBtn = document.getElementById('searchBtn');
    subscribeBtn = document.getElementById('subscribeBtn');
    commentText = document.getElementById('commentText');
    submitCommentBtn = document.getElementById('submitCommentBtn');
    confirmSubscribeBtn = document.getElementById('confirmSubscribeBtn');
    footerSubscribeBtn = document.getElementById('footerSubscribeBtn');
}

function setupUser() {
    if (!appState.userName) {
        const rand = Math.floor(1000 + Math.random() * 9000);
        appState.userName = `Usuário ${rand}`;
        localStorage.setItem(STORAGE_USER_KEY, appState.userName);
    }
}

async function loadNewsData() {
    try {
        const response = await fetch('news-data.json');
        if (!response.ok) throw new Error('Falha ao carregar notícias');
        
        const data = await response.json();
        
        // Ordenar por data (mais recentes primeiro)
        appState.currentNews = data.news.sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });
        
        console.log(`${appState.currentNews.length} notícias carregadas`);
    } catch (error) {
        console.error('Erro ao carregar notícias:', error);
        appState.currentNews = [];
    }
}

function setupEventListeners() {
    // Menu mobile
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navListEl?.classList.toggle('active');
        });
    }

    // Navegação
    if (navListEl) {
        navListEl.addEventListener('click', handleNavClick);
    }

    // Busca
    if (searchBtn) searchBtn.addEventListener('click', searchNews);
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') searchNews();
        });
    }

    // Botões
    if (loadMoreBtn) loadMoreBtn.addEventListener('click', loadMoreNews);
    if (subscribeBtn) subscribeBtn.addEventListener('click', () => openModal('subscribeModal'));
    if (submitCommentBtn) submitCommentBtn.addEventListener('click', submitCommentHandler);
    if (confirmSubscribeBtn) confirmSubscribeBtn.addEventListener('click', subscribeModalHandler);
    if (footerSubscribeBtn) footerSubscribeBtn.addEventListener('click', footerSubscribeHandler);

    // Contador de caracteres
    if (commentText) {
        commentText.addEventListener('input', function() {
            const charCount = document.getElementById('charCount');
            if (charCount) charCount.textContent = `${this.value.length}/500`;
        });
    }

    // Fechar modais
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeAllModals();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeAllModals();
    });

    // Curtidas (delegação)
    document.body.addEventListener('click', (e) => {
        const likeBtn = e.target.closest('.like-btn');
        if (likeBtn) {
            const newsId = parseInt(likeBtn.dataset.newsId, 10);
            const commentId = parseInt(likeBtn.dataset.commentId, 10);
            toggleLike(newsId, commentId);
        }
    });
}

function handleNavClick(e) {
    const link = e.target.closest('.nav-link');
    if (!link) return;
    
    e.preventDefault();
    const category = link.getAttribute('data-category');
    
    // Ativar link
    document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
    link.classList.add('active');
    
    // Filtrar notícias
    filterByCategory(category);
    
    // Fechar menu mobile
    navListEl?.classList.remove('active');
}

// Renderização
function renderContent() {
    loadFeaturedNews();
    loadInitialNews();
    loadTopNews();
}

function loadFeaturedNews() {
    if (!featuredContainer) return;
    
    const featured = getCurrentNews().slice(0, 3);
    featuredContainer.innerHTML = '';
    
    if (featured.length === 0) {
        featuredContainer.innerHTML = '<p class="no-news">Nenhuma notícia em destaque</p>';
        return;
    }
    
    featured.forEach((news, index) => {
        const article = document.createElement('article');
        article.className = index === 0 ? 'main-featured' : 'secondary-featured';
        article.setAttribute('data-id', news.id);
        
        const commentsCount = getCommentsCount(news.id);
        const isMain = index === 0;
        
        article.innerHTML = `
            <div class="news-image">
                <img src="${news.image}" alt="${escapeHtml(news.title)}" loading="lazy">
                <span class="category-label ${news.category}">${news.categoryName}</span>
                ${isMain ? '<div class="featured-badge"><i class="fas fa-crown"></i> EM DESTAQUE</div>' : ''}
            </div>
            <div class="news-content">
                <h3 class="news-title">${escapeHtml(news.title)}</h3>
                ${isMain ? `<p class="news-excerpt">${escapeHtml(news.excerpt)}</p>` : ''}
                <div class="news-meta">
                    <span><i class="far fa-clock"></i> ${news.time}</span>
                    <span><i class="far fa-comment"></i> ${commentsCount} comentários</span>
                </div>
            </div>
        `;
        
        article.addEventListener('click', () => openNewsModal(news.id));
        featuredContainer.appendChild(article);
    });
}

function loadInitialNews() {
    if (!newsContainer) return;
    
    newsContainer.innerHTML = '';
    appState.displayedNews = 6;
    const newsToShow = getCurrentNews().slice(0, appState.displayedNews);
    
    if (newsToShow.length === 0) {
        newsContainer.innerHTML = '<div class="no-news"><p>Nenhuma notícia encontrada</p></div>';
        updateLoadMoreButton();
        return;
    }
    
    newsToShow.forEach(news => {
        newsContainer.appendChild(createNewsCard(news));
    });
    
    updateLoadMoreButton();
}

function createNewsCard(news) {
    const card = document.createElement('article');
    card.className = 'news-card';
    card.setAttribute('data-id', news.id);
    
    const commentsCount = getCommentsCount(news.id);
    const views = appState.newsViews[news.id] || 0;
    
    card.innerHTML = `
        <div class="news-image">
            <img src="${news.image}" alt="${escapeHtml(news.title)}" loading="lazy">
            <span class="category-label ${news.category}">${news.categoryName}</span>
        </div>
        <div class="news-content">
            <h3 class="news-title">${escapeHtml(news.title)}</h3>
            <p class="news-excerpt">${escapeHtml(news.excerpt)}</p>
            <div class="news-meta">
                <span><i class="far fa-clock"></i> ${news.time}</span>
                <span><i class="far fa-comment"></i> ${commentsCount}</span>
                <span><i class="far fa-eye"></i> ${views}</span>
            </div>
        </div>
    `;
    
    card.addEventListener('click', () => openNewsModal(news.id));
    return card;
}

function loadMoreNews() {
    if (!newsContainer) return;
    
    const currentNews = getCurrentNews();
    const start = appState.displayedNews;
    const end = start + 3;
    const moreNews = currentNews.slice(start, end);
    
    if (moreNews.length === 0) {
        showNotification('Todas as notícias foram carregadas!');
        return;
    }
    
    moreNews.forEach(news => {
        newsContainer.appendChild(createNewsCard(news));
    });
    
    appState.displayedNews = Math.min(end, currentNews.length);
    updateLoadMoreButton();
}

// Filtragem
function filterByCategory(category) {
    appState.currentCategory = category;
    
    // Atualizar títulos
    const sectionTitle = document.getElementById('sectionTitle');
    const newsListTitle = document.getElementById('newsListTitle');
    
    if (category === 'all') {
        sectionTitle.textContent = 'Destaques do Dia';
        newsListTitle.textContent = 'Últimas Notícias';
    } else {
        const categoryNames = {
            urgentes: 'Urgentes',
            economia: 'Economia',
            ciencia: 'Ciência',
            esportes: 'Esportes',
            cultura: 'Cultura',
            tecnologia: 'Tecnologia',
            saude: 'Saúde'
        };
        
        const name = categoryNames[category] || category;
        sectionTitle.textContent = `Destaques de ${name}`;
        newsListTitle.textContent = `Notícias de ${name}`;
    }
    
    // Recarregar conteúdo
    loadInitialNews();
    
    if (category === 'all') {
        loadFeaturedNews();
    } else {
        loadCategoryFeatured(category);
    }
    
    loadTopNews();
    
    // Scroll para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function loadCategoryFeatured(category) {
    if (!featuredContainer) return;
    
    const items = getCurrentNews().slice(0, 3);
    featuredContainer.innerHTML = '';
    
    if (items.length === 0) {
        featuredContainer.innerHTML = '<p class="no-news">Nenhuma notícia nesta categoria</p>';
        return;
    }
    
    items.forEach((news, index) => {
        const article = document.createElement('article');
        article.className = index === 0 ? 'main-featured' : 'secondary-featured';
        article.setAttribute('data-id', news.id);
        
        const commentsCount = getCommentsCount(news.id);
        const isMain = index === 0;
        
        article.innerHTML = `
            <div class="news-image">
                <img src="${news.image}" alt="${escapeHtml(news.title)}" loading="lazy">
                <span class="category-label ${news.category}">${news.categoryName}</span>
            </div>
            <div class="news-content">
                <h3 class="news-title">${escapeHtml(news.title)}</h3>
                ${isMain ? `<p class="news-excerpt">${escapeHtml(news.excerpt)}</p>` : ''}
                <div class="news-meta">
                    <span><i class="far fa-clock"></i> ${news.time}</span>
                    <span><i class="far fa-comment"></i> ${commentsCount} comentários</span>
                </div>
            </div>
        `;
        
        article.addEventListener('click', () => openNewsModal(news.id));
        featuredContainer.appendChild(article);
    });
}

// Busca
function searchNews() {
    const term = (searchInput?.value || '').trim().toLowerCase();
    
    if (!term) {
        showNotification('Digite um termo para buscar');
        return;
    }
    
    appState.currentCategory = 'search';
    
    // Atualizar títulos
    document.getElementById('sectionTitle').textContent = `Resultados para: "${term}"`;
    document.getElementById('newsListTitle').textContent = 'Notícias Encontradas';
    
    // Limpar container
    if (!newsContainer) return;
    newsContainer.innerHTML = '';
    
    // Filtrar notícias
    const filtered = appState.currentNews.filter(n => 
        (n.title || '').toLowerCase().includes(term) ||
        (n.excerpt || '').toLowerCase().includes(term) ||
        (n.fullContent || '').toLowerCase().includes(term)
    );
    
    if (filtered.length === 0) {
        newsContainer.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>Nenhuma notícia encontrada</h3>
                <p>Tente outros termos de busca</p>
            </div>
        `;
        
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';
        return;
    }
    
    // Mostrar resultados
    filtered.forEach(news => {
        newsContainer.appendChild(createNewsCard(news));
    });
    
    if (loadMoreBtn) loadMoreBtn.style.display = 'none';
    if (searchInput) searchInput.value = '';
    
    // Scroll para resultados
    document.querySelector('.news-list').scrollIntoView({ behavior: 'smooth', block: 'start' });
    showNotification(`Encontradas ${filtered.length} notícias`);
}

// Modal de Notícias
function openNewsModal(newsId) {
    const news = appState.currentNews.find(n => n.id === newsId);
    
    if (!news) {
        showNotification('Notícia não encontrada');
        return;
    }
    
    appState.currentNewsId = newsId;
    
    // Registrar visualização
    appState.newsViews[newsId] = (appState.newsViews[newsId] || 0) + 1;
    localStorage.setItem(STORAGE_VIEWS_KEY, JSON.stringify(appState.newsViews));
    
    // Atualizar conteúdo
    const modalContent = document.getElementById('modalNewsContent');
    const commentsCount = getCommentsCount(newsId);
    
    modalContent.innerHTML = `
        <div class="news-full">
            <h2>${escapeHtml(news.title)}</h2>
            <div class="news-meta-full">
                <span><i class="far fa-clock"></i> ${news.time}</span>
                <span><i class="far fa-comment"></i> <span id="modalCommentCount">${commentsCount}</span> comentários</span>
                <span><i class="far fa-eye"></i> ${appState.newsViews[newsId] || 0} visualizações</span>
                <span class="category-label ${news.category}">${news.categoryName}</span>
            </div>
            <div class="news-full-image">
                <img src="${news.image}" alt="${escapeHtml(news.title)}">
            </div>
            <div class="news-body">${news.fullContent || ''}</div>
        </div>
    `;
    
    // Carregar comentários
    loadComments(newsId);
    
    // Abrir modal
    openModal('newsModal');
}

// Sistema de Comentários
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
    
    const comments = getCommentsFor(newsId);
    
    // Ordenar por data
    comments.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    
    // Atualizar contadores
    if (commentCount) commentCount.textContent = `(${comments.length})`;
    if (modalCommentCount) modalCommentCount.textContent = comments.length;
    
    if (!commentsList) return;
    
    if (comments.length === 0) {
        commentsList.innerHTML = '<p class="no-comments">Seja o primeiro a comentar esta notícia!</p>';
        return;
    }
    
    // Renderizar comentários
    commentsList.innerHTML = comments.map(comment => renderCommentHtml(newsId, comment)).join('');
}

function renderCommentHtml(newsId, comment) {
    return `
        <div class="comment" data-comment-id="${comment.id}">
            <div class="comment-header">
                <div class="comment-author"><i class="fas fa-user"></i> ${escapeHtml(comment.author)}</div>
                <div class="comment-date">${escapeHtml(comment.date)}</div>
            </div>
            <div class="comment-text">${escapeHtml(comment.text)}</div>
            <div class="comment-actions-comment">
                <button class="like-btn" data-news-id="${newsId}" data-comment-id="${comment.id}">
                    <i class="far fa-thumbs-up"></i> Curtir (<span class="like-count">${comment.likes || 0}</span>)
                </button>
            </div>
        </div>
    `;
}

function toggleLike(newsId, commentId) {
    if (!appState.userComments[newsId]) return;
    
    const comment = appState.userComments[newsId].find(c => c.id === commentId);
    if (!comment) return;
    
    // Incrementar curtidas
    comment.likes = (comment.likes || 0) + 1;
    
    // Salvar
    localStorage.setItem(STORAGE_COMMENTS_KEY, JSON.stringify(appState.userComments));
    
    // Recarregar comentários
    loadComments(newsId);
    showNotification('Curtida registrada!');
}

function submitCommentHandler() {
    const textarea = document.getElementById('commentText');
    if (!textarea) return;
    
    const text = textarea.value.trim();
    
    if (!text) {
        showNotification('Digite um comentário antes de enviar');
        return;
    }
    
    if (text.length > 500) {
        showNotification('Máximo de 500 caracteres');
        return;
    }
    
    const newsId = appState.currentNewsId;
    
    if (!newsId) {
        showNotification('Abra uma notícia antes de comentar');
        return;
    }
    
    // Criar comentário
    if (!appState.userComments[newsId]) appState.userComments[newsId] = [];
    
    const newComment = {
        id: Date.now(),
        author: appState.userName,
        text: text,
        date: 'Agora mesmo',
        timestamp: Date.now(),
        likes: 0
    };
    
    appState.userComments[newsId].push(newComment);
    localStorage.setItem(STORAGE_COMMENTS_KEY, JSON.stringify(appState.userComments));
    
    // Limpar e atualizar
    textarea.value = '';
    document.getElementById('charCount').textContent = '0/500';
    loadComments(newsId);
    
    // Atualizar outras partes
    loadFeaturedNews();
    loadInitialNews();
    loadTopNews();
    
    showNotification('Comentário enviado com sucesso!');
}

// Newsletter
async function subscribeToEndpoint(email) {
    const payload = {
        email: email,
        timestamp: new Date().toISOString(),
        source: window.location.href,
        message: `Novo assinante JupterNews: ${email}`
    };
    
    try {
        const response = await fetch(FORM_ENDPOINT, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        return { ok: response.ok };
    } catch (error) {
        return { ok: false, error: error.message };
    }
}

async function subscribeModalHandler() {
    const emailInput = document.getElementById('subscribeEmail');
    const email = (emailInput?.value || '').trim();
    
    if (!validateEmail(email)) {
        showNotification('Por favor, insira um e-mail válido');
        return;
    }
    
    // Salvar localmente
    if (!appState.subscribers.includes(email)) {
        appState.subscribers.push(email);
        localStorage.setItem(STORAGE_SUBSCRIBERS_KEY, JSON.stringify(appState.subscribers));
    }
    
    // Desabilitar botão enquanto envia
    if (confirmSubscribeBtn) {
        confirmSubscribeBtn.disabled = true;
        confirmSubscribeBtn.textContent = 'Enviando...';
    }
    
    // Enviar para Formspree
    const result = await subscribeToEndpoint(email);
    
    // Re-habilitar botão
    if (confirmSubscribeBtn) {
        confirmSubscribeBtn.disabled = false;
        confirmSubscribeBtn.textContent = 'Confirmar Assinatura';
    }
    
    if (result.ok) {
        showNotification('Assinatura confirmada! Você receberá nossas notícias em breve.');
        closeModal('subscribeModal');
    } else {
        showNotification('Assinatura salva localmente. Houve um problema ao enviar.');
    }
    
    if (emailInput) emailInput.value = '';
}

async function footerSubscribeHandler() {
    const emailInput = document.getElementById('newsletterEmail');
    const email = (emailInput?.value || '').trim();
    
    if (!validateEmail(email)) {
        showNotification('Por favor, insira um e-mail válido');
        return;
    }
    
    if (!appState.subscribers.includes(email)) {
        appState.subscribers.push(email);
        localStorage.setItem(STORAGE_SUBSCRIBERS_KEY, JSON.stringify(appState.subscribers));
    }
    
    // Feedback visual
    if (footerSubscribeBtn) {
        footerSubscribeBtn.disabled = true;
        const originalHTML = footerSubscribeBtn.innerHTML;
        footerSubscribeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        
        // Enviar
        const result = await subscribeToEndpoint(email);
        
        // Restaurar botão
        footerSubscribeBtn.disabled = false;
        footerSubscribeBtn.innerHTML = originalHTML;
        
        if (result.ok) {
            showNotification('Assinatura confirmada! Obrigado por se inscrever.');
        } else {
            showNotification('Assinatura salva localmente. Houve um problema ao enviar.');
        }
    }
    
    if (emailInput) emailInput.value = '';
}

// Notícias Mais Lidas
function loadTopNews() {
    const topList = document.getElementById('topNewsList');
    if (!topList) return;
    
    const topNews = [...appState.currentNews]
        .sort((a, b) => {
            const viewsA = appState.newsViews[a.id] || 0;
            const viewsB = appState.newsViews[b.id] || 0;
            return viewsB - viewsA;
        })
        .slice(0, 5);
    
    topList.innerHTML = '';
    
    if (topNews.length === 0) {
        topList.innerHTML = '<li>Nenhuma notícia com visualizações</li>';
        return;
    }
    
    topNews.forEach(news => {
        const li = document.createElement('li');
        li.textContent = news.title.length > 60 ? news.title.substring(0, 60) + '...' : news.title;
        li.title = news.title;
        li.addEventListener('click', () => openNewsModal(news.id));
        topList.appendChild(li);
    });
}

// Funções Auxiliares
function getCurrentNews() {
    if (appState.currentCategory === 'all' || appState.currentCategory === 'search') {
        return appState.currentNews;
    }
    return appState.currentNews.filter(n => n.category === appState.currentCategory);
}

function updateLoadMoreButton() {
    const currentNews = getCurrentNews();
    const hasMore = appState.displayedNews < currentNews.length;
    const btn = document.getElementById('loadMoreBtn');
    
    if (!btn) return;
    
    btn.style.display = hasMore ? 'block' : 'none';
    btn.disabled = !hasMore;
    btn.innerHTML = hasMore
        ? '<i class="fas fa-plus"></i> Carregar Mais Notícias'
        : '<i class="fas fa-check"></i> Todas as notícias carregadas';
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.classList.add('modal-open');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
    }
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showNotification(message) {
    // Remover notificações anteriores
    const existing = document.querySelectorAll('.notification');
    existing.forEach(n => n.remove());
    
    // Criar nova notificação
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${escapeHtml(message)}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(-6px)';
    }, 10);
    
    // Auto-remover
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(0)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function initAdSense() {
    if (window.adsbygoogle) {
        (adsbygoogle = window.adsbygoogle || []).push({});
    }
}

// Funções Globais
window.filterNews = function(category) {
    const link = document.querySelector(`.nav-link[data-category="${category}"]`);
    if (link) {
        link.click();
    } else {
        filterByCategory(category);
    }
};

window.showAbout = function() {
    alert('JupterNews é um portal de notícias dedicado a trazer informações atualizadas e confiáveis 24 horas por dia.');
};

window.showContact = function() {
    alert('Contato: contato@jupternews.com\nTelefone: (11) 99999-9999');
};

window.showPrivacy = function() {
    alert('Nossa política de privacidade garante que seus dados estão seguros e são usados apenas para melhorar sua experiência.');
};

window.showTerms = function() {
    alert('Termos de uso: Você concorda em usar este site apenas para fins legais e respeitar os direitos autorais.');
};

window.showCareers = function() {
    alert('Envie seu currículo para: carreiras@jupternews.com');
};

window.playVideo = function(title) {
    const modal = document.getElementById('videoModal');
    const player = document.getElementById('videoPlayer');
    
    player.innerHTML = `
        <div class="video-placeholder">
            <i class="fas fa-play-circle"></i>
            <h3>${escapeHtml(title)}</h3>
            <p>Esta é uma demonstração do player de vídeo.</p>
            <p>Em um ambiente real, aqui estaria o vídeo embedado do YouTube ou Vimeo.</p>
        </div>
    `;
    
    openModal('videoModal');
};