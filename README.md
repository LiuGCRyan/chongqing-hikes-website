# Chongqing Hikes Website

户外冒险风格的重庆外国人导游网站

## 📁 网站结构

```
chongqing-hikes-website/
├── index.html          # 首页
├── city-tours.html     # 城市游板块
├── hiking.html         # 野山徒步板块
├── about.html          # 关于我
├── contact.html        # 联系/预订
├── css/
│   └── style.css       # 样式文件
├── js/
│   └── main.js         # 交互脚本
└── images/             # 图片目录（需自行添加）
```

## 🚀 部署到 GitHub Pages（免费）

### 第一步：注册 GitHub
1. 访问 https://github.com
2. 点击 "Sign up" 注册账号
3. 验证邮箱

### 第二步：创建仓库
1. 登录 GitHub
2. 点击右上角 "+" → "New repository"
3. 仓库名填：`chongqinghikes.github.io`
   - ⚠️ 必须是这个格式：`你的用户名.github.io`
4. 选择 "Public"
5. 点击 "Create repository"

### 第三步：上传文件
**方法A：网页上传（最简单）**
1. 进入你的仓库页面
2. 点击 "uploading an existing file"
3. 把所有文件拖进去
4. 点击 "Commit changes"

**方法B：使用 Git（推荐）**
```bash
# 克隆仓库
git clone https://github.com/你的用户名/chongqinghikes.github.io.git

# 进入目录
cd chongqinghikes.github.io

# 复制网站文件到这里
# 然后提交
git add .
git commit -m "Initial website"
git push origin main
```

### 第四步：启用 GitHub Pages
1. 进入仓库 → Settings
2. 左侧菜单找到 "Pages"
3. Source 选择 "Deploy from a branch"
4. Branch 选择 "main"，文件夹选择 "/ (root)"
5. 点击 Save

### 第五步：访问网站
几分钟后，你的网站就会上线：
```
https://你的用户名.github.io
```

## 🌐 绑定自定义域名（可选）

如果你买了自己的域名（如 chongqinghikes.com）：

1. 在仓库根目录创建文件 `CNAME`
2. 文件内容写你的域名：`chongqinghikes.com`
3. 去域名服务商后台，添加 DNS 记录：
   - 类型：CNAME
   - 名称：www
   - 值：你的用户名.github.io
4. 等待 DNS 生效（可能需要几分钟到几小时）

## 🖼️ 添加图片

1. 在 `images/` 目录下放图片
2. 在 HTML 中引用：
   ```html
   <img src="images/your-photo.jpg" alt="描述">
   ```

建议图片尺寸：
- Hero 背景：1920x1080px
- Tour 卡片：800x600px
- 个人照片：500x500px

## 🎬 添加视频

网站已预留视频嵌入位置。在 `index.html` 中找到：
```html
<div class="video-placeholder">
```

替换为 TikTok 嵌入代码：
```html
<blockquote class="tiktok-embed" cite="https://www.tiktok.com/@chongqinghikes/video/你的视频ID" data-video-id="你的视频ID">
    <a href="https://www.tiktok.com/@chongqinghikes/video/你的视频ID">Watch on TikTok</a>
</blockquote>
<script async src="https://www.tiktok.com/embed.js"></script>
```

或 YouTube 嵌入代码：
```html
<iframe width="100%" height="100%" src="https://www.youtube.com/embed/你的视频ID" frameborder="0" allowfullscreen></iframe>
```

## ✏️ 修改内容

所有文字内容都在 HTML 文件中，直接编辑即可：
- 价格：搜索 `¥` 符号
- 联系方式：搜索 `+86` 或 `qq.com`
- 介绍文字：直接修改 `<p>` 标签内的内容

## 📱 响应式设计

网站已适配手机、平板、电脑，无需额外修改。

## 🆘 需要帮助？

如果部署遇到问题，告诉我具体报错信息，我可以帮你排查。

---

**网站文件位置：**
```
C:\Users\Administrator\.qclaw\workspace\chongqing-hikes-website\
```

**下一步操作：**
1. 注册 GitHub 账号
2. 创建仓库 `你的用户名.github.io`
3. 上传所有文件
4. 启用 GitHub Pages
5. 访问 `https://你的用户名.github.io`

祝你的导游事业成功！🏔️
