# Netlify 部署指南

## 问题修复说明

已修复以下问题：
1. **模块解析错误** - 在Vite配置中添加了`base: './'`，确保所有资源使用相对路径
2. **SPA路由支持** - 创建了`netlify.toml`配置文件，配置了重定向规则
3. **favicon路径** - 修复了favicon.ico的路径问题

## 部署步骤

### 方法1：通过Git部署（推荐）
1. 将代码推送到GitHub/GitLab仓库
2. 在Netlify中连接你的Git仓库
3. 配置构建设置：
   - 构建命令: `npm run build`
   - 发布目录: `dist`
4. 部署即可

### 方法2：手动拖拽部署
1. 运行 `npm run build` 生成dist文件夹
2. 将整个dist文件夹拖拽到Netlify的部署区域

## 配置文件说明

### netlify.toml
```toml
[build]
publish = "dist"
command = "npm run build"

[build.environment]
NODE_VERSION = "20"

[[redirects]]
from = "/*"
to = "/index.html"
status = 200
```

### vite.config.js 关键配置
```javascript
export default defineConfig({
  // ... 其他配置
  base: './',  // 确保资源使用相对路径
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
```

## 验证部署

部署完成后，访问你的Netlify域名，应该能看到：
- 页面正常加载，没有控制台错误
- Vue应用正常工作
- SPA路由正常（刷新页面不会404）

如果仍有问题，请检查Netlify的构建日志和浏览器控制台错误信息。