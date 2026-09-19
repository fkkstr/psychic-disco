// router.js - Correção com transições suaves
import { state, routes } from './state.js';
import {
  scrollToTop,
  batchVisibility,
  addGalleryAccessibility,
  setupPressEffect,
  hideAllDropdowns
} from './ui.js';
import { renderSpotifyPlaylist } from './api.js';

const mainContent = document.getElementById('main-content');
const FADE_DURATION = 120; // Reduzido para transições mais rápidas

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

/**
 * Navega para uma rota SPA
 * @param {string} path Caminho da rota
 * @param {object} options { replaceState?: boolean, forceReload?: boolean, skipTransition?: boolean }
 */
export async function navigate(path, options = {}) {
  const { replaceState = false, forceReload = false, skipTransition = false } = options;

  if (state.isLoading) return;
  if (!forceReload && path === state.currentRoute) return;

  state.isLoading = true;
  hideAllDropdowns();

  const route = routes?.[path];
  if (!route) {
    console.error('Route not found:', path);
    state.isLoading = false;
    return;
  }

  // CORREÇÃO: Só faz fade out se não for a inicialização
  if (!skipTransition && mainContent && mainContent.style.opacity !== '0') {
    batchVisibility({ contentOpacity: '0', contentPointerEvents: 'none' });
    await new Promise(resolve => setTimeout(resolve, FADE_DURATION));
  }

  // Limpa conteúdo anterior
  if (mainContent) {
    mainContent.innerHTML = '';
  }

  // Carrega novo conteúdo
  let newContent = '';
  if (route.url) {
    newContent = await loadContent(route.url);
  }

  if (newContent && mainContent) {
    mainContent.innerHTML = newContent;
  }

  // Atualiza estado
  state.currentRoute = path;
  state.expandedCard = null;
  document.title = route.title || 'FOLKKSTAR';
  document.body.classList.toggle('collection-active', path !== '/');

  addGalleryAccessibility(mainContent);
  setupPressEffect();
  
  // CORREÇÃO: Só faz scroll para navegações normais, não na inicialização
  if (!skipTransition) {
    scrollToTop();
  }

  // Atualiza histórico
  if (replaceState) {
    history.replaceState({ path }, '', path);
  } else if (path !== history.state?.path) {
    history.pushState({ path }, '', path);
  }

  // Renderiza playlist se necessário
  if (path === '/playlist') {
    const playlistContainer = mainContent.querySelector(".playlist-container");
    if (playlistContainer) await renderSpotifyPlaylist(playlistContainer);
  }

  // CORREÇÃO: Fade in mais suave
  if (!skipTransition) {
    // Pequeno delay para garantir que o conteúdo foi renderizado
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  
  batchVisibility({ contentOpacity: '1', contentPointerEvents: 'auto' });
  state.isLoading = false;
}