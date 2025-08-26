function getToken() {
    return localStorage.getItem('token');
}

function removeToken() {
    localStorage.removeItem('token');
}

export async function fetchData(url, method = 'GET', body = null) {
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

export async function login(username, password) {
    const data = await fetchData(`/api/auth/login`, 'POST', { username, password });
    localStorage.setItem('token', data.token);
    return data;
}

export async function register(username, password) {
    return await fetchData(`/api/auth/register`, 'POST', { username, password });
}

export function logout() {
    removeToken();
}

export async function getApplications() {
    return await fetchData('/api/apps');
}

export async function addApplication(app) {
    return await fetchData('/api/apps', 'POST', app);
}

export async function updateApplication(id, app) {
    return await fetchData(`/api/apps/${id}`, 'PUT', app);
}

export async function deleteApplication(id) {
    return await fetchData(`/api/apps/${id}`, 'DELETE');
}

export async function getMemos() {
    return await fetchData('/api/memos');
}

export async function addMemo(memo) {
    return await fetchData('/api/memos', 'POST', memo);
}

export async function updateMemo(id, memo) {
    return await fetchData(`/api/memos/${id}`, 'PUT', memo);
}

export async function deleteMemo(id) {
    return await fetchData(`/api/memos/${id}`, 'DELETE');
}

export function checkAuth() {
    return getToken() !== null;
}
