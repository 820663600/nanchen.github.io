# 企业投诉管理平台 - GitHub Pages 前端部署指南

## 项目简介

本项目是企业投诉管理平台的前端部分，支持通过 GitHub Pages 进行部署，实现前后端分离架构。用户可以通过 GitHub Pages 域名直接访问投诉表单，无需短链生成。

## 联系作者

V：15303185918

## 部署步骤

### 1. 创建 GitHub 仓库

1. 在 GitHub 上创建一个新的仓库（例如：`company-complaint-frontend`）
2. 将本目录下的所有文件上传到仓库的 `main` 或 `gh-pages` 分支

### 2. 启用 GitHub Pages

1. 进入仓库的 Settings 页面
2. 滚动到 "Pages" 部分
3. 在 "Source" 中选择分支（推荐使用 `gh-pages` 分支）
4. 点击 "Save" 保存设置
5. GitHub 将自动生成访问地址（例如：`https://username.github.io/company-complaint-frontend/`）

### 3. 配置自定义域名（可选）

如果需要使用自定义域名：

1. 在仓库根目录创建 `CNAME` 文件
2. 在文件中写入您的域名（例如：`complaint.example.com`）
3. 在域名DNS设置中添加 CNAME 记录指向 `username.github.io`

### 4. 配置后端API地址

编辑 `assets/js/app.js` 文件中的 `API_CONFIG.BASE_URL`：

```javascript
const API_CONFIG = {
    // 修改为您的后端API地址
    BASE_URL: 'https://your-api-domain.com',
    // ...
};
```

### 5. 在后端系统中添加 GitHub Pages 域名

1. 登录后端管理系统
2. 进入"域名管理"页面
3. 启用 GitHub Pages 功能
4. 添加您的 GitHub Pages 域名
5. 创建通道时选择"GitHub Pages域名模式"

## 目录结构

```
github-pages-frontend/
├── index.html              # 主页面
├── assets/
│   ├── css/
│   │   └── style.css      # 样式文件
│   └── js/
│       ├── app.js         # 主应用文件
│       └── router.js      # 路由管理
├── components/
│   ├── ComplaintForm.js   # 投诉表单组件
│   ├── ComplaintDetail.js # 投诉详情组件
│   └── ComplaintNotice.js # 投诉须知组件
├── CNAME                  # 自定义域名配置（可选）
└── README.md             # 说明文档
```

## 功能特性

- **前后端分离**：前端独立部署，通过API与后端通信
- **响应式设计**：支持手机、平板、电脑等多种设备
- **无需短链**：直接使用原始路径访问，提升用户体验
- **组件化架构**：使用Vue.js组件化开发，便于维护
- **图片上传**：支持拖拽上传和多图片预览
- **实时验证**：表单实时验证，提升用户体验

## 技术栈

- **Vue.js 3**：前端框架
- **Axios**：HTTP请求库
- **原生JavaScript**：路由管理
- **CSS3**：样式和动画
- **GitHub Pages**：静态网站托管

## 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 16+
- iOS Safari 11+
- Chrome Android 60+

## 开发说明

### 本地开发

1. 克隆仓库到本地
2. 使用本地服务器运行（如 Python 的 http.server 或 Node.js 的 http-server）
3. 修改 API_CONFIG.BASE_URL 为本地后端地址进行调试

```bash
# 使用 Python 启动本地服务器
python -m http.server 8080

# 或使用 Node.js http-server
npx http-server -p 8080
```

### 自定义样式

编辑 `assets/css/style.css` 文件可以自定义样式：

- 修改主色调
- 调整布局和间距
- 添加企业品牌元素

### 添加新功能

1. 在 `components/` 目录下创建新的组件文件
2. 在 `assets/js/router.js` 中添加路由规则
3. 在组件中实现业务逻辑

## 常见问题

### Q: 为什么选择 GitHub Pages？

A: GitHub Pages 提供免费、稳定的静态网站托管服务，支持自定义域名，访问速度快，特别适合前后端分离的项目。

### Q: 如何处理跨域问题？

A: 需要在后端API服务器上配置CORS头，允许GitHub Pages域名的跨域请求。

### Q: 可以使用其他CDN加速吗？

A: 可以，您可以将文件上传到阿里云OSS、腾讯云COS等服务，然后配置CDN加速。

### Q: 如何监控前端错误？

A: 可以集成第三方错误监控服务，如Sentry、LogRocket等。

## 维护和更新

### 更新部署

1. 修改代码后提交到GitHub仓库
2. GitHub Pages会自动重新部署
3. 通常在几分钟内生效

### 版本管理

建议使用Git标签管理版本：

```bash
git tag v1.0.0
git push origin v1.0.0
```

### 备份

定期备份配置文件和自定义修改，确保数据安全。

## 技术支持

如有问题，请检查：

1. GitHub Pages 部署状态
2. 后端API服务是否正常
3. 域名DNS配置是否正确
4. 浏览器控制台错误信息

## 更新日志

### v1.0.0 (2025-09-25)
- 初始版本发布
- 支持投诉表单提交
- 支持投诉详情查看
- 支持图片上传
- 响应式设计

- GitHub Pages 部署支持

