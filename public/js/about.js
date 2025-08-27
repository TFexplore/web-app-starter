document.addEventListener('DOMContentLoaded', () => {
    const backToMainBtn = document.getElementById('back-to-main-btn');
    if (backToMainBtn) {
        backToMainBtn.addEventListener('click', () => {
            window.location.href = '/index.html';
        });
    }
});
