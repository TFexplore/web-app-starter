import { getApplications, addApplication, updateApplication, deleteApplication } from './api.js';
import { elements } from './domElements.js';
import { showPage } from './auth.js';

let currentCategory = '所有'; // 默认显示所有分类
let allApplications = [];
let currentLayout = localStorage.getItem('appLayout') || 'list'; // 'list' or 'grid'

export async function loadApplications() {
    try {
        allApplications = await getApplications();
        renderApplications();
        renderCategories();
        // 根据保存的布局设置tabsContainer的显示状态
        if (elements.tabsContainer) {
            elements.tabsContainer.style.display = currentLayout === 'grid' ? 'none' : 'flex';
        }
    } catch (error) {
        console.error('Error loading applications:', error);
        if (error.message === 'Authentication token required' || error.message === 'Invalid or expired token') {
            localStorage.removeItem('token'); // 移除无效token
            showPage('auth');
        }
    }
}

function renderCategories() {
    if (!elements.tabsContainer) return; // 确保元素存在

    const categories = new Set(['所有']);
    allApplications.forEach(app => categories.add(app.category));

    elements.tabsContainer.innerHTML = '';
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
            elements.tabsContainer.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
        elements.tabsContainer.appendChild(button);
    });
}

function renderApplications() {
    if (!elements.appListContainer) return;

    elements.appListContainer.innerHTML = '';
    elements.appListContainer.classList.remove('grid-layout'); // 移除旧的布局类

    if (currentLayout === 'grid') {
        elements.appListContainer.classList.add('grid-layout');
        renderGridLayout();
    } else {
        renderListLayout();
    }

    // 重新绑定事件监听器
    elements.appListContainer.querySelectorAll('.edit-app-btn').forEach(button => {
        button.addEventListener('click', (e) => editApplication(e.currentTarget.dataset.id));
    });
    elements.appListContainer.querySelectorAll('.delete-app-btn').forEach(button => {
        button.addEventListener('click', (e) => deleteApplicationHandler(e.target.dataset.id));
    });
}

function renderListLayout() {
    const filteredApps = currentCategory === '所有' ? allApplications : allApplications.filter(app => app.category === currentCategory);

    if (filteredApps.length === 0) {
        elements.appListContainer.innerHTML = '<p>没有找到应用。</p>';
        return;
    }

    filteredApps.forEach(app => {
        const appItem = document.createElement('div');
        appItem.classList.add('app-item');
        appItem.innerHTML = `
            <div class="app-item-header">
                <a href="${app.url}" target="_blank">${app.name}</a>
                <div class="actions">
                    <button data-id="${app.id}" class="edit-app-btn icon-btn edit-btn" title="编辑"><span class="edit-icon">&#9998;</span></button>
                    <button data-id="${app.id}" class="delete-app-btn icon-btn delete-btn" title="删除">&#128465;</button>
                </div>
            </div>
            <div class="app-item-content">
                <p>${app.notes ? `(${app.notes})` : ''}</p>
            </div>
        `;
        elements.appListContainer.appendChild(appItem);
    });
}

function renderGridLayout() {
    const groupedApps = allApplications.reduce((acc, app) => {
        if (!acc[app.category]) {
            acc[app.category] = [];
        }
        acc[app.category].push(app);
        return acc;
    }, {});

    if (Object.keys(groupedApps).length === 0) {
        elements.appListContainer.innerHTML = '<p>没有找到应用。</p>';
        return;
    }

    for (const category in groupedApps) {
        const groupContainer = document.createElement('div');
        groupContainer.classList.add('app-category-group');

        const title = document.createElement('h3');
        title.textContent = category;
        groupContainer.appendChild(title);

        const appsContainer = document.createElement('div');
        appsContainer.classList.add('apps-container');

        groupedApps[category].forEach(app => {
            const appItem = document.createElement('div');
            appItem.classList.add('app-item');
            appItem.innerHTML = `
                <div class="app-item-header">
                    <a href="${app.url}" target="_blank">${app.name}</a>
                    <div class="actions">
                        <button data-id="${app.id}" class="edit-app-btn icon-btn edit-btn" title="编辑"><span class="edit-icon">&#9998;</span></button>
                        <button data-id="${app.id}" class="delete-app-btn icon-btn delete-btn" title="删除">&#128465;</button>
                    </div>
                </div>
                <div class="app-item-content">
                    <p>${app.notes ? `(${app.notes})` : ''}</p>
                </div>
            `;
            appsContainer.appendChild(appItem);
        });
        groupContainer.appendChild(appsContainer);
        elements.appListContainer.appendChild(groupContainer);
    }
}

function openAppModal(app = null) {
    if (!elements.appModal) return; // 确保元素存在

    elements.appModal.style.display = 'flex';
    const categoryList = document.getElementById('category-list');
    if (categoryList) {
        categoryList.innerHTML = ''; // 清空datalist

        const categories = new Set();
        allApplications.forEach(appItem => categories.add(appItem.category));
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            categoryList.appendChild(option);
        });
    }


    if (app) {
        elements.appIdInput.value = app.id;
        elements.appNameInput.value = app.name;
        elements.appUrlInput.value = app.url;
        elements.appNotesInput.value = app.notes;
        elements.appCategoryInput.value = app.category;
    } else {
        elements.appIdInput.value = '';
        elements.appNameInput.value = '';
        elements.appUrlInput.value = '';
        elements.appNotesInput.value = '';
        // 如果当前分类不是“所有”，则自动填充
        if (currentCategory !== '所有') {
            elements.appCategoryInput.value = currentCategory;
        } else {
            elements.appCategoryInput.value = '';
        }
    }
}

function closeAppModal() {
    if (elements.appModal) { // 确保元素存在
        elements.appModal.style.display = 'none';
    }
}

async function editApplication(id) {
    const app = allApplications.find(a => a.id == id);
    if (app) {
        openAppModal(app);
    }
}

async function deleteApplicationHandler(id) {
    if (confirm('确定要删除此应用吗？')) {
        try {
            await deleteApplication(id);
            loadApplications();
        } catch (error) {
            alert('删除失败: ' + error.message);
        }
    }
}

export function setupApplicationListeners() {
    const toggleLayoutBtn = document.getElementById('toggle-layout-btn');
    if (toggleLayoutBtn) {
        toggleLayoutBtn.addEventListener('click', () => {
            currentLayout = currentLayout === 'list' ? 'grid' : 'list';
            localStorage.setItem('appLayout', currentLayout); // 保存布局到 localStorage
            // 切换布局时，如果当前是网格布局，则隐藏分类标签
            if (elements.tabsContainer) {
                elements.tabsContainer.style.display = currentLayout === 'grid' ? 'none' : 'flex';
            }
            renderApplications();
        });
    }

    if (elements.addAppBtn) {
        elements.addAppBtn.addEventListener('click', () => openAppModal());
    }
    if (elements.closeModalBtn) {
        elements.closeModalBtn.addEventListener('click', closeAppModal);
    }
    if (elements.cancelAppBtn) {
        elements.cancelAppBtn.addEventListener('click', closeAppModal);
    }

    // 当用户点击模态框外部时关闭
    window.addEventListener('click', (event) => {
        if (elements.appModal && event.target == elements.appModal) {
            closeAppModal();
        }
    });

    if (elements.appForm) {
        elements.appForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = elements.appIdInput.value;
            const name = elements.appNameInput.value;
            const url = elements.appUrlInput.value;
            const notes = elements.appNotesInput.value;
            const category = elements.appCategoryInput.value;

            try {
                if (id) {
                    await updateApplication(id, { name, url, notes, category });
                } else {
                    await addApplication({ name, url, notes, category });
                }
                closeAppModal();
                loadApplications();
            } catch (error) {
                alert('操作失败: ' + error.message);
            }
        });
    }
}
