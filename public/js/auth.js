import { login, register, logout, checkAuth } from './api.js';
import { elements } from './domElements.js';
import { loadApplications } from './applications.js';
import { loadMemos } from './memos.js';

export function showPage(pageId) {
    if (pageId === 'auth') {
        elements.authPage.style.display = 'block';
        elements.mainPage.style.display = 'none';
    } else {
        elements.authPage.style.display = 'none';
        elements.mainPage.style.display = 'block';
    }
}

export async function handleAuth(endpoint) {
    const username = elements.usernameInput.value;
    const password = elements.passwordInput.value;

    try {
        let data;
        if (endpoint === 'login') {
            data = await login(username, password);
        } else {
            data = await register(username, password);
        }
        elements.authMessage.textContent = data.message;
        elements.authMessage.style.color = 'green';
        if (endpoint === 'login') {
            await checkAuthAndLoadContent();
        }
    } catch (error) {
        elements.authMessage.textContent = error.message;
        elements.authMessage.style.color = 'red';
    }
}

export function setupAuthListeners() {
    elements.loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        handleAuth('login');
    });

    elements.registerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        handleAuth('register');
    });

    elements.logoutBtn.addEventListener('click', () => {
        logout();
        showPage('auth');
        elements.usernameInput.value = '';
        elements.passwordInput.value = '';
        elements.authMessage.textContent = '';
    });
}

export async function checkAuthAndLoadContent() {
    if (checkAuth()) {
        showPage('main');
        await loadApplications();
        await loadMemos();
    } else {
        showPage('auth');
    }
}
