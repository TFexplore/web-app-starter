import { getMemos, addMemo, updateMemo, deleteMemo } from './api.js';
import { elements } from './domElements.js';
import { showPage } from './auth.js';

let allMemos = [];

export async function loadMemos() {
    try {
        allMemos = await getMemos();
        renderMemos();
    } catch (error) {
        console.error('Error loading memos:', error);
        if (error.message === 'Authentication token required' || error.message === 'Invalid or expired token') {
            localStorage.removeItem('token'); // 移除无效token
            showPage('auth');
        }
    }
}

function renderMemos() {
    if (!elements.memoListContainer) return; // 确保元素存在

    elements.memoListContainer.innerHTML = '';
    if (allMemos.length === 0) {
        elements.memoListContainer.innerHTML = '<p>没有备忘录。</p>';
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
            <div class="actions memo-actions-display">
                <button data-id="${memo.id}" class="edit-memo-btn icon-btn edit-btn" title="编辑"><span class="edit-icon">&#9998;</span></button>
                <button data-id="${memo.id}" class="delete-memo-btn icon-btn delete-btn" title="删除"><span class="delete-icon">&#128465;</span></button>
            </div>
        `;
        elements.memoListContainer.appendChild(memoItem);
    });

    elements.memoListContainer.querySelectorAll('.edit-memo-btn').forEach(button => {
        button.addEventListener('click', (e) => toggleEditMemo(e.target.dataset.id)); // 移除isEditing参数
    });
    elements.memoListContainer.querySelectorAll('.delete-memo-btn').forEach(button => {
        button.addEventListener('click', (e) => deleteMemoHandler(e.target.dataset.id));
    });
}

// 辅助函数：自动调整textarea高度
function autoExpandTextarea(event) {
    const textarea = event.target;
    textarea.style.height = 'auto'; // 重置高度以获取准确的scrollHeight
    textarea.style.height = textarea.scrollHeight + 'px';
}

function toggleEditMemo(id) { // 移除isEditing参数
    if (!elements.memoForm || !elements.memoIdInput || !elements.memoContentInput || !elements.memoFormTitle) return;

    const memoToEdit = allMemos.find(m => m.id == id);
    if (!memoToEdit) return;

    elements.memoFormTitle.textContent = '编辑备忘录';
    elements.memoIdInput.value = memoToEdit.id;
    elements.memoContentInput.value = memoToEdit.content;
    elements.memoForm.style.display = 'block';
    elements.memoContentInput.focus();
    autoExpandTextarea({ target: elements.memoContentInput }); // 初始化编辑框高度
}

async function saveEditedMemo(id) {
    if (!elements.memoListContainer) return; // 确保元素存在

    const memoItem = elements.memoListContainer.querySelector(`.memo-item[data-id="${id}"]`);
    if (!memoItem) return;

    const newContent = memoItem.querySelector('.edit-memo-content').value;
    try {
        await updateMemo(id, { content: newContent });
        loadMemos(); // 重新加载备忘录以更新显示
    } catch (error) {
        alert('更新备忘录失败: ' + error.message);
    }
}

async function deleteMemoHandler(id) {
    if (confirm('确定要删除此备忘录吗？')) {
        try {
            await deleteMemo(id);
            loadMemos();
        } catch (error) {
            alert('删除失败: ' + error.message);
        }
    }
}

export function setupMemoListeners() {
    if (elements.addMemoBtn) {
        elements.addMemoBtn.addEventListener('click', () => {
            if (!elements.memoForm || !elements.memoIdInput || !elements.memoContentInput || !elements.memoFormTitle) return;
            
            elements.memoFormTitle.textContent = '添加新备忘录'; // 设置为新增标题
            elements.memoIdInput.value = '';
            elements.memoContentInput.value = '';
            elements.memoForm.style.display = 'block';
            elements.memoContentInput.focus();
            autoExpandTextarea({ target: elements.memoContentInput }); // 初始化添加备忘录框的高度
        });
    }

    if (elements.cancelMemoBtn) {
        elements.cancelMemoBtn.addEventListener('click', () => {
            if (elements.memoForm) { // 确保元素存在
                elements.memoForm.style.display = 'none';
            }
        });
    }

    if (elements.memoContentInput) { // 为添加/编辑备忘录的textarea添加监听
        elements.memoContentInput.addEventListener('input', autoExpandTextarea);
    }

    if (elements.memoForm) {
        elements.memoForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = elements.memoIdInput.value;
            const content = elements.memoContentInput.value;

            try {
                if (id) { // 编辑现有备忘录
                    await updateMemo(id, { content });
                } else { // 添加新备忘录
                    await addMemo({ content });
                }
                if (elements.memoForm) { // 确保元素存在
                    elements.memoForm.style.display = 'none';
                }
                loadMemos();
            } catch (error) {
                alert('操作失败: ' + error.message);
            }
        });
    }
}
