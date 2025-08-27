const fs = require('fs');
const path = require('path');

// 手动加载 .env 文件
const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
            const parts = trimmedLine.split('=');
            if (parts.length === 2) {
                const key = parts[0].trim();
                const value = parts[1].trim().replace(/^"|"$/g, ''); // 移除双引号
                process.env[key] = value;
            }
        }
    });
}

const express = require('express');

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
