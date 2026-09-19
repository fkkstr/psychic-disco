// main.js - Correção com tela vazia até carregamento completo
import { state } from './state.js';
import {
  applyTheme,
  autoThemeByTime,
  setupPressEffect,
  toggleImageExpansion,
  hideAllDropdowns,
  showCollectionsDropdown
} from './ui.js';
import { navigate } from './router.js';

(async function () {
  'use strict';

  // === DOM ELEMENTS ===
  const themeToggleButton = document.getElementById('theme-toggle-button');
  const collectionsDropbtn = document.getElementById('collections-dropbtn');
  const collectionsDropdown = document.getElementById('collectionsDropdown');

  // ============================
  // === ACTIVE NAV LINK ========
  // ============================
  const ARTE_PATHS = ['colecao-1', 'ghost-hardware', 'death-deluxe', 'arquivo'];

  function updateActiveNavLink(path) {
    // Remove .active de todos os itens de navegação
    document.querySelectorAll('.navigation li a, .dropbtn').forEach(el => {
      el.classList.remove('active');
    });

    // Página inicial: nenhum item ativo
    if (path === '/') return;

    const currentPath = path.replace(/^\//, '');

    // Se for uma sub-página do dropdown ARTE, marca o dropbtn
    if (ARTE_PATHS.includes(currentPath)) {
      collectionsDropbtn?.classList.add('active');
      return;
    }

    // Marca o link direto correspondente (ex: /sobre, /playlist)
    const activeLink = document.querySelector(`.navigation li a[data-path="${currentPath}"]`);
    if (activeLink) activeLink.classList.add('active');
  }

  // ============================
  // === EVENT LISTENERS ========
  // ============================
  if (themeToggleButton) {
    themeToggleButton.addEventListener('click', () => {
      const cur = document.documentElement.getAttribute('data-theme');
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

  // Clique global
  window.addEventListener('click', (ev) => {
    if (!ev.target.closest('.dropdown') && !ev.target.closest('.track-actions') && ev.target !== themeToggleButton) {
      hideAllDropdowns();
    }

    // Links SPA
    const link = ev.target.closest('.spa-link');
    if (link && !ev.ctrlKey && !ev.metaKey) {
      ev.preventDefault();
      const path = link.getAttribute('href') || ('/' + link.getAttribute('data-path'));
      if (path && path.startsWith('/')) {
        navigate(path);
        updateActiveNavLink(path);
      }
      return;
    }

    // Cartões da galeria
    const card = ev.target.closest('.gallery-card');
    if (card && !ev.target.closest('a')) {
      toggleImageExpansion(card);
      return;
    }

    // Botão de play
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

  // Teclas
  window.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') hideAllDropdowns();
    if (ev.key === 'Enter' || ev.key === ' ') {
      const card = ev.target.closest('.gallery-card');
      if (card) {
        ev.preventDefault();
        toggleImageExpansion(card);
      }
    }
  });

  // Popstate
  window.addEventListener('popstate', (ev) => {
    const path = ev.state?.path || location.pathname;
    if (path !== state.currentRoute) {
      navigate(path, { replaceState: true });
      updateActiveNavLink(path);
    }
  });

  // ============================
  // === INITIALIZATION =========
  // ============================
  async function initialize() {
    try {
      // Configurações básicas
      autoThemeByTime();

      const savedTheme = (() => {
        try { return localStorage.getItem('theme') || 'light'; } catch(e) { return 'light'; }
      })();
      if (savedTheme) applyTheme(savedTheme);

      setupPressEffect();

      // Determina a rota inicial
      const initialPath = location.pathname === '/index.html' ? '/' : location.pathname;
      
      // CRÍTICO: Navega para o conteúdo correto ANTES de revelar a interface
      await navigate(initialPath, { replaceState: true });
      updateActiveNavLink(initialPath);

      // Pequeno delay para garantir que tudo foi renderizado
      await new Promise(resolve => setTimeout(resolve, 50));

      // REVELAÇÃO: Só agora mostra a interface
      document.body.classList.add('spa-ready');

    } catch (error) {
      console.error('Erro na inicialização:', error);
      // Mesmo com erro, revela a interface para não travar
      document.body.classList.add('spa-ready');
    }
  }

  // IMEDIATO: Executa assim que o script carrega
  // Não espera nem DOM ready para evitar qualquer flash
  initialize();

})();