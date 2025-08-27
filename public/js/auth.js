import { login, register, logout, checkAuth } from './api.js';
import { elements } from './domElements.js';
import { loadApplications } from './applications.js';
import { loadMemos } from './memos.js';

export function showPage(pageId) {
    if (pageId === 'auth') {
        elements.authPage.style.display = 'block';
        elements.mainPage.style.display = 'none';
        // 每次进入认证页面时，默认隐藏用户名输入框并移除required属性
        elements.usernameInput.style.display = 'none';
        elements.usernameInput.required = false;
        elements.emailInput.style.display = 'block'; // 确保邮箱输入框可见
    } else {
        elements.authPage.style.display = 'none';
        elements.mainPage.style.display = 'block';
    }
}

export async function handleAuth(endpoint) {
    const username = elements.usernameInput.value;
    const email = elements.emailInput.value;
    const password = elements.passwordInput.value;

   

    try {
        let data;
        if (endpoint === 'login') {
             console.log(`Attempting to ${endpoint} with email: ${email}, password: ${password}, username: ${username}`);
            data = await login(email, password);
        } else {
            
            data = await register(username, email, password);
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
    elements.loginBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        elements.usernameInput.style.display = 'none'; // 登录时隐藏用户名
        elements.usernameInput.required = false; // 登录时移除required属性
        elements.emailInput.style.display = 'block'; // 登录时显示邮箱
        await handleAuth('login');
    });

    elements.registerBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        elements.usernameInput.style.display = 'block'; // 注册时显示用户名
        elements.usernameInput.required = true; // 注册时恢复required属性
        elements.emailInput.style.display = 'block'; // 注册时显示邮箱
        await handleAuth('register');
    });

    elements.logoutBtn.addEventListener('click', () => {
        logout();
        showPage('auth');
        elements.usernameInput.value = '';
        elements.emailInput.value = '';
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
