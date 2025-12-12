// ==============================================
// JUPTERNEWS - SISTEMA PRINCIPAL (COM MÍDIA)
// ==============================================

// CONFIGURAÇÕES (SEM SUPABASE PARA EVITAR ERROS)
const STORAGE_USER_KEY = 'jupterNewsUser';
const STORAGE_SUBSCRIBERS_KEY = 'jupterNewsSubscribers';
const STORAGE_VIEWS_KEY = 'jupterNewsViews';
const STORAGE_COMMENTS_KEY = 'jupterNewsComments';
const STORAGE_LIKES_KEY = 'jupterNewsLikes';
const FORM_ENDPOINT = 'https://formspree.io/f/mkgdpbzw';

// Estado da aplicação (SIMPLIFICADO - SEM SUPABASE)
const appState = {
    currentCategory: 'all',
    currentNews: [],
    displayedNews: 6,
    currentNewsId: null,
    userName: localStorage.getItem(STORAGE_USER_KEY) || null,
    subscribers: JSON.parse(localStorage.getItem(STORAGE_SUBSCRIBERS_KEY)) || [],
    newsViews: JSON.parse(localStorage.getItem(STORAGE_VIEWS_KEY)) || {},
    userComments: JSON.parse(localStorage.getItem(STORAGE_COMMENTS_KEY)) || {},
    userLikes: JSON.parse(localStorage.getItem(STORAGE_LIKES_KEY)) || []
};

// Gerar nome de usuário se não existir
if (!appState.userName) {
    const rand = Math.floor(1000 + Math.random() * 9000);
    appState.userName = `Usuário ${rand}`;
    localStorage.setItem(STORAGE_USER_KEY, appState.userName);
}

// ==============================================
// INICIALIZAÇÃO
// ==============================================

document.addEventListener('DOMContentLoaded', initApp);

async function initApp() {
    console.log('JupterNews inicializando...');
    
    try {
        await loadNewsData();
        setupEventListeners();
        renderContent();
        initAdSense();
        console.log('JupterNews pronto!');
    } catch (error) {
        console.error('Erro na inicialização:', error);
        showNotification('Erro ao carregar notícias. Recarregue a página.');
    }
}

// ==============================================
// CARREGAMENTO DE DADOS
// ==============================================

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
        
        // Dados de fallback em caso de erro
        appState.currentNews = [
            {
                id: 1,
                title: "SITE EM MANUTENÇÃO - CARREGANDO NOTÍCIAS",
                excerpt: "Estamos carregando as últimas notícias. Por favor, aguarde.",
                fullContent: "<p>O JupterNews está carregando as últimas notícias. Por favor, recarregue a página em instantes.</p>",
                image: "https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?auto=format&fit=crop&w=1000&q=80",
                category: "urgentes",
                categoryName: "INFORMAÇÃO",
                time: "Agora mesmo",
                date: new Date().toISOString()
            }
        ];
    }
}

// ==============================================
// CONFIGURAÇÃO DE EVENTOS
// ==============================================

function setupEventListeners() {
    // Menu mobile
    const menuToggle = document.getElementById('menuToggle');
    const navList = document.getElementById('navList');
    
    if (menuToggle && navList) {
        menuToggle.addEventListener('click', () => {
            navList.classList.toggle('active');
        });
    }
    
    // Navegação por categoria
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.getAttribute('data-category');
            
            // Ativar link clicado
            document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
            this.classList.add('active');
            
            // Filtrar notícias
            filterByCategory(category);
            
            // Fechar menu mobile
            if (navList) navList.classList.remove('active');
        });
    });
    
    // Filtro no footer
    document.querySelectorAll('.filter-category').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.getAttribute('data-category');
            filterByCategory(category);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
    
    // Links do footer
    document.getElementById('aboutLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        alert('JupterNews é um portal de notícias dedicado a trazer informações atualizadas e confiáveis 24 horas por dia.');
    });
    
    document.getElementById('contactLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        alert('Contato: contato@jupternews.com\nTelefone: (11) 99999-9999');
    });
    
    document.getElementById('privacyLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        alert('Nossa política de privacidade garante que seus dados estão seguros e são usados apenas para melhorar sua experiência.');
    });
    
    document.getElementById('termsLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        alert('Termos de uso: Você concorda em usar este site apenas para fins legais e respeitar os direitos autorais.');
    });
    
    document.getElementById('careersLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        alert('Envie seu currículo para: carreiras@jupternews.com');
    });
    
    // Botão de carregar mais
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreNews);
    }
    
    // Busca
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', searchNews);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') searchNews();
        });
    }
    
    // Botões de vídeo
    document.querySelectorAll('.video-item').forEach(item => {
        item.addEventListener('click', function() {
            const title = this.getAttribute('data-video-title') || this.querySelector('h4')?.textContent || 'Vídeo';
            playVideo(title);
        });
    });
    
    // Assinatura
    const subscribeBtn = document.getElementById('subscribeBtn');
    const confirmSubscribeBtn = document.getElementById('confirmSubscribeBtn');
    const footerSubscribeBtn = document.getElementById('footerSubscribeBtn');
    
    if (subscribeBtn) {
        subscribeBtn.addEventListener('click', () => openModal('subscribeModal'));
    }
    
    if (confirmSubscribeBtn) {
        confirmSubscribeBtn.addEventListener('click', subscribeModalHandler);
    }
    
    if (footerSubscribeBtn) {
        footerSubscribeBtn.addEventListener('click', footerSubscribeHandler);
    }
    
    // Comentários
    const commentText = document.getElementById('commentText');
    const submitCommentBtn = document.getElementById('submitCommentBtn');
    
    if (commentText) {
        commentText.addEventListener('input', function() {
            const charCount = document.getElementById('charCount');
            if (charCount) charCount.textContent = `${this.value.length}/500`;
        });
    }
    
    if (submitCommentBtn) {
        submitCommentBtn.addEventListener('click', submitCommentHandler);
    }
    
    // Curtidas (delegação)
    document.body.addEventListener('click', async (e) => {
        const likeBtn = e.target.closest('.like-btn');
        if (likeBtn) {
            const newsId = parseInt(likeBtn.dataset.newsId, 10);
            const commentId = parseInt(likeBtn.dataset.commentId, 10);
            await toggleLike(newsId, commentId);
        }
    });
    
    // Galerias (delegação)
    document.body.addEventListener('click', (e) => {
        // Botões de navegação de galeria
        const galleryPrev = e.target.closest('.gallery-prev');
        const galleryNext = e.target.closest('.gallery-next');
        const galleryThumb = e.target.closest('.gallery-thumb');
        const fullscreenBtn = e.target.closest('.gallery-fullscreen');
        
        if (galleryPrev || galleryNext || galleryThumb || fullscreenBtn) {
            e.preventDefault();
            e.stopPropagation();
        }
    });
    
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
}

// ==============================================
// RENDERIZAÇÃO DE CONTEÚDO
// ==============================================

function renderContent() {
    loadFeaturedNews();
    loadInitialNews();
    loadTopNews();
}

function loadFeaturedNews() {
    const featuredContainer = document.getElementById('featuredContainer');
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
    const newsContainer = document.getElementById('newsContainer');
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
    
    // Verificar se tem mídia especial
    const hasMedia = news.media && news.media.length > 0;
    const mediaIcon = hasMedia ? getMediaIcon(news.media[0].type) : '';
    
    card.innerHTML = `
        <div class="news-image">
            <img src="${news.image}" alt="${escapeHtml(news.title)}" loading="lazy">
            <span class="category-label ${news.category}">${news.categoryName}</span>
            ${mediaIcon ? `<span class="media-badge">${mediaIcon}</span>` : ''}
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

function getMediaIcon(mediaType) {
    const icons = {
        'video': '<i class="fas fa-video"></i>',
        'audio': '<i class="fas fa-music"></i>',
        'gallery': '<i class="fas fa-images"></i>',
        'tweet': '<i class="fab fa-twitter"></i>',
        'iframe': '<i class="fas fa-external-link-alt"></i>',
        'custom': '<i class="fas fa-code"></i>'
    };
    return icons[mediaType] || '';
}

function loadMoreNews() {
    const newsContainer = document.getElementById('newsContainer');
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

// ==============================================
// FUNÇÕES PARA PROCESSAMENTO DE MÍDIA
// ==============================================

function renderMediaContent(mediaItems) {
    if (!mediaItems || mediaItems.length === 0) return '';
    
    let mediaHTML = '<div class="news-media-container">';
    
    mediaItems.forEach((media, index) => {
        mediaHTML += renderMediaItem(media, index);
    });
    
    mediaHTML += '</div>';
    return mediaHTML;
}

function renderMediaItem(media, index) {
    switch (media.type) {
        case 'video':
            return renderVideoEmbed(media, index);
        case 'audio':
            return renderAudioPlayer(media, index);
        case 'gallery':
            return renderImageGallery(media, index);
        case 'tweet':
            return renderTweetEmbed(media, index);
        case 'iframe':
            return renderIframeEmbed(media, index);
        case 'custom':
            return renderCustomEmbed(media, index);
        default:
            return '';
    }
}

function renderVideoEmbed(media, index) {
    const videoId = extractYouTubeId(media.embedCode || media.url);
    const platform = media.platform || 'youtube';
    
    let embedHTML = '';
    
    if (platform === 'youtube' && videoId) {
        embedHTML = `
            <div class="media-item media-video" data-index="${index}">
                <div class="media-title">
                    <i class="fab fa-youtube"></i>
                    <h4>${escapeHtml(media.title || 'Vídeo')}</h4>
                </div>
                <div class="video-embed">
                    <iframe 
                        src="https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1"
                        title="${escapeHtml(media.title || 'Vídeo do YouTube')}"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
                        loading="lazy"
                    ></iframe>
                </div>
                <div class="media-actions">
                    <button onclick="playVideo('${escapeHtml(media.title || 'Vídeo')}', '${videoId}', 'youtube')" 
                            class="btn-video-action">
                        <i class="fas fa-expand"></i> Tela Cheia
                    </button>
                    <button onclick="shareVideo('${escapeHtml(media.title || 'Vídeo')}', '${videoId}', 'youtube')" 
                            class="btn-video-action">
                        <i class="fas fa-share"></i> Compartilhar
                    </button>
                </div>
                ${media.caption ? `<div class="media-caption">${escapeHtml(media.caption)}</div>` : ''}
            </div>
        `;
    } else if (platform === 'vimeo') {
        const vimeoId = extractVimeoId(media.embedCode || media.url);
        if (vimeoId) {
            embedHTML = `
                <div class="media-item media-video" data-index="${index}">
                    <div class="media-title">
                        <i class="fab fa-vimeo-v"></i>
                        <h4>${escapeHtml(media.title || 'Vídeo')}</h4>
                    </div>
                    <div class="video-embed">
                        <iframe 
                            src="https://player.vimeo.com/video/${vimeoId}"
                            title="${escapeHtml(media.title || 'Vídeo do Vimeo')}"
                            frameborder="0"
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowfullscreen
                            loading="lazy"
                        ></iframe>
                    </div>
                    <div class="media-actions">
                        <button onclick="playVideo('${escapeHtml(media.title || 'Vídeo')}', '${vimeoId}', 'vimeo')" 
                                class="btn-video-action">
                            <i class="fas fa-expand"></i> Tela Cheia
                        </button>
                        <button onclick="shareVideo('${escapeHtml(media.title || 'Vídeo')}', '${vimeoId}', 'vimeo')" 
                                class="btn-video-action">
                            <i class="fas fa-share"></i> Compartilhar
                        </button>
                    </div>
                    ${media.caption ? `<div class="media-caption">${escapeHtml(media.caption)}</div>` : ''}
                </div>
            `;
        }
    } else if (media.embedCode) {
        // Embed code direto
        embedHTML = `
            <div class="media-item media-video" data-index="${index}">
                <div class="media-title">
                    <i class="fas fa-video"></i>
                    <h4>${escapeHtml(media.title || 'Vídeo')}</h4>
                </div>
                <div class="video-embed">
                    ${media.embedCode}
                </div>
                ${media.caption ? `<div class="media-caption">${escapeHtml(media.caption)}</div>` : ''}
            </div>
        `;
    }
    
    return embedHTML;
}

function renderAudioPlayer(media, index) {
    return `
        <div class="media-item media-audio" data-index="${index}">
            <div class="media-title">
                <i class="fas fa-music"></i>
                <h4>${escapeHtml(media.title || 'Áudio')}</h4>
                ${media.duration ? `<span class="media-duration">${media.duration}</span>` : ''}
            </div>
            <div class="audio-player">
                <audio 
                    controls 
                    preload="metadata"
                    ${media.poster ? `poster="${media.poster}"` : ''}
                >
                    <source src="${media.audioUrl}" type="audio/mpeg">
                    Seu navegador não suporta o elemento de áudio.
                </audio>
            </div>
            ${media.caption ? `<div class="media-caption">${escapeHtml(media.caption)}</div>` : ''}
            ${media.description ? `<div class="media-description">${escapeHtml(media.description)}</div>` : ''}
        </div>
    `;
}

function renderImageGallery(media, index) {
    const galleryId = `gallery-${index}-${Date.now()}`;
    
    let thumbnails = '';
    let fullImages = '';
    
    (media.images || []).forEach((img, imgIndex) => {
        thumbnails += `
            <div class="gallery-thumb" data-index="${imgIndex}">
                <img src="${img}" alt="Imagem ${imgIndex + 1}" loading="lazy">
            </div>
        `;
        
        fullImages += `
            <div class="gallery-slide ${imgIndex === 0 ? 'active' : ''}">
                <img src="${img}" alt="Imagem ${imgIndex + 1}">
                <div class="slide-counter">${imgIndex + 1} / ${media.images.length}</div>
            </div>
        `;
    });
    
    return `
        <div class="media-item media-gallery" data-index="${index}" id="${galleryId}">
            <div class="media-title">
                <i class="fas fa-images"></i>
                <h4>${escapeHtml(media.title || 'Galeria de Imagens')}</h4>
            </div>
            <div class="gallery-container">
                <div class="gallery-main">
                    ${fullImages}
                    <button class="gallery-prev"><i class="fas fa-chevron-left"></i></button>
                    <button class="gallery-next"><i class="fas fa-chevron-right"></i></button>
                </div>
                <div class="gallery-thumbnails">
                    ${thumbnails}
                </div>
            </div>
            ${media.caption ? `<div class="media-caption">${escapeHtml(media.caption)}</div>` : ''}
            <div class="gallery-controls">
                <button class="gallery-fullscreen" title="Tela cheia">
                    <i class="fas fa-expand"></i>
                </button>
            </div>
        </div>
    `;
}

function renderTweetEmbed(media, index) {
    return `
        <div class="media-item media-tweet" data-index="${index}">
            <div class="media-title">
                <i class="fab fa-twitter"></i>
                <h4>Tweet de @${escapeHtml(media.username || 'Twitter')}</h4>
            </div>
            <div class="tweet-embed" data-tweet-id="${media.tweetId}">
                <div class="tweet-placeholder">
                    <i class="fab fa-twitter"></i>
                    <p>Carregando tweet...</p>
                </div>
            </div>
            <div class="tweet-actions">
                <a href="https://twitter.com/${media.username}/status/${media.tweetId}" 
                   target="_blank" 
                   rel="noopener noreferrer">
                    <i class="fas fa-external-link-alt"></i> Ver no Twitter
                </a>
            </div>
        </div>
    `;
}

function renderIframeEmbed(media, index) {
    return `
        <div class="media-item media-iframe" data-index="${index}">
            <div class="media-title">
                <i class="fas fa-window-restore"></i>
                <h4>${escapeHtml(media.title || 'Conteúdo Interativo')}</h4>
            </div>
            <div class="iframe-container">
                <iframe 
                    src="${media.url}"
                    title="${escapeHtml(media.title || 'Conteúdo embutido')}"
                    frameborder="0"
                    scrolling="${media.scrolling || 'auto'}"
                    height="${media.height || '500'}"
                    loading="lazy"
                ></iframe>
            </div>
            ${media.caption ? `<div class="media-caption">${escapeHtml(media.caption)}</div>` : ''}
        </div>
    `;
}

function renderCustomEmbed(media, index) {
    return `
        <div class="media-item media-custom" data-index="${index}">
            <div class="media-title">
                <i class="fas fa-code"></i>
                <h4>${escapeHtml(media.title || 'Conteúdo Personalizado')}</h4>
            </div>
            <div class="custom-embed">
                ${media.html || media.content || ''}
            </div>
            ${media.caption ? `<div class="media-caption">${escapeHtml(media.caption)}</div>` : ''}
        </div>
    `;
}

// Funções auxiliares para processamento de URLs
function extractYouTubeId(url) {
    if (!url) return null;
    
    // Padrões de URLs do YouTube
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/v\/([^&\n?#]+)/,
        /youtube\.com\/embed\/([^&\n?#]+)/,
        /youtu\.be\/([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }
    
    return url;
}

function extractVimeoId(url) {
    if (!url) return null;
    
    const pattern = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/;
    const match = url.match(pattern);
    
    return match ? match[1] : null;
}

// Função para inicializar galerias
function initMediaGalleries() {
    document.querySelectorAll('.media-gallery').forEach(gallery => {
        const main = gallery.querySelector('.gallery-main');
        const slides = gallery.querySelectorAll('.gallery-slide');
        const thumbs = gallery.querySelectorAll('.gallery-thumb');
        const prevBtn = gallery.querySelector('.gallery-prev');
        const nextBtn = gallery.querySelector('.gallery-next');
        const fullscreenBtn = gallery.querySelector('.gallery-fullscreen');
        
        let currentSlide = 0;
        
        function showSlide(index) {
            // Validar índice
            if (index < 0) index = slides.length - 1;
            if (index >= slides.length) index = 0;
            
            // Atualizar slides
            slides.forEach(slide => slide.classList.remove('active'));
            slides[index].classList.add('active');
            
            // Atualizar thumbnails
            thumbs.forEach(thumb => thumb.classList.remove('active'));
            thumbs[index].classList.add('active');
            
            currentSlide = index;
        }
        
        // Event listeners
        if (prevBtn) {
            prevBtn.addEventListener('click', () => showSlide(currentSlide - 1));
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => showSlide(currentSlide + 1));
        }
        
        thumbs.forEach((thumb, index) => {
            thumb.addEventListener('click', () => showSlide(index));
        });
        
        // Tela cheia
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => {
                gallery.classList.toggle('fullscreen');
                fullscreenBtn.innerHTML = gallery.classList.contains('fullscreen') 
                    ? '<i class="fas fa-compress"></i>' 
                    : '<i class="fas fa-expand"></i>';
            });
        }
        
        // Navegação por teclado
        gallery.addEventListener('keydown', (e) => {
            if (gallery.classList.contains('fullscreen')) {
                if (e.key === 'ArrowLeft') showSlide(currentSlide - 1);
                if (e.key === 'ArrowRight') showSlide(currentSlide + 1);
                if (e.key === 'Escape') {
                    gallery.classList.remove('fullscreen');
                    fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
                }
            }
        });
        
        // Inicializar
        showSlide(0);
    });
}

// Função para carregar tweets via Twitter Widget API
function loadTwitterWidgets() {
    if (typeof twttr !== 'undefined') {
        twttr.widgets.load();
    } else {
        // Carregar Twitter Widget API se não estiver disponível
        const script = document.createElement('script');
        script.src = 'https://platform.twitter.com/widgets.js';
        script.async = true;
        script.charset = 'utf-8';
        document.body.appendChild(script);
        
        // Configurar callback para quando o script carregar
        script.onload = () => {
            if (typeof twttr !== 'undefined') {
                twttr.widgets.load();
            }
        };
    }
}

// ==============================================
// MODAL DE NOTÍCIAS (ATUALIZADO COM MÍDIA)
// ==============================================

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
    const commentsCount = getCommentsCount(newsId);
    
    // Preparar conteúdo completo com mídia
    let fullContent = news.fullContent || '';
    
    // Adicionar conteúdo de mídia se existir
    if (news.media && news.media.length > 0) {
        const mediaContent = renderMediaContent(news.media);
        // Inserir mídia após o primeiro parágrafo ou no final
        if (fullContent.includes('</p>')) {
            const firstPEnd = fullContent.indexOf('</p>') + 4;
            fullContent = fullContent.slice(0, firstPEnd) + mediaContent + fullContent.slice(firstPEnd);
        } else {
            fullContent += mediaContent;
        }
    }
    
    if (modalContent) {
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
                    <img src="${news.image}" alt="${escapeHtml(news.title)}" loading="lazy">
                </div>
                <div class="news-body">${fullContent}</div>
            </div>
        `;
        
        // Inicializar componentes de mídia
        setTimeout(() => {
            initMediaGalleries();
            loadTwitterWidgets();
            
            // Adicionar event listeners para as galerias
            document.querySelectorAll('.gallery-prev, .gallery-next, .gallery-thumb, .gallery-fullscreen').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                });
            });
        }, 100);
    }
    
    // Carregar comentários
    await loadComments(newsId);
    
    // Abrir modal
    openModal('newsModal');
}

// ==============================================
// PLAYER DE VÍDEO EM MODAL SEPARADO
// ==============================================

window.playVideo = function(title, videoId, platform = 'youtube') {
    const modal = document.getElementById('videoModal');
    const player = document.getElementById('videoPlayer');
    
    let embedUrl = '';
    
    if (platform === 'youtube' && videoId) {
        embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
    } else if (platform === 'vimeo' && videoId) {
        embedUrl = `https://player.vimeo.com/video/${videoId}?autoplay=1`;
    }
    
    if (player) {
        if (embedUrl) {
            player.innerHTML = `
                <div class="video-player-embed">
                    <iframe 
                        src="${embedUrl}"
                        title="${escapeHtml(title)}"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
                    ></iframe>
                </div>
                <div class="video-player-info">
                    <h3>${escapeHtml(title)}</h3>
                    <div class="video-actions">
                        <button onclick="toggleFullscreenVideo()" class="btn-video-action">
                            <i class="fas fa-expand"></i> Tela Cheia
                        </button>
                        <button onclick="shareVideo('${escapeHtml(title)}', '${videoId}', '${platform}')" class="btn-video-action">
                            <i class="fas fa-share"></i> Compartilhar
                        </button>
                    </div>
                </div>
            `;
        } else {
            player.innerHTML = `
                <div class="video-placeholder">
                    <i class="fas fa-play-circle"></i>
                    <h3>${escapeHtml(title)}</h3>
                    <p>Este é um exemplo de player de vídeo.</p>
                </div>
            `;
        }
    }
    
    openModal('videoModal');
};

// Funções auxiliares para o player de vídeo
window.toggleFullscreenVideo = function() {
    const player = document.getElementById('videoPlayer');
    const iframe = player.querySelector('iframe');
    
    if (iframe) {
        if (!document.fullscreenElement) {
            if (iframe.requestFullscreen) {
                iframe.requestFullscreen();
            } else if (iframe.webkitRequestFullscreen) {
                iframe.webkitRequestFullscreen();
            } else if (iframe.msRequestFullscreen) {
                iframe.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    }
};

window.shareVideo = function(title, videoId, platform) {
    let url = '';
    
    if (platform === 'youtube') {
        url = `https://youtube.com/watch?v=${videoId}`;
    } else if (platform === 'vimeo') {
        url = `https://vimeo.com/${videoId}`;
    }
    
    if (navigator.share) {
        navigator.share({
            title: title,
            text: `Assista: ${title}`,
            url: url
        });
    } else {
        // Fallback para copiar link
        navigator.clipboard.writeText(url)
            .then(() => showNotification('Link copiado para a área de transferência!'))
            .catch(() => alert(`Compartilhe este link:\n${url}`));
    }
};

// ==============================================
// FILTRAGEM E BUSCA
// ==============================================

function filterByCategory(category) {
    appState.currentCategory = category;
    
    // Atualizar títulos
    const sectionTitle = document.getElementById('sectionTitle');
    const newsListTitle = document.getElementById('newsListTitle');
    
    if (category === 'all') {
        if (sectionTitle) sectionTitle.textContent = 'Destaques do Dia';
        if (newsListTitle) newsListTitle.textContent = 'Últimas Notícias';
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
        if (sectionTitle) sectionTitle.textContent = `Destaques de ${name}`;
        if (newsListTitle) newsListTitle.textContent = `Notícias de ${name}`;
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
    const featuredContainer = document.getElementById('featuredContainer');
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

function searchNews() {
    const searchInput = document.getElementById('searchInput');
    const term = (searchInput?.value || '').trim().toLowerCase();
    
    if (!term) {
        showNotification('Digite um termo para buscar');
        return;
    }
    
    appState.currentCategory = 'search';
    
    // Atualizar títulos
    const sectionTitle = document.getElementById('sectionTitle');
    const newsListTitle = document.getElementById('newsListTitle');
    
    if (sectionTitle) sectionTitle.textContent = `Resultados para: "${term}"`;
    if (newsListTitle) newsListTitle.textContent = 'Notícias Encontradas';
    
    // Limpar container
    const newsContainer = document.getElementById('newsContainer');
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
        
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';
        return;
    }
    
    // Mostrar resultados
    filtered.forEach(news => {
        newsContainer.appendChild(createNewsCard(news));
    });
    
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) loadMoreBtn.style.display = 'none';
    if (searchInput) searchInput.value = '';
    
    // Scroll para resultados
    document.querySelector('.news-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    showNotification(`Encontradas ${filtered.length} notícias`);
}

// ==============================================
// SISTEMA DE COMENTÁRIOS (LOCAL)
// ==============================================

function getCommentsFor(newsId) {
    return appState.userComments[newsId] ? [...appState.userComments[newsId]] : [];
}

function getCommentsCount(newsId) {
    return getCommentsFor(newsId).length;
}

async function loadComments(newsId) {
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
    const isLiked = appState.userLikes.includes(`${newsId}_${comment.id}`);
    const likedClass = isLiked ? 'liked' : '';
    
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

async function toggleLike(newsId, commentId) {
    const likeKey = `${newsId}_${commentId}`;
    
    // Verificar se já curtiu
    if (appState.userLikes.includes(likeKey)) {
        // Remover like
        appState.userLikes = appState.userLikes.filter(key => key !== likeKey);
        
        // Decrementar no comentário
        const comment = appState.userComments[newsId]?.find(c => c.id === commentId);
        if (comment) {
            comment.likes = Math.max((comment.likes || 0) - 1, 0);
        }
        
        showNotification('Curtida removida');
    } else {
        // Adicionar like
        appState.userLikes.push(likeKey);
        
        // Incrementar no comentário
        if (!appState.userComments[newsId]) {
            appState.userComments[newsId] = [];
        }
        
        let comment = appState.userComments[newsId].find(c => c.id === commentId);
        if (!comment) {
            // Se não encontrar o comentário, pode ser de outro usuário
            // Nesse sistema simples, não podemos atualizar likes de outros
            showNotification('Comentário não encontrado localmente');
            return;
        }
        
        comment.likes = (comment.likes || 0) + 1;
        showNotification('Comentário curtido!');
    }
    
    // Salvar no localStorage
    localStorage.setItem(STORAGE_LIKES_KEY, JSON.stringify(appState.userLikes));
    localStorage.setItem(STORAGE_COMMENTS_KEY, JSON.stringify(appState.userComments));
    
    // Recarregar comentários se o modal estiver aberto
    if (appState.currentNewsId === newsId) {
        await loadComments(newsId);
    }
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
    
    // Limpar textarea
    textarea.value = '';
    const charCount = document.getElementById('charCount');
    if (charCount) charCount.textContent = '0/500';
    
    // Recarregar comentários
    await loadComments(newsId);
    
    // Atualizar outras partes
    loadFeaturedNews();
    loadInitialNews();
    loadTopNews();
    
    showNotification('Comentário enviado com sucesso!');
}

// ==============================================
// NEWSLETTER
// ==============================================

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
    const confirmSubscribeBtn = document.getElementById('confirmSubscribeBtn');
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
    const footerSubscribeBtn = document.getElementById('footerSubscribeBtn');
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

// ==============================================
// NOTÍCIAS MAIS LIDAS
// ==============================================

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

// ==============================================
// FUNÇÕES AUXILIARES
// ==============================================

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

// ==============================================
// INICIALIZAR AD SENSE
// ==============================================

if (window.adsbygoogle) {
    window.addEventListener('load', () => {
        (adsbygoogle = window.adsbygoogle || []).push({});
    });
}