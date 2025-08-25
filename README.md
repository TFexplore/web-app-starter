# Web 应用启动器与备忘录管理系统设计文档

## 1. 项目概述

本项目旨在开发一个前后端一体的 Web 应用，提供一个便捷的网站应用启动器和个人备忘录管理功能。用户可以添加、管理其常用的网站应用，并按分类进行组织。同时，系统提供一个独立的备忘录功能，方便用户记录重要信息。为了确保数据安全，系统将包含用户登录认证功能。整个应用将尽可能保持简洁和易用。

## 2. 技术栈

*   **后端**: Node.js (使用 Express.js 框架)
*   **数据库**: SQLite3
*   **前端**: HTML, CSS, JavaScript (可能使用 EJS 或 Pug 作为模板引擎，以实现前后端一体化)
*   **认证**: JWT (JSON Web Tokens) 或 Express Session

## 3. 数据库设计

### 3.1. 用户 (User) 表

| 字段名     | 类型     | 描述         |
| :--------- | :------- | :----------- |
| `_id`      | ObjectId | 用户唯一标识 |
| `username` | String   | 用户名 (唯一) |
| `password` | String   | 密码 (哈希存储) |

### 3.2. 应用 (Application) 表

| 字段名     | 类型     | 描述         |
| :--------- | :------- | :----------- |
| `_id`      | ObjectId | 应用唯一标识 |
| `userId`   | ObjectId | 所属用户 ID  |
| `name`     | String   | 应用名称     |
| `url`      | String   | 应用 URL     |
| `notes`    | String   | 备注         |
| `category` | String   | Tab 分类     |

### 3.3. 备忘录 (Memo) 表

| 字段名      | 类型     | 描述         |
| :---------- | :------- | :----------- |
| `_id`       | ObjectId | 备忘录唯一标识 |
| `userId`    | ObjectId | 所属用户 ID  |
| `content`   | String   | 备忘录内容   |
| `createdAt` | Date     | 创建时间     |

## 4. API 设计

### 4.1. 用户认证

*   **注册**: `POST /api/auth/register`
    *   请求体: `{ username, password }`
    *   响应: `{ message: "User registered successfully" }` 或错误信息
*   **登录**: `POST /api/auth/login`
    *   请求体: `{ username, password }`
    *   响应: `{ token: "...", userId: "..." }` 或错误信息

### 4.2. 应用管理

*   **获取所有应用**: `GET /api/apps`
    *   请求头: `Authorization: Bearer <token>`
    *   响应: `[ { _id, name, url, notes, category }, ... ]`
*   **添加应用**: `POST /api/apps`
    *   请求头: `Authorization: Bearer <token>`
    *   请求体: `{ name, url, notes, category }`
    *   响应: `{ _id, name, url, notes, category }`
*   **更新应用**: `PUT /api/apps/:id`
    *   请求头: `Authorization: Bearer <token>`
    *   请求体: `{ name, url, notes, category }` (部分更新)
    *   响应: `{ message: "Application updated successfully" }`
*   **删除应用**: `DELETE /api/apps/:id`
    *   请求头: `Authorization: Bearer <token>`
    *   响应: `{ message: "Application deleted successfully" }`

### 4.3. 备忘录管理

*   **获取所有备忘录**: `GET /api/memos`
    *   请求头: `Authorization: Bearer <token>`
    *   响应: `[ { _id, content, createdAt }, ... ]`
*   **添加备忘录**: `POST /api/memos`
    *   请求头: `Authorization: Bearer <token>`
    *   请求体: `{ content }`
    *   响应: `{ _id, content, createdAt }`
*   **更新备忘录**: `PUT /api/memos/:id`
    *   请求头: `Authorization: Bearer <token>`
    *   请求体: `{ content }`
    *   响应: `{ message: "Memo updated successfully" }`
*   **删除备忘录**: `DELETE /api/memos/:id`
    *   请求头: `Authorization: Bearer <token>`
    *   响应: `{ message: "Memo deleted successfully" }`

## 5. 前端界面设计

*   **登录/注册页面**: 简单的表单，用于用户认证。
*   **主页面**:
    *   **布局**: 两栏布局。
        *   **左侧 (80%)**: 应用管理区域。
            *   顶部导航栏显示应用分类 (Tab)。
            *   下方显示当前选中分类下的应用列表。
            *   提供添加新应用、编辑、删除应用的功能。
        *   **右侧 (20%)**: 备忘录列表区域。
            *   显示用户的所有备忘录。
            *   提供添加新备忘录、编辑、删除备忘录的功能。

## 6. 部署

考虑到简单性，可以部署在单个服务器上，Node.js 应用作为后端服务，同时提供静态前端文件。
