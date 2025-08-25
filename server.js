const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// 中间件
app.use(express.json()); // 用于解析 JSON 格式的请求体
app.use(express.urlencoded({ extended: true })); // 用于解析 URL-encoded 格式的请求体

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));

// 根路由，提供前端页面
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 导入路由
const authRoutes = require('./routes/auth');
const applicationRoutes = require('./routes/applications');
const memoRoutes = require('./routes/memos');

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/apps', applicationRoutes);
app.use('/api/memos', memoRoutes);

// 启动服务器
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
