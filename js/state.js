// state.js - Correção
export const state = {
  currentRoute: null,
  isLoading: false,
  expandedCard: null,
  preloadedImages: new Set(),
  coverCache: new Map(),
  isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0
};

export const routes = {
  // CORREÇÃO: Define uma URL específica para a home ou null se o conteúdo já estiver no HTML
  '/': { title: 'FOLKKSTAR', url: 'home.html' }, // ou 'home.html' se você tiver um arquivo específico
  '/arquivo': { title: 'Arquivo - 2019-2025 - FOLKKSTAR', url: 'arquivo.html' },
  '/colecao-1': { title: 'Coleção 1 - 2020 - FOLKKSTAR', url: 'colecao-1.html' },
  '/ghost-hardware': { title: 'Ghost Hardware - 2021 - FOLKKSTAR', url: 'ghost-hardware.html' },
  '/death-deluxe': { title: 'Death Deluxe - Em Breve - FOLKKSTAR', url: 'death-deluxe.html' },
  '/sobre': { title: 'Sobre - FOLKKSTAR', url: 'sobre.html' },
  '/playlist': { title: 'Playlist - FOLKKSTAR', url: 'playlist.html' }
};