# 表情包对战微信小程序 - 部署指南

## 目录
1. [准备工作](#1-准备工作)
2. [创建微信小程序项目](#2-创建微信小程序项目)
3. [配置云开发环境](#3-配置云开发环境)
4. [上传云函数](#4-上传云函数)
5. [配置项目参数](#5-配置项目参数)
6. [本地开发调试](#6-本地开发调试)
7. [发布上线](#7-发布上线)

---

## 1. 准备工作

### 1.1 注册微信公众平台账号

访问 [微信公众平台](https://mp.weixin.qq.com/)，注册一个小程序账号。

![微信公众平台](https://res.wx.qq.com/wxdoc/dist/assets/images/register.3a4c3084.png)

**注册类型选择：**
- 选择「小程序」类型
- 个人开发者可注册个人小程序
- 企业需准备营业执照等资质

### 1.2 下载微信开发者工具

访问 [微信开发者工具下载页](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)

![开发者工具下载](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.png)

下载对应系统的最新版本并安装。

### 1.3 准备开发环境

确保已安装：
- Node.js (v16+)
- npm 或 yarn

---

## 2. 创建微信小程序项目

### 步骤 2.1 打开微信开发者工具

双击打开「微信开发者工具」，使用微信扫码登录。

![扫码登录](https://developers.weixin.qq.com/miniprogram/dev/devtools/images/login.png)

### 步骤 2.2 创建新项目

点击「+」号或「新建项目」按钮。

![新建项目](https://developers.weixin.qq.com/miniprogram/dev/devtools/images/new-project.png)

### 步骤 2.3 填写项目信息

```
项目目录：选择 wechat-game 文件夹
AppID：输入你的小程序 AppID（如：wx1234567890abcdef）
项目名称：表情包对战
开发模式：小程序
后端服务：不使用云服务（我们使用自建后端）
语言：JavaScript
```

![填写项目信息](https://developers.weixin.qq.com/miniprogram/dev/devtools/images/create-project-dialog.png)

**注意：**
- 如果还没有 AppID，可以先选择「测试号」进行开发
- 测试号体验功能有限，建议获取正式 AppID

### 步骤 2.4 获取 AppID

登录 [微信公众平台](https://mp.weixin.qq.com/) → 进入「开发」→「开发管理」→「开发设置」

![获取AppID](https://res.wx.qq.com/wxdoc/dist/assets/images/get-appid.3a4c3084.png)

记录你的 AppID，后面需要填入项目配置。

---

## 3. 配置云开发环境

### 步骤 3.1 开通云开发

在微信开发者工具中，点击顶部菜单「云开发」，按照提示开通云开发服务。

![云开发入口](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/quick-start/images/cloud-entry.png)

### 步骤 3.2 获取环境 ID

开通后，在云开发控制台中可以看到「环境 ID」

![环境ID](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/quick-start/images/env-id.png)

记录环境 ID（如：`emoji-battle-1a2b3c`）

### 步骤 3.3 配置环境 ID

修改 `app.js` 文件中的环境 ID：

```javascript
// app.js
App({
  onLaunch() {
    if (wx.cloud) {
      wx.cloud.init({
        env: '你的环境ID',  // 例如：emoji-battle-1a2b3c
        traceUser: true,
      });
    }
  },
});
```

### 步骤 3.4 创建数据库集合

在云开发控制台中，点击「数据库」→「创建集合」：

创建以下集合：
- `users` - 用户信息
- `matches` - 对战记录
- `memes` - 表情包池

![创建数据库](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/quick-start/images/create-collection.png)

---

## 4. 上传云函数

### 步骤 4.1 安装依赖

在 `cloudfunctions/login/` 目录下打开终端，安装云函数依赖：

```bash
cd wechat-game/cloudfunctions/login
npm install
```

### 步骤 4.2 上传 login 云函数

在微信开发者工具中，右键点击 `cloudfunctions/login` 文件夹，选择「上传并部署」。

![上传云函数](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/quick-start/images/upload-function.png)

### 步骤 4.3 配置云函数权限

上传后，在云开发控制台的「云函数」中，可以看到已上传的 login 函数。

点击函数名称，进入详情页，开启「未登录访问」权限：

```json
{
  "permissions": {
    "openapi": []
  }
}
```

### 步骤 4.4 测试云函数

在云开发控制台的「云函数」→「login」中，点击「测试」：

```json
// 输入参数（空即可，openid 会自动获取）
{}

// 预期输出
{
  "openid": "oxXXXXXXXXXXXXXX",
  "appid": "wx1234567890abcdef"
}
```

---

## 5. 配置项目参数

### 步骤 5.1 修改 project.config.json

更新 `wechat-game/project.config.json` 中的 AppID：

```json
{
  "projectname": "emoji-battle",
  "description": "表情包对战小游戏",
  "appid": "你的AppID",  // 例如：wx1234567890abcdef
  ...
}
```

### 步骤 5.2 修改 app.json

更新 `wechat-game/app.json`：

```json
{
  "pages": [
    "pages/index/index",
    "pages/battle/battle",
    "pages/result/result",
    "pages/pool/pool",
    "pages/leaderboard/leaderboard"
  ],
  "window": {
    "navigationBarBackgroundColor": "#0a0a0f",
    "navigationBarTitleText": "表情包对战",
    "navigationBarTextStyle": "white"
  }
}
```

### 步骤 5.3 配置 sitemap

创建 `wechat-game/sitemap.json`：

```json
{
  "desc": "关于本文件的更多信息，请参考文档 https://developers.weixin.qq.com/miniprogram/dev/framework/sitemap.html",
  "rules": [{
    "action": "allow",
    "page": "*"
  }]
}
```

---

## 6. 本地开发调试

### 步骤 6.1 启动项目

在微信开发者工具中，打开 `wechat-game` 文件夹，点击「编译」。

![编译项目](https://developers.weixin.qq.com/miniprogram/dev/devtools/images/compile.png)

### 步骤 6.2 预览效果

编译成功后，可以在模拟器中看到首页：

![模拟器预览](https://developers.weixin.qq.com/miniprogram/dev/devtools/images/simulator.png)

### 步骤 6.3 调试技巧

1. **控制台**：查看日志和错误信息
2. ** Sources **：断点调试云函数
3. ** Network **：查看网络请求
4. ** Storage **：查看本地数据

![调试面板](https://developers.weixin.qq.com/miniprogram/dev/devtools/images/debug-panel.png)

### 步骤 6.4 常见问题

**问题 1：云函数调用失败**
```
Error: cloud init error: missing env
```
解决：确保 `app.js` 中的环境 ID 正确，且已开通云开发

**问题 2：chooseMedia 不可用**
```
wx.chooseMedia is not a function
```
解决：检查基础库版本，确保在 2.7.0 以上

**问题 3：获取用户信息失败**
```
getUserProfile:fail the api is no longer supported
```
解决：新版本需要用户主动点击按钮触发 `getUserProfile`

---

## 7. 发布上线

### 步骤 7.1 版本管理

在开发工具中，点击「上传」按钮，填写版本号和备注：

```
版本号：1.0.0
版本备注：首次发布
```

![上传版本](https://developers.weixin.qq.com/miniprogram/dev/devtools/images/upload.png)

### 步骤 7.2 提交审核

登录 [微信公众平台](https://mp.weixin.qq.com/) → 进入「版本管理」→ 找到刚上传的版本 → 点击「提交审核」

![提交审核](https://res.wx.qq.com/wxdoc/dist/assets/images/submit-audit.png)

### 步骤 7.3 填写审核信息

根据小程序类型填写：
- **功能页面**：选择主要功能页面
- **功能描述**：简要描述小程序功能
- **测试账号**：如有登录功能，提供测试账号

### 步骤 7.4 等待审核

审核时间通常为 1-7 个工作日。审核通过后，微信团队会通知你。

### 步骤 7.5 发布上线

审核通过后，在「版本管理」中点击「发布」即可正式上线。

---

## 附录：自建后端部署

如果不想使用微信云开发，可以使用自建后端：

### 步骤 A.1 部署后端服务

```bash
cd server
npm install
npx ts-node index.ts
```

服务将在 `http://localhost:3001` 运行。

### 步骤 A.2 修改 API 地址

在 `services/api.ts` 中修改 API 地址：

```typescript
const API_BASE = 'https://your-backend-domain.com/api';
```

### 步骤 A.3 部署到云服务器

推荐使用：
- 腾讯云服务器
- 阿里云服务器
- Vercel + Express
- Railway

---

## 技术支持

如有问题，请检查：
1. 微信开发者工具日志
2. 云开发控制台日志
3. 浏览器控制台（模拟器中）

祝部署成功！🎮
