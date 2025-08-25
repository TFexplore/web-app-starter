document.addEventListener('DOMContentLoaded', () => {
    const authPage = document.getElementById('auth-page');
    const mainPage = document.getElementById('main-page');
    const authForm = document.getElementById('auth-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const authMessage = document.getElementById('auth-message');
    const logoutBtn = document.getElementById('logout-btn');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');

    const tabsContainer = mainPage.querySelector('.tabs');
    const appListContainer = mainPage.querySelector('.app-list');
    const addAppBtn = document.getElementById('add-app-btn');
    const appForm = document.getElementById('app-form');
    const appIdInput = document.getElementById('app-id');
    const appNameInput = document.getElementById('app-name');
    const appUrlInput = document.getElementById('app-url');
    const appNotesInput = document.getElementById('app-notes');
    const appCategoryInput = document.getElementById('app-category');
    const cancelAppBtn = document.getElementById('cancel-app-btn');

    const appModal = document.getElementById('app-modal');
    const closeModalBtn = appModal.querySelector('.close-button');

    const memoListContainer = mainPage.querySelector('.memo-list');
    const addMemoBtn = document.getElementById('add-memo-btn');
    const memoForm = document.getElementById('memo-form');
    const memoIdInput = document.getElementById('memo-id');
    const memoContentInput = document.getElementById('memo-content');
    const cancelMemoBtn = document.getElementById('cancel-memo-btn');

    let editingMemoId = null; // 用于跟踪当前正在编辑的备忘录ID

    let currentCategory = '所有'; // 默认显示所有分类
    let allApplications = [];
    let allMemos = [];

    // --- 辅助函数 ---
    function showPage(pageId) {
        if (pageId === 'auth') {
            authPage.style.display = 'block';
            mainPage.style.display = 'none';
        } else {
            authPage.style.display = 'none';
            mainPage.style.display = 'block';
        }
    }

    function getToken() {
        return localStorage.getItem('token');
    }

    function setToken(token) {
        localStorage.setItem('token', token);
    }

    function removeToken() {
        localStorage.removeItem('token');
    }

    async function fetchData(url, method = 'GET', body = null) {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
        };
        const options = { method, headers };
        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Something went wrong');
        }
        return response.json();
    }

    // --- 认证相关 ---
    async function handleAuth(endpoint) {
        const username = usernameInput.value;
        const password = passwordInput.value;

        try {
            const data = await fetchData(`/api/auth/${endpoint}`, 'POST', { username, password });
            authMessage.textContent = data.message;
            authMessage.style.color = 'green';
            if (endpoint === 'login') {
                setToken(data.token);
                checkAuthAndLoadContent();
            }
        } catch (error) {
            authMessage.textContent = error.message;
            authMessage.style.color = 'red';
        }
    }

    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        handleAuth('login');
    });

    registerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        handleAuth('register');
    });

    logoutBtn.addEventListener('click', () => {
        removeToken();
        showPage('auth');
        usernameInput.value = '';
        passwordInput.value = '';
        authMessage.textContent = '';
    });

    // --- 应用管理 ---
    async function loadApplications() {
        try {
            allApplications = await fetchData('/api/apps');
            renderApplications();
            renderCategories();
        } catch (error) {
            console.error('Error loading applications:', error);
            if (error.message === 'Authentication token required' || error.message === 'Invalid or expired token') {
                removeToken();
                showPage('auth');
            }
        }
    }

    function renderCategories() {
        const categories = new Set(['所有']);
        allApplications.forEach(app => categories.add(app.category));

        tabsContainer.innerHTML = '';
        categories.forEach(category => {
            const button = document.createElement('button');
            button.classList.add('tab-button');
            button.textContent = category;
            if (category === currentCategory) {
                button.classList.add('active');
            }
            button.addEventListener('click', () => {
                currentCategory = category;
                renderApplications();
                tabsContainer.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            });
            tabsContainer.appendChild(button);
        });
    }

    function renderApplications() {
        appListContainer.innerHTML = '';
        const filteredApps = currentCategory === '所有' ? allApplications : allApplications.filter(app => app.category === currentCategory);

        if (filteredApps.length === 0) {
            appListContainer.innerHTML = '<p>没有找到应用。</p>';
            return;
        }

        filteredApps.forEach(app => {
            const appItem = document.createElement('div');
            appItem.classList.add('app-item');
            appItem.innerHTML = `
                <div>
                    <a href="${app.url}" target="_blank">${app.name}</a>
                    <p>${app.notes ? `(${app.notes})` : ''}</p>
                </div>
                <div class="actions">
                    <button data-id="${app.id}" class="edit-app-btn">编辑</button>
                    <button data-id="${app.id}" class="delete-app-btn">删除</button>
                </div>
            `;
            appListContainer.appendChild(appItem);
        });

        appListContainer.querySelectorAll('.edit-app-btn').forEach(button => {
            button.addEventListener('click', (e) => editApplication(e.target.dataset.id));
        });
        appListContainer.querySelectorAll('.delete-app-btn').forEach(button => {
            button.addEventListener('click', (e) => deleteApplication(e.target.dataset.id));
        });
    }

    function openAppModal(app = null) {
        appModal.style.display = 'flex';
        if (app) {
            appIdInput.value = app.id;
            appNameInput.value = app.name;
            appUrlInput.value = app.url;
            appNotesInput.value = app.notes;
            appCategoryInput.value = app.category;
        } else {
            appIdInput.value = '';
            appNameInput.value = '';
            appUrlInput.value = '';
            appNotesInput.value = '';
            appCategoryInput.value = '';
        }
    }

    function closeAppModal() {
        appModal.style.display = 'none';
    }

    addAppBtn.addEventListener('click', () => openAppModal());

    closeModalBtn.addEventListener('click', closeAppModal);
    cancelAppBtn.addEventListener('click', closeAppModal);

    // 当用户点击模态框外部时关闭
    window.addEventListener('click', (event) => {
        if (event.target == appModal) {
            closeAppModal();
        }
    });

    appForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = appIdInput.value;
        const name = appNameInput.value;
        const url = appUrlInput.value;
        const notes = appNotesInput.value;
        const category = appCategoryInput.value;

        try {
            if (id) {
                await fetchData(`/api/apps/${id}`, 'PUT', { name, url, notes, category });
            } else {
                await fetchData('/api/apps', 'POST', { name, url, notes, category });
            }
            closeAppModal();
            loadApplications();
        } catch (error) {
            alert('操作失败: ' + error.message);
        }
    });

    async function editApplication(id) {
        const app = allApplications.find(a => a.id == id);
        if (app) {
            openAppModal(app);
        }
    }

    async function deleteApplication(id) {
        if (confirm('确定要删除此应用吗？')) {
            try {
                await fetchData(`/api/apps/${id}`, 'DELETE');
                loadApplications();
            } catch (error) {
                alert('删除失败: ' + error.message);
            }
        }
    }

    // --- 备忘录管理 ---
    async function loadMemos() {
        try {
            allMemos = await fetchData('/api/memos');
            renderMemos();
        } catch (error) {
            console.error('Error loading memos:', error);
            if (error.message === 'Authentication token required' || error.message === 'Invalid or expired token') {
                removeToken();
                showPage('auth');
            }
        }
    }

    function renderMemos() {
        memoListContainer.innerHTML = '';
        if (allMemos.length === 0) {
            memoListContainer.innerHTML = '<p>没有备忘录。</p>';
            return;
        }

        allMemos.forEach(memo => {
            const memoItem = document.createElement('div');
            memoItem.classList.add('memo-item');
            memoItem.dataset.id = memo.id; // 添加data-id以便查找

            memoItem.innerHTML = `
                <div class="memo-display">
                    <p>${memo.content}</p>
                    <small>${new Date(memo.createdAt).toLocaleString()}</small>
                </div>
                <div class="memo-edit" style="display: none;">
                    <textarea class="edit-memo-content">${memo.content}</textarea>
                    <div class="actions">
                        <button data-id="${memo.id}" class="save-memo-btn">保存</button>
                        <button data-id="${memo.id}" class="cancel-edit-memo-btn">取消</button>
                    </div>
                </div>
                <div class="actions memo-actions-display">
                    <button data-id="${memo.id}" class="edit-memo-btn">编辑</button>
                    <button data-id="${memo.id}" class="delete-memo-btn">删除</button>
                </div>
            `;
            memoListContainer.appendChild(memoItem);
        });

        memoListContainer.querySelectorAll('.edit-memo-btn').forEach(button => {
            button.addEventListener('click', (e) => toggleEditMemo(e.target.dataset.id, true));
        });
        memoListContainer.querySelectorAll('.delete-memo-btn').forEach(button => {
            button.addEventListener('click', (e) => deleteMemo(e.target.dataset.id));
        });
        memoListContainer.querySelectorAll('.save-memo-btn').forEach(button => {
            button.addEventListener('click', (e) => saveEditedMemo(e.target.dataset.id));
        });
        memoListContainer.querySelectorAll('.cancel-edit-memo-btn').forEach(button => {
            button.addEventListener('click', (e) => toggleEditMemo(e.target.dataset.id, false));
        });
    }

    function toggleEditMemo(id, isEditing) {
        const memoItem = memoListContainer.querySelector(`.memo-item[data-id="${id}"]`);
        if (!memoItem) return;

        const memoDisplay = memoItem.querySelector('.memo-display');
        const memoEdit = memoItem.querySelector('.memo-edit');
        const memoActionsDisplay = memoItem.querySelector('.memo-actions-display');
        const editMemoContentInput = memoItem.querySelector('.edit-memo-content');

        if (isEditing) {
            memoDisplay.style.display = 'none';
            memoActionsDisplay.style.display = 'none';
            memoEdit.style.display = 'flex';
            editMemoContentInput.value = allMemos.find(m => m.id == id).content; // 确保编辑框内容最新
            editMemoContentInput.focus();
        } else {
            memoDisplay.style.display = 'block';
            memoActionsDisplay.style.display = 'flex';
            memoEdit.style.display = 'none';
        }
    }

    async function saveEditedMemo(id) {
        const memoItem = memoListContainer.querySelector(`.memo-item[data-id="${id}"]`);
        if (!memoItem) return;

        const newContent = memoItem.querySelector('.edit-memo-content').value;
        try {
            await fetchData(`/api/memos/${id}`, 'PUT', { content: newContent });
            loadMemos(); // 重新加载备忘录以更新显示
        } catch (error) {
            alert('更新备忘录失败: ' + error.message);
        }
    }

    addMemoBtn.addEventListener('click', () => {
        memoForm.style.display = 'block';
        memoIdInput.value = '';
        memoContentInput.value = '';
        memoContentInput.focus();
    });

    cancelMemoBtn.addEventListener('click', () => {
        memoForm.style.display = 'none';
    });

    memoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = memoIdInput.value;
        const content = memoContentInput.value;

        try {
            if (id) { // 编辑现有备忘录
                await fetchData(`/api/memos/${id}`, 'PUT', { content });
            } else { // 添加新备忘录
                await fetchData('/api/memos', 'POST', { content });
            }
            memoForm.style.display = 'none';
            loadMemos();
        } catch (error) {
            alert('操作失败: ' + error.message);
        }
    });

    async function deleteMemo(id) {
        if (confirm('确定要删除此备忘录吗？')) {
            try {
                await fetchData(`/api/memos/${id}`, 'DELETE');
                loadMemos();
            } catch (error) {
                alert('删除失败: ' + error.message);
            }
        }
    }

    // --- 初始化 ---
    async function checkAuthAndLoadContent() {
        const token = getToken();
        if (token) {
            showPage('main');
            await loadApplications();
            await loadMemos();
        } else {
            showPage('auth');
        }
    }

    // --- 主题切换功能 ---
    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }

    function toggleTheme() {
        const currentTheme = localStorage.getItem('theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    }

    // 页面加载时应用保存的主题
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);

    // 监听主题切换按钮点击事件
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }

    checkAuthAndLoadContent();
});
