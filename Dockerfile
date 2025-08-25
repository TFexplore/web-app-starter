# 使用官方 Node.js 18 LTS 镜像作为基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 将 package.json 和 package-lock.json 复制到工作目录
# 这样可以利用 Docker 缓存，如果依赖没有变化，则不会重新安装
COPY package*.json ./

# 安装项目依赖
RUN npm install
# 全局安装 PM2
RUN npm install -g pm2

# 将所有项目文件复制到工作目录
COPY . .

# 暴露应用运行的端口
# 默认是 3000，但可以通过环境变量 PORT 覆盖
EXPOSE 3000

# 定义容器启动时执行的命令，使用 PM2 启动 server.js
CMD ["pm2-runtime", "server.js"]
