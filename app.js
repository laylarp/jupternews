// Configurações do Supabase - SUBSTITUA COM SEUS DADOS
const SUPABASE_URL = 'https://seu-projeto.supabase.co'; // Substitua pela sua URL
const SUPABASE_ANON_KEY = 'sua-chave-anon-publica'; // Substitua pela sua chave

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
    renderContent();
    
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
        // Verificar cache primeiro (5 minutos)
        const cacheKey = `comments_${newsId}`;
        const cached = appState.commentsCache[cacheKey];
        
        if (cached && (Date.now() - cached.timestamp < 5 * 60 * 1000)) {
            return cached.data;
        }
        
        // Buscar do Supabase
        const { data, error } = await supabaseClient
            .from('comments')
            .select('*')
            .eq('news_id', newsId)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
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
        const newComment = {
            id: Date.now(), // Usar timestamp como ID único
            news_id: newsId,
            author: appState.userName,
            text: text,
            likes: 0,
            created_at: new Date().toISOString()
        };
        
        const { data, error } = await supabaseClient
            .from('comments')
            .insert([newComment]);
        
        if (error) throw error;
        
        // Limpar cache para esta notícia
        delete appState.commentsCache[`comments_${newsId}`];
        localStorage.setItem('jupterNewsCommentsCache', JSON.stringify(appState.commentsCache));
        
        return {
            ...newComment,
            date: 'Agora mesmo',
            timestamp: newComment.id,
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
        
        if (existingLike) {
            // Remover like
            await supabaseClient
                .from('comment_likes')
                .delete()
                .eq('id', existingLike.id);
            
            // Decrementar contador
            await supabaseClient.rpc('decrement_like', { comment_id: commentId });
            
            showNotification('Curtida removida');
        } else {
            // Adicionar like
            await supabaseClient
                .from('comment_likes')
                .insert([{
                    comment_id: commentId,
                    user_hash: appState.userId
                }]);
            
            // Incrementar contador
            await supabaseClient.rpc('increment_like', { comment_id: commentId });
            
            showNotification('Comentário curtido!');
        }
        
        // Limpar cache
        delete appState.commentsCache[`comments_${newsId}`];
        localStorage.setItem('jupterNewsCommentsCache', JSON.stringify(appState.commentsCache));
        
        // Recarregar comentários se o modal estiver aberto
        if (appState.currentNewsId === newsId) {
            await loadComments(newsId);
        }
        
    } catch (error) {
        console.error('Erro ao alternar like:', error);
        showNotification('Erro ao processar curtida');
    }
}

// Função auxiliar para criar a stored procedure no Supabase
// Execute este SQL no Supabase SQL Editor:
/*
CREATE OR REPLACE FUNCTION increment_like(comment_id BIGINT)
RETURNS void AS $$
BEGIN
  UPDATE comments 
  SET likes = COALESCE(likes, 0) + 1 
  WHERE id = comment_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_like(comment_id BIGINT)
RETURNS void AS $$
BEGIN
  UPDATE comments 
  SET likes = GREATEST(COALESCE(likes, 0) - 1, 0)
  WHERE id = comment_id;
END;
$$ LANGUAGE plpgsql;
*/

// Funções de renderização
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
        
        // Buscar contagem de comentários em tempo real
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

// Funções auxiliares
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

// Mantenha as outras funções do arquivo original (filterByCategory, searchNews, etc.)
// Elas não precisam ser modificadas, apenas certifique-se de incluir todas

// Inclua a biblioteca do Supabase no seu HTML
// Adicione esta linha antes do </body> no index.html:
// <script src="https://unpkg.com/@supabase/supabase-js@2"></script>