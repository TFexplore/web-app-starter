export const elements = {};

export function initializeDOMElements() {
    elements.authPage = document.getElementById('auth-page');
    elements.mainPage = document.getElementById('main-page');
    elements.authForm = document.getElementById('auth-form');
    elements.usernameInput = document.getElementById('username');
    elements.passwordInput = document.getElementById('password');
    elements.loginBtn = document.getElementById('login-btn');
    elements.registerBtn = document.getElementById('register-btn');
    elements.authMessage = document.getElementById('auth-message');
    elements.logoutBtn = document.getElementById('logout-btn');
    elements.themeToggleBtn = document.getElementById('theme-toggle-btn');

    elements.tabsContainer = elements.mainPage ? elements.mainPage.querySelector('.tabs') : null;
    elements.appListContainer = elements.mainPage ? elements.mainPage.querySelector('.app-list') : null;
    elements.addAppBtn = document.getElementById('add-app-btn');
    elements.appForm = document.getElementById('app-form');
    elements.appIdInput = document.getElementById('app-id');
    elements.appNameInput = document.getElementById('app-name');
    elements.appUrlInput = document.getElementById('app-url');
    elements.appNotesInput = document.getElementById('app-notes');
    elements.appCategoryInput = document.getElementById('app-category');
    elements.cancelAppBtn = document.getElementById('cancel-app-btn');

    elements.appModal = document.getElementById('app-modal');
    elements.closeModalBtn = elements.appModal ? elements.appModal.querySelector('.close-button') : null;

    elements.memoListContainer = elements.mainPage ? elements.mainPage.querySelector('.memo-list') : null;
    elements.addMemoBtn = document.getElementById('add-memo-btn');
    elements.memoForm = document.getElementById('memo-form');
    elements.memoIdInput = document.getElementById('memo-id');
    elements.memoContentInput = document.getElementById('memo-content');
    elements.cancelMemoBtn = document.getElementById('cancel-memo-btn');
    elements.memoFormTitle = document.getElementById('memo-form-title'); // 新增备忘录表单标题
}
