(async function () {
  'use strict';

  // ============================
  // === MODO DE DIAGNÓSTICO ===
  // ============================
  const MODO_DIAGNOSTICO = true;

  // === STATE ===
  const state = {
    currentRoute: null,
    isLoading: false,
    expandedCard: null,
    preloadedImages: new Set(),
    coverCache: new Map(),
    isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0
  };

  // === DOM ELEMENTS ===
  const htmlEl = document.documentElement;
  const themeToggleButton = document.getElementById('theme-toggle-button');
  const collectionsDropbtn = document.getElementById('collections-dropbtn');
  const collectionsDropdown = document.getElementById('collectionsDropdown');
  const mainContent = document.getElementById('main-content');
  const mainHeader = document.getElementById('main-header');
  const FADE_DURATION = 150;

  // === ROUTES ===
  const routes = {
    '/': { title: 'FOLKKSTAR' },
    '/arquivo': { title: 'Arquivo - 2019-2025 - FOLKKSTAR', url: 'arquivo.html' },
    '/colecao-1': { title: 'Coleção 1 - 2020 - FOLKKSTAR', url: 'colecao-1.html' },
    '/ghost-hardware': { title: 'Ghost Hardware - 2021 - FOLKKSTAR', url: 'ghost-hardware.html' },
    '/death-deluxe': { title: 'Death Deluxe - Em Breve - FOLKKSTAR', url: 'death-deluxe.html' },
    '/sobre': { title: 'Sobre - FOLKKSTAR', url: 'sobre.html' },
    '/playlist': { title: 'Playlist - FOLKKSTAR', url: 'playlist.html' }
  };

  // ============================
  // === FUNÇÕES DE UI ==========
  // ============================
  function rAFUpdate(fn) { requestAnimationFrame(fn); }

  function batchVisibility({ headerOpacity, contentOpacity, headerPointerEvents, contentPointerEvents }) {
    rAFUpdate(() => {
      if (mainHeader) {
        if (typeof headerOpacity !== 'undefined') mainHeader.style.opacity = headerOpacity;
        if (typeof headerPointerEvents !== 'undefined') mainHeader.style.pointerEvents = headerPointerEvents;
      }
      if (mainContent) {
        if (typeof contentOpacity !== 'undefined') mainContent.style.opacity = contentOpacity;
        if (typeof contentPointerEvents !== 'undefined') mainContent.style.pointerEvents = contentPointerEvents;
      }
    });
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function setupPressEffect() {
    const PRESS_DURATION = 180;
    function applyPressEffect(el) {
      el.classList.add('press-feedback');
      setTimeout(() => el.classList.remove('press-feedback'), PRESS_DURATION);
    }
    const interactiveElements = document.querySelectorAll('.dropbtn, .gallery-card, .play-button, .spa-link');
    interactiveElements.forEach(el => {
      const handlePress = () => applyPressEffect(el);
      el.addEventListener('mousedown', handlePress);
      el.addEventListener('touchstart', handlePress, { passive: true });
    });
    if (state.isTouchDevice) document.body.classList.add('touch-device');
  }

  function applyTheme(theme) {
    htmlEl.setAttribute('data-theme', theme);
    try { localStorage.setItem('theme', theme); } catch(e) {}
  }

  function autoThemeByTime() {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const brasiliaOffset = -3;
    const brasiliaHour = new Date(utc + 3600000 * brasiliaOffset).getHours();
    if (brasiliaHour >= 18 || brasiliaHour < 7) applyTheme('dark');
    else applyTheme('light');
  }

  function hideAllDropdowns() {
    if (collectionsDropdown && collectionsDropbtn) {
      collectionsDropdown.classList.remove('show');
      collectionsDropbtn.setAttribute('aria-expanded', 'false');
      collectionsDropbtn.classList.remove('dropdown-open');
    }
    document.querySelectorAll('.dropdown-content-player.show').forEach(d => {
      d.classList.remove('show');
      d.setAttribute('aria-hidden', 'true');
      let playButton = d.closest('.track-actions')?.querySelector('.play-button');
      if (playButton) {
        playButton.classList.remove('dropdown-open');
        playButton.setAttribute('aria-expanded', 'true');
      }
    });
  }

  async function preloadCollectionImages(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch ${url}`);
      const html = await response.text();
      const tempElement = document.createElement('div');
      tempElement.innerHTML = html;
      const galleryGrid = tempElement.querySelector('.gallery-grid');
      if (galleryGrid) {
        const images = galleryGrid.querySelectorAll('img');
        images.forEach(img => {
          const imgSrc = img.getAttribute('src');
          if (imgSrc && !state.preloadedImages.has(imgSrc)) {
            const preloadImage = new Image();
            preloadImage.src = imgSrc;
            state.preloadedImages.add(imgSrc);
          }
        });
      }
    } catch (error) { console.error('Error preloading images from', url, error); }
  }

  function addGalleryAccessibility(root = document) {
    const cards = root.querySelectorAll('.gallery-card');
    cards.forEach(card => {
      if (!card.hasAttribute('tabindex')) card.setAttribute('tabindex', '0');
      if (!card.hasAttribute('role')) card.setAttribute('role', 'button');
      card.setAttribute('aria-pressed', 'false');
    });
  }

  function showCollectionsDropdown() {
    hideAllDropdowns();
    if (collectionsDropdown && collectionsDropbtn) {
      collectionsDropdown.classList.add('show');
      collectionsDropbtn.setAttribute('aria-expanded', 'true');
      collectionsDropbtn.classList.add('dropdown-open');
    }
    for (const path in routes) {
      if (routes.hasOwnProperty(path) && path !== '/' && routes?.[path]?.url) {
        preloadCollectionImages(routes?.[path]?.url);
      }
    }
  }

  function toggleImageExpansion(card) {
    if (!card) return;
    const galleryGrid = card.closest('.gallery-grid');
    const flash = card.querySelector('.gallery-flash-overlay');
    if (flash) { flash.classList.add('active'); setTimeout(() => flash.classList.remove('active'), 200); }
    if (state.expandedCard === card) {
      card.classList.remove('expanded');
      card.setAttribute('aria-pressed', 'false');
      state.expandedCard = null;
      if (galleryGrid) galleryGrid.classList.remove('has-expanded-item');
    } else {
      if (state.expandedCard) {
        state.expandedCard.classList.remove('expanded');
        state.expandedCard.setAttribute('aria-pressed', 'false');
      }
      card.classList.add('expanded');
      card.setAttribute('aria-pressed', 'true');
      state.expandedCard = card;
      if (galleryGrid) galleryGrid.classList.add('has-expanded-item');
      setTimeout(() => card.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 300);
    }
  }

  async function loadContent(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch ${url}`);
      return await response.text();
    } catch (error) {
      console.error('Failed to load content:', error);
      return `<div style="text-align: center; padding: 50px; color: var(--text-color);">Erro ao carregar o conteúdo.</div>`;
    }
  }

  function updateURL(path) {
    if (history.pushState) history.pushState({ path }, '', path);
  }

  async function navigate(path) {
    if (state.isLoading || path === state.currentRoute) return;
    state.isLoading = true;
    hideAllDropdowns();
    scrollToTop();
    batchVisibility({ contentOpacity: '0', contentPointerEvents: 'none' });

    setTimeout(async () => {
      const route = routes?.[path];
      if (!route) {
        console.error('Route not found:', path);
        state.isLoading = false;
        return;
      }
      const newContent = route.url ? await loadContent(route.url) : '';
      mainContent.innerHTML = newContent;
      state.currentRoute = path;
      state.expandedCard = null;
      document.title = route.title || 'FOLKKSTAR';
      document.body.classList.toggle('collection-active', path !== '/');
      addGalleryAccessibility(mainContent);
      updateURL(path);
      setupPressEffect();

      // ===== ESPERA O CARREGAMENTO DA PLAYLIST =====
      if (path === '/playlist') {
        await renderSpotifyPlaylist();
      }

      batchVisibility({ contentOpacity: '1', contentPointerEvents: 'auto' });
      state.isLoading = false;
    }, FADE_DURATION);
  }

  // ============================
  // === EVENT LISTENERS ========
  // ============================
  if (themeToggleButton) {
    themeToggleButton.addEventListener('click', () => {
      const cur = htmlEl.getAttribute('data-theme');
      applyTheme(cur === 'dark' ? 'light' : 'dark');
    });
  }

  if (collectionsDropbtn && collectionsDropdown) {
    collectionsDropbtn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      const isOpen = collectionsDropdown.classList.contains('show');
      isOpen ? hideAllDropdowns() : showCollectionsDropdown();
    });
  }

  window.addEventListener('click', (ev) => {
    if (!ev.target.closest('.dropdown') && !ev.target.closest('.track-actions') && ev.target !== themeToggleButton) {
      hideAllDropdowns();
    }
    const link = ev.target.closest('.spa-link');
    if (link && !ev.ctrlKey && !ev.metaKey) {
      ev.preventDefault();
      const path = link.getAttribute('href') || ('/' + link.getAttribute('data-path'));
      if (path && path.startsWith('/')) navigate(path);
      return;
    }
    const card = ev.target.closest('.gallery-card');
    if (card && !ev.target.closest('a')) { toggleImageExpansion(card); return; }

    const playButton = ev.target.closest('.play-button');
    if (playButton) {
      ev.stopPropagation();
      const dropdown = playButton.nextElementSibling;
      const isVisible = dropdown && dropdown.classList.contains('show');
      hideAllDropdowns();
      if (dropdown && !isVisible) {
        dropdown.classList.add('show');
        dropdown.setAttribute('aria-hidden', 'false');
        playButton.classList.add('dropdown-open');
        playButton.setAttribute('aria-expanded', 'true');
      }
    }
  });

  window.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') hideAllDropdowns();
    if (ev.key === 'Enter' || ev.key === ' ') {
      const card = ev.target.closest('.gallery-card');
      if (card) { ev.preventDefault(); toggleImageExpansion(card); }
    }
  });

  window.addEventListener('popstate', (ev) => {
    const path = ev.state?.path || location.pathname;
    state.currentRoute = '';
    navigate(path);
  });

  // ============================
  // === SPOTIFY PLAYLIST API ===
  // ============================
  const SPOTIFY_CLIENT_ID = '84c8d774e72344b7953095d43306f77b';
  const SPOTIFY_CLIENT_SECRET = '4fbfb579fa5849d49bf68bfafc46ceb2';
  const SPOTIFY_PLAYLIST_ID = '5rFYcSe7fKCXCh3drht24Y';

  async function getSpotifyAccessToken() {
    const authString = btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`);
    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error_description || 'Erro ao obter token do Spotify');
      return data.access_token;
    } catch (err) {
      console.error('Erro de autenticação no Spotify:', err);
      return null;
    }
  }

  async function fetchSpotifyPlaylist(token) {
    if (!SPOTIFY_PLAYLIST_ID) throw new Error('ID da playlist do Spotify não configurado.');
    const url = `https://api.spotify.com/v1/playlists/${SPOTIFY_PLAYLIST_ID}/tracks`;
    try {
      const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message || 'Erro ao buscar playlist do Spotify');
      return data.items;
    } catch (err) {
      throw new Error(`Falha ao buscar playlist: ${err.message}`);
    }
  }

  async function renderSpotifyPlaylist() {
    const container = mainContent.querySelector(".playlist-container");
    if (!container) return;
    container.innerHTML = '';

    try {
      const token = await getSpotifyAccessToken();
      if (!token) throw new Error('Token de acesso do Spotify não obtido.');
      const allItems = await fetchSpotifyPlaylist(token);

      allItems.forEach(item => {
        const track = item.track;
        if (!track || !track.artists.length) return;

        const artist = track.artists[0].name;
        const songTitle = track.name;
        const albumTitle = track.album.name;
        const coverUrl = track.album.images[0]?.url || '';
        const spotifyUrl = track.external_urls.spotify;

        const div = document.createElement('div');
        div.className = 'track';
        div.dataset.artist = artist;
        div.dataset.track = songTitle;

        div.innerHTML = `
          <div class="track-cover">
            ${coverUrl ? `<img src="${coverUrl}" alt="Capa de ${songTitle} - ${artist}" loading="lazy">` : ''}
          </div>
          <div class="track-info">
            <h2 class="track-title">${songTitle}</h2>
            <p class="track-meta">${artist}</p>
          </div>
          <div class="track-actions">
            <a class="play-button" href="${spotifyUrl}" target="_blank" rel="noopener noreferrer" aria-label="Abrir no Spotify">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <polygon points="5,3 19,12 5,21"></polygon>
              </svg>
            </a>
          </div>
          ${MODO_DIAGNOSTICO ? '<div class="debug-info"></div>' : ''} `;

        container.appendChild(div);
      });

    } catch (err) {
      console.error('Erro ao renderizar playlist:', err);
      if(container) container.innerHTML = `<p>Não foi possível carregar a playlist: ${err.message}</p>`;
    }
  }

  // ============================
  // === INITIALIZATION =========
  // ============================
  function initialize() {
    autoThemeByTime();
    const savedTheme = (() => { try { return localStorage.getItem('theme') || 'light'; } catch(e) { return 'light'; } })();
    if (savedTheme) applyTheme(savedTheme);
    setupPressEffect();
    const initialPath = location.pathname === '/index.html' ? '/' : location.pathname;
    if (routes?.[initialPath]) {
      state.currentRoute = '';
      navigate(initialPath);
    }
    batchVisibility({ headerOpacity: '1', contentOpacity: '1', headerPointerEvents: 'auto', contentPointerEvents: 'auto' });
  }

  initialize();

})();