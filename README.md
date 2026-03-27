# 表情包对战 - Meme Battle

一个炫酷的 H5 表情包对战游戏，支持自动战斗、技能效果、天王挑战和排行榜！

## 🎮 游戏特色

- ⚔️ **自动对战** - 上传你的表情包，AI 自动匹配对手战斗
- 🎯 **技能系统** - 暴击、灼烧、连击、治疗、护盾 5 大技能
- 👑 **天王挑战** - 击败四大天王获得专属徽章
- 🏆 **排行榜** - 记录你的战绩和胜率
- 🖼️ **表情包池** - 管理你的表情包收藏

## 🚀 快速部署到 Cloudflare Pages

### 方法一：GitHub + Cloudflare Pages（推荐）

1. **创建 GitHub 仓库**
   - 访问 https://github.com/new
   - 仓库名：`emoji-battle`
   - 选择 Public
   - 点击 "Create repository"

2. **推送代码**
   ```bash
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/emoji-battle.git
   git push -u origin main
   ```

3. **连接 Cloudflare Pages**
   - 访问 https://pages.cloudflare.com
   - 用 GitHub 账号登录
   - 点击 "Create a project"
   - 选择 `emoji-battle` 仓库
   - 构建命令：`npm run build`
   - 输出目录：`dist`
   - 点击 "Deploy site"

4. **完成！** 获得免费域名，如 `emoji-battle.pages.dev`

### 方法二：直接上传 dist 文件夹

1. 构建项目：
   ```bash
   npm run build
   ```

2. 将 `dist` 文件夹内容上传到任意的静态托管服务

## 📁 项目结构

```
emoji-battle/
├── src/
│   ├── App.tsx          # 主游戏组件
│   ├── components/      # UI 组件
│   │   ├── Leaderboard.tsx  # 排行榜
│   │   └── MemePool.tsx     # 表情包池
│   ├── services/
│   │   └── api.ts      # 本地存储 API
│   └── index.css        # 样式
├── public/
│   └── memes/           # 内置表情包图片
├── dist/                # 构建输出
└── package.json
```

## 🛠️ 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 📱 技术栈

- React 18 + TypeScript
- Vite
- Tailwind CSS
- localStorage（无需后端）

## 🎨 设计风格

赛博朋克霓虹风格，紫色/绿色/粉色霓虹效果。

---

Made with ❤️ by Qoder
