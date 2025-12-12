// Configurações do Supabase - SUBSTITUA COM SEUS DADOS
const SUPABASE_URL = 'https://mpbuejsxiltcfwfnqpfe.supabase.co'; // Substitua pela sua URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wYnVlanN4aWx0Y2Z3Zm5xcGZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MDYwMzcsImV4cCI6MjA4MTA4MjAzN30.N2802Orv1LLDJ5hOpbn_zO8tKfKHsSY_hPBx68BX42c'; // Substitua pela sua chave

// Configurações locais
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
    userName: localStorage.getItem(STORAGE_USER_KEY) || null,
    subscribers: JSON.parse(localStorage.getItem(STORAGE_SUBSCRIBERS_KEY)) || [],
    newsViews: JSON.parse(localStorage.getItem(STORAGE_VIEWS_KEY)) || {},
    userId: localStorage.getItem('jupterNewsUserId') || generateUserId(),
    commentsCache: JSON.parse(localStorage.getItem('jupterNewsCommentsCache')) || {}
};

// Gerar ID único para usuário
function generateUserId() {
    const id = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('jupterNewsUserId', id);
    return id;
}

// Cliente Supabase
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM Elements
let navListEl, loadMoreBtn, newsContainer, featuredContainer;
let menuToggle, searchInput, searchBtn, subscribeBtn;
let commentText, submitCommentBtn, confirmSubscribeBtn, footerSubscribeBtn;

// Inicialização
document.addEventListener('DOMContentLoaded', initApp);

async function initApp() {
    console.log('JupterNews inicializando com Supabase...');
    
    // Carregar elementos DOM
    loadDOMElements();
    
    // Configurar usuário
    setupUser();
    
    // Carregar notícias
    await loadNewsData();
    
    // Configurar eventos
    setupEventListeners();
    
    // Carregar conteúdo inicial
    await renderContent();
    
    // Inicializar AdSense
    initAdSense();
    
    console.log('JupterNews pronto! Usuário:', appState.userId);
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
    document.body.addEventListener('click', async (e) => {
        const likeBtn = e.target.closest('.like-btn');
        if (likeBtn) {
            const newsId = parseInt(likeBtn.dataset.newsId, 10);
            const commentId = parseInt(likeBtn.dataset.commentId, 10);
            await toggleLike(newsId, commentId);
        }
    });
}

function handleNavClick(e) {
    const link = e.target.closest('.nav-link');
    if (!link) return;
    
    e.preventDefault();
    const category = link.getAttribute('data-category');
    
    document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
    link.classList.add('active');
    
    filterByCategory(category);
    navListEl?.classList.remove('active');
}

// Funções do Supabase
async function fetchComments(newsId) {
    try {
        // Verificar cache primeiro (2 minutos)
        const cacheKey = `comments_${newsId}`;
        const cached = appState.commentsCache[cacheKey];
        
        if (cached && (Date.now() - cached.timestamp < 2 * 60 * 1000)) {
            return cached.data;
        }
        
        // Buscar do Supabase
        const { data, error } = await supabaseClient
            .from('comments')
            .select('*')
            .eq('news_id', newsId)
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Erro ao buscar comentários:', error);
            return [];
        }
        
        if (!data || data.length === 0) {
            // Atualizar cache vazio
            appState.commentsCache[cacheKey] = {
                data: [],
                timestamp: Date.now()
            };
            localStorage.setItem('jupterNewsCommentsCache', JSON.stringify(appState.commentsCache));
            return [];
        }
        
        // Buscar likes do usuário
        const commentIds = data.map(c => c.id);
        const { data: userLikes } = await supabaseClient
            .from('comment_likes')
            .select('comment_id')
            .in('comment_id', commentIds)
            .eq('user_hash', appState.userId);
        
        const likedComments = userLikes?.map(like => like.comment_id) || [];
        
        // Formatar dados
        const formattedComments = data.map(comment => ({
            id: comment.id,
            author: comment.author,
            text: comment.text,
            date: formatTimeAgo(new Date(comment.created_at)),
            timestamp: new Date(comment.created_at).getTime(),
            likes: comment.likes || 0,
            likedByUser: likedComments.includes(comment.id)
        }));
        
        // Atualizar cache
        appState.commentsCache[cacheKey] = {
            data: formattedComments,
            timestamp: Date.now()
        };
        localStorage.setItem('jupterNewsCommentsCache', JSON.stringify(appState.commentsCache));
        
        return formattedComments;
    } catch (error) {
        console.error('Erro ao buscar comentários:', error);
        return [];
    }
}

async function addComment(newsId, text) {
    try {
        // Criar ID único baseado em timestamp
        const commentId = Date.now();
        
        const newComment = {
            id: commentId,
            news_id: newsId,
            author: appState.userName,
            text: text,
            likes: 0,
            created_at: new Date().toISOString()
        };
        
        // Inserir no Supabase
        const { error } = await supabaseClient
            .from('comments')
            .insert([newComment]);
        
        if (error) {
            console.error('Erro ao inserir comentário:', error);
            throw error;
        }
        
        // Limpar cache para esta notícia
        delete appState.commentsCache[`comments_${newsId}`];
        localStorage.setItem('jupterNewsCommentsCache', JSON.stringify(appState.commentsCache));
        
        return {
            ...newComment,
            date: 'Agora mesmo',
            timestamp: commentId,
            likedByUser: false
        };
    } catch (error) {
        console.error('Erro ao adicionar comentário:', error);
        throw error;
    }
}

async function toggleLike(newsId, commentId) {
    try {
        // Verificar se já curtiu
        const { data: existingLike } = await supabaseClient
            .from('comment_likes')
            .select('id')
            .eq('comment_id', commentId)
            .eq('user_hash', appState.userId)
            .single();
        
        let newLikes;
        
        if (existingLike) {
            // Remover like
            await supabaseClient
                .from('comment_likes')
                .delete()
                .eq('id', existingLike.id);
            
            // Buscar likes atuais
            const { data: comment } = await supabaseClient
                .from('comments')
                .select('likes')
                .eq('id', commentId)
                .single();
            
            newLikes = Math.max((comment?.likes || 0) - 1, 0);
            
            // Atualizar contador
            await supabaseClient
                .from('comments')
                .update({ likes: newLikes })
                .eq('id', commentId);
            
            showNotification('Curtida removida');
        } else {
            // Adicionar like
            await supabaseClient
                .from('comment_likes')
                .insert([{
                    comment_id: commentId,
                    user_hash: appState.userId,
                    created_at: new Date().toISOString()
                }]);
            
            // Buscar likes atuais
            const { data: comment } = await supabaseClient
                .from('comments')
                .select('likes')
                .eq('id', commentId)
                .single();
            
            newLikes = (comment?.likes || 0) + 1;
            
            // Atualizar contador
            await supabaseClient
                .from('comments')
                .update({ likes: newLikes })
                .eq('id', commentId);
            
            showNotification('Comentário curtido!');
        }
        
        // Atualizar interface IMEDIATAMENTE
        const likeBtn = document.querySelector(`.like-btn[data-comment-id="${commentId}"]`);
        if (likeBtn) {
            const likeCountSpan = likeBtn.querySelector('.like-count');
            if (likeCountSpan) {
                likeCountSpan.textContent = newLikes;
                likeBtn.classList.toggle('liked', !existingLike);
            }
        }
        
        // Limpar cache para forçar atualização
        delete appState.commentsCache[`comments_${newsId}`];
        localStorage.setItem('jupterNewsCommentsCache', JSON.stringify(appState.commentsCache));
        
        // Atualizar contadores gerais após 1 segundo
        setTimeout(async () => {
            if (appState.currentNewsId === newsId) {
                await loadComments(newsId);
            }
            // Atualizar contadores nas notícias
            await updateNewsCounters();
        }, 1000);
        
    } catch (error) {
        console.error('Erro ao alternar like:', error);
        showNotification('Erro ao processar curtida. Tente novamente.');
    }
}

async function updateNewsCounters() {
    // Atualizar notícias em destaque
    if (featuredContainer) {
        await loadFeaturedNews();
    }
    
    // Atualizar notícias na lista
    if (newsContainer) {
        const newsCards = newsContainer.querySelectorAll('.news-card');
        for (const card of newsCards) {
            const newsId = parseInt(card.getAttribute('data-id'), 10);
            const comments = await fetchComments(newsId);
            const commentsCount = comments.length;
            
            // Atualizar contador de comentários
            const commentSpan = card.querySelector('.news-meta span:nth-child(2)');
            if (commentSpan) {
                const icon = commentSpan.querySelector('i');
                commentSpan.innerHTML = '';
                if (icon) commentSpan.appendChild(icon);
                commentSpan.appendChild(document.createTextNode(` ${commentsCount}`));
            }
        }
    }
}

// Renderização
async function renderContent() {
    await loadFeaturedNews();
    await loadInitialNews();
    loadTopNews();
}

async function loadFeaturedNews() {
    if (!featuredContainer) return;
    
    const featured = getCurrentNews().slice(0, 3);
    featuredContainer.innerHTML = '';
    
    if (featured.length === 0) {
        featuredContainer.innerHTML = '<p class="no-news">Nenhuma notícia em destaque</p>';
        return;
    }
    
    for (const news of featured) {
        const article = document.createElement('article');
        const index = featured.indexOf(news);
        article.className = index === 0 ? 'main-featured' : 'secondary-featured';
        article.setAttribute('data-id', news.id);
        
        // Buscar contagem de comentários
        const comments = await fetchComments(news.id);
        const commentsCount = comments.length;
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
    }
}

async function loadInitialNews() {
    if (!newsContainer) return;
    
    newsContainer.innerHTML = '';
    appState.displayedNews = 6;
    const newsToShow = getCurrentNews().slice(0, appState.displayedNews);
    
    if (newsToShow.length === 0) {
        newsContainer.innerHTML = '<div class="no-news"><p>Nenhuma notícia encontrada</p></div>';
        updateLoadMoreButton();
        return;
    }
    
    for (const news of newsToShow) {
        const card = await createNewsCard(news);
        newsContainer.appendChild(card);
    }
    
    updateLoadMoreButton();
}

async function createNewsCard(news) {
    const card = document.createElement('article');
    card.className = 'news-card';
    card.setAttribute('data-id', news.id);
    
    const comments = await fetchComments(news.id);
    const commentsCount = comments.length;
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

async function loadMoreNews() {
    if (!newsContainer) return;
    
    const currentNews = getCurrentNews();
    const start = appState.displayedNews;
    const end = start + 3;
    const moreNews = currentNews.slice(start, end);
    
    if (moreNews.length === 0) {
        showNotification('Todas as notícias foram carregadas!');
        return;
    }
    
    for (const news of moreNews) {
        const card = await createNewsCard(news);
        newsContainer.appendChild(card);
    }
    
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

async function loadCategoryFeatured(category) {
    if (!featuredContainer) return;
    
    const items = getCurrentNews().slice(0, 3);
    featuredContainer.innerHTML = '';
    
    if (items.length === 0) {
        featuredContainer.innerHTML = '<p class="no-news">Nenhuma notícia nesta categoria</p>';
        return;
    }
    
    for (const news of items) {
        const article = document.createElement('article');
        const index = items.indexOf(news);
        article.className = index === 0 ? 'main-featured' : 'secondary-featured';
        article.setAttribute('data-id', news.id);
        
        const comments = await fetchComments(news.id);
        const commentsCount = comments.length;
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
    }
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
        createNewsCard(news).then(card => {
            newsContainer.appendChild(card);
        });
    });
    
    if (loadMoreBtn) loadMoreBtn.style.display = 'none';
    if (searchInput) searchInput.value = '';
    
    // Scroll para resultados
    document.querySelector('.news-list').scrollIntoView({ behavior: 'smooth', block: 'start' });
    showNotification(`Encontradas ${filtered.length} notícias`);
}

// Modal de Notícias
async function openNewsModal(newsId) {
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
    const comments = await fetchComments(newsId);
    const commentsCount = comments.length;
    
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
    await loadComments(newsId);
    
    // Abrir modal
    openModal('newsModal');
}

async function loadComments(newsId) {
    const commentsList = document.getElementById('commentsList');
    const commentCount = document.getElementById('commentCount');
    const modalCommentCount = document.getElementById('modalCommentCount');
    
    const comments = await fetchComments(newsId);
    
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
    const likedClass = comment.likedByUser ? 'liked' : '';
    
    return `
        <div class="comment" data-comment-id="${comment.id}">
            <div class="comment-header">
                <div class="comment-author"><i class="fas fa-user"></i> ${escapeHtml(comment.author)}</div>
                <div class="comment-date">${escapeHtml(comment.date)}</div>
            </div>
            <div class="comment-text">${escapeHtml(comment.text)}</div>
            <div class="comment-actions-comment">
                <button class="like-btn ${likedClass}" data-news-id="${newsId}" data-comment-id="${comment.id}">
                    <i class="far fa-thumbs-up"></i> Curtir (<span class="like-count">${comment.likes || 0}</span>)
                </button>
            </div>
        </div>
    `;
}

async function submitCommentHandler() {
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
    
    // Desabilitar botão enquanto envia
    submitCommentBtn.disabled = true;
    submitCommentBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    
    try {
        // Adicionar comentário no Supabase
        await addComment(newsId, text);
        
        // Limpar textarea
        textarea.value = '';
        document.getElementById('charCount').textContent = '0/500';
        
        // Recarregar comentários
        await loadComments(newsId);
        
        // Atualizar outras partes
        await loadFeaturedNews();
        await loadInitialNews();
        loadTopNews();
        
        showNotification('Comentário enviado com sucesso!');
    } catch (error) {
        showNotification('Erro ao enviar comentário. Tente novamente.');
        console.error('Erro:', error);
    } finally {
        // Re-habilitar botão
        submitCommentBtn.disabled = false;
        submitCommentBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar Comentário';
    }
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

function formatTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) return 'Agora mesmo';
    if (diffMin < 60) return `Há ${diffMin} minuto${diffMin > 1 ? 's' : ''}`;
    if (diffHour < 24) return `Há ${diffHour} hora${diffHour > 1 ? 's' : ''}`;
    if (diffDay < 7) return `Há ${diffDay} dia${diffDay > 1 ? 's' : ''}`;
    
    return date.toLocaleDateString('pt-BR');
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