// ui.js
import { state, routes } from './state.js';

const htmlEl = document.documentElement;
const mainHeader = document.getElementById('main-header');
const mainContent = document.getElementById('main-content');
const collectionsDropbtn = document.getElementById('collections-dropbtn');
const collectionsDropdown = document.getElementById('collectionsDropdown');

export function rAFUpdate(fn) {
  requestAnimationFrame(fn);
}

export function applyTheme(theme) {
  htmlEl.setAttribute('data-theme', theme);
  try {
    localStorage.setItem('theme', theme);
  } catch (e) {
    console.error('Failed to save theme preference:', e);
  }
}

export function autoThemeByTime() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const brasiliaOffset = -3;
  const brasiliaHour = new Date(utc + 3600000 * brasiliaOffset).getHours();
  if (brasiliaHour >= 18 || brasiliaHour < 7) {
    applyTheme('dark');
  } else {
    applyTheme('light');
  }
}

export function setupPressEffect() {
  const PRESS_DURATION = 180;
  const interactiveElements = document.querySelectorAll('.dropbtn, .gallery-card, .play-button, .spa-link');
  if (state.isTouchDevice) document.body.classList.add('touch-device');
  interactiveElements.forEach(el => {
    const handlePress = () => {
      el.classList.add('press-feedback');
      setTimeout(() => el.classList.remove('press-feedback'), PRESS_DURATION);
    };
    el.addEventListener('mousedown', handlePress);
    el.addEventListener('touchstart', handlePress, { passive: true });
  });
}

export function batchVisibility({ headerOpacity, contentOpacity, headerPointerEvents, contentPointerEvents }) {
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

export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function hideAllDropdowns() {
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

export function showCollectionsDropdown() {
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

export function addGalleryAccessibility(root = document) {
  const cards = root.querySelectorAll('.gallery-card');
  cards.forEach(card => {
    if (!card.hasAttribute('tabindex')) card.setAttribute('tabindex', '0');
    if (!card.hasAttribute('role')) card.setAttribute('role', 'button');
    card.setAttribute('aria-pressed', 'false');
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
  } catch (error) {
    console.error('Error preloading images from', url, error);
  }
}

export function toggleImageExpansion(card) {
  if (!card) return;
  const galleryGrid = card.closest('.gallery-grid');
  const flash = card.querySelector('.gallery-flash-overlay');
  if (flash) {
    flash.classList.add('active');
    setTimeout(() => flash.classList.remove('active'), 200);
  }
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
