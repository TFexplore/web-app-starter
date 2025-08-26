import { initializeDOMElements } from './domElements.js';
import { setupAuthListeners, checkAuthAndLoadContent } from './auth.js';
import { setupApplicationListeners } from './applications.js';
import { setupMemoListeners } from './memos.js';
import { initializeTheme } from './theme.js';

document.addEventListener('DOMContentLoaded', () => {
    initializeDOMElements();
    setupAuthListeners();
    setupApplicationListeners();
    setupMemoListeners();
    initializeTheme();
    checkAuthAndLoadContent();
});
