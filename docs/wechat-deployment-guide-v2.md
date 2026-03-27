# 表情包对战微信小程序 - 完整部署指南

## 目录
1. [环境准备](#1-环境准备)
2. [项目配置](#2-项目配置)
3. [云函数部署](#3-云函数部署)
4. [数据库配置](#4-数据库配置)
5. [内容安全配置](#5-内容安全配置)
6. [本地调试](#6-本地调试)
7. [发布上线](#7-发布上线)
8. [常见问题](#8-常见问题)

---

## 1. 环境准备

### 1.1 注册微信公众平台

访问 [微信公众平台](https://mp.weixin.qq.com/)，注册小程序账号。

**准备材料：**
- 微信号（用于管理员）
- 企业：营业执照（可选）
- 个人：身份证信息

### 1.2 下载开发者工具

下载 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)

### 1.3 获取 AppID

1. 登录微信公众平台
2. 进入「开发」→「开发管理」→「开发设置」
3. 保存 AppID（如：`wx1234567890abcdef`）

---

## 2. 项目配置

### 2.1 修改项目配置

编辑 `project.config.json`：

```json
{
  "projectname": "emoji-battle",
  "appid": "你的AppID",
  "description": "表情包对战小游戏"
}
```

### 2.2 配置云开发环境

编辑 `app.js`，修改云环境 ID：

```javascript
App({
  globalData: {
    cloudEnv: '你的云环境ID',  // 例如：emoji-battle-1a2b3c4d
  }
})
```

### 2.3 项目文件结构

```
wechat-game/
├── app.js                 # 全局入口
├── app.json              # 全局配置
├── app.wxss              # 全局样式
├── project.config.json   # 项目配置
├── database.rules.json   # 数据库权限规则
├── sitemap.json          # SEO 配置
│
├── cloudfunctions/      # 云函数
│   ├── login/           # 获取 OpenID
│   ├── checkContent/    # 内容安全检测
│   ├── uploadMeme/      # 上传表情包（带检测）
│   └── getUserData/      # 获取用户数据
│
└── pages/               # 页面
    ├── index/           # 首页
    ├── battle/          # 战斗
    ├── result/          # 结果
    ├── pool/            # 表情包池
    └── leaderboard/     # 排行榜
```

---

## 3. 云函数部署

### 3.1 开通云开发

1. 打开微信开发者工具
2. 点击顶部菜单「云开发」
3. 按照提示开通云开发
4. 记录云环境 ID

### 3.2 安装云函数依赖

每个云函数目录都需要安装依赖。打开终端，进入每个云函数目录执行：

```bash
# login 云函数
cd cloudfunctions/login
npm install

# checkContent 云函数
cd ../checkContent
npm install

# uploadMeme 云函数
cd ../uploadMeme
npm install

# getUserData 云函数
cd ../getUserData
npm install
```

### 3.3 上传云函数

在微信开发者工具中，右键点击每个云函数文件夹，选择「上传并部署」：

| 云函数 | 权限配置 |
|--------|---------|
| `login` | 默认权限即可 |
| `checkContent` | 需要 `imgCheckSec` 权限 |
| `uploadMeme` | 需要数据库读写权限 |
| `getUserData` | 需要数据库读写权限 |

### 3.4 云函数权限配置

在云开发控制台，进入「云函数」→「权限设置」：

```json
{
  "permissions": {
    "openapi": ["security.imgCheckSec"]
  }
}
```

---

## 4. 数据库配置

### 4.1 创建数据库集合

在云开发控制台的「数据库」中，创建以下集合：

| 集合名称 | 用途 | 备注 |
|---------|------|------|
| `users` | 用户信息 | 包含 openid、昵称、战绩 |
| `memes` | 表情包池 | 包含用户的表情包 |
| `matches` | 对战记录 | 战斗历史 |

### 4.2 配置数据库权限

编辑 `database.rules.json` 并在云开发控制台中设置：

```json
{
  "rules": {
    "users": {
      "read": true,
      "write": "doc.openid == auth.openid"
    },
    "memes": {
      "read": true,
      "create": "auth.openid != null",
      "update": "doc.userId == auth.openid",
      "delete": "doc.userId == auth.openid"
    },
    "matches": {
      "read": "doc.challengerId == auth.openid",
      "create": "auth.openid != null"
    }
  }
}
```

### 4.3 users 集合结构

```javascript
{
  "_id": "自动生成",
  "openid": "用户唯一标识",
  "nickName": "用户昵称",
  "avatarUrl": "头像URL",
  "wins": 0,           // 胜利次数
  "losses": 0,          // 失败次数
  "badges": [],         // 获得的徽章
  "currentMemeId": "",  // 当前使用的表情包
  "createdAt": Date,
  "updatedAt": Date
}
```

### 4.4 memes 集合结构

```javascript
{
  "_id": "自动生成",
  "userId": "用户openid",
  "imageUrl": "图片访问URL",
  "fileId": "云存储文件ID",
  "cloudPath": "云存储路径",
  "power": 150,         // 战力值
  "hp": 450,            // 血量
  "skill": {
    "name": "灼烧印记",
    "emoji": "🔥",
    "type": "dot",
    "color": "#ff6b35",
    "baseDamage": 15
  },
  "name": "超级战士",
  "isSystem": false,    // 是否系统表情包
  "isActive": false,    // 是否正在使用
  "isDeleted": false,    // 软删除标记
  "createdAt": Date,
  "updatedAt": Date
}
```

---

## 5. 内容安全配置

### 5.1 微信内容安全 API

微信云开发提供免费的内容安全检测：

| API | 检测内容 | 免费额度 |
|-----|---------|---------|
| `imgCheckSec` | 图片合规检测 | 免费使用 |
| `msgCheck` | 文本内容检测 | 免费使用 |

### 5.2 检测流程

```
用户上传图片
     ↓
客户端检查（大小 ≤ 2MB）
     ↓
上传到云存储
     ↓
调用 imgCheckSec 检测
     ↓
┌─────────────┐
│  检测通过   │→ 保存到数据库 → 完成
└─────────────┘
     ↓ (不通过)
删除文件 → 返回错误提示
```

### 5.3 防护措施

| 措施 | 实现位置 | 说明 |
|-----|---------|------|
| 文件大小限制 | 客户端 + 云函数 | 最大 2MB |
| 图片尺寸限制 | 客户端 | 最大 1024x1024 |
| 内容安全检测 | `uploadMeme` 云函数 | 自动检测 |
| 表情包数量限制 | `uploadMeme` 云函数 | 每用户 10 个 |

### 5.4 违规处理

```javascript
// 检测不通过时
if (!checkResult.safe) {
  // 1. 删除已上传文件
  await cloud.deleteFile({ fileList: [fileID] });

  // 2. 返回错误信息
  return {
    success: false,
    reason: checkResult.reason  // 例如："图片内容违规"
  };
}
```

---

## 6. 本地调试

### 6.1 打开项目

1. 打开微信开发者工具
2. 点击「导入项目」
3. 选择 `wechat-game` 文件夹
4. 填入 AppID

### 6.2 编译运行

点击「编译」按钮，等待编译完成。

### 6.3 测试登录

1. 点击「微信登录」按钮
2. 允许获取用户信息
3. 确认右上角显示用户信息

### 6.4 测试上传

1. 点击上传区域
2. 选择一张图片
3. 等待上传和检测完成
4. 查看是否显示「上传成功」

### 6.5 调试面板

| 面板 | 用途 |
|------|------|
| Console | 查看日志和错误 |
| Sources | 断点调试云函数 |
| Network | 查看云函数调用 |
| Storage | 查看本地数据 |

---

## 7. 发布上线

### 7.1 版本上传

1. 在开发者工具中点击「上传」
2. 填写版本号（建议：`1.0.0`）
3. 填写版本备注

### 7.2 提交审核

1. 登录 [微信公众平台](https://mp.weixin.qq.com/)
2. 进入「版本管理」
3. 找到刚上传的版本
4. 点击「提交审核」

### 7.3 填写审核信息

| 字段 | 填写内容 |
|------|---------|
| 功能页面 | 选择首页 |
| 功能描述 | 表情包对战游戏，用户上传表情包与内置表情包对战 |
| 测试账号 | 可不填（无登录功能） |

### 7.4 审核周期

- 个人小程序：1-3 个工作日
- 企业小程序：3-7 个工作日

### 7.5 发布上线

审核通过后，在「版本管理」中点击「发布」即可。

---

## 8. 常见问题

### Q1: 云函数上传失败？

**原因：** 未安装依赖或环境不匹配

**解决：**
```bash
cd cloudfunctions/云函数名
npm install --production
```

### Q2: 内容检测不生效？

**原因：** 未开通内容安全权限

**解决：**
1. 登录微信公众平台
2. 进入「开发」→「接口设置」
3. 确认「内容安全」接口已开通

### Q3: 数据库权限不足？

**原因：** 数据库权限规则限制

**解决：**
1. 在云开发控制台打开「数据库」
2. 点击「权限设置」
3. 调整为合适的权限

### Q4: 如何处理用户恶意上传？

**当前防护：**
- 每用户限制 10 个表情包
- 单文件限制 2MB
- 图片内容安全检测

**额外建议：**
- 记录异常上传行为
- 设置 IP 限流
- 人工审核通道

### Q5: 如何更新云函数？

**步骤：**
1. 修改本地云函数代码
2. 右键点击云函数文件夹
3. 选择「上传并部署」
4. 重新编译小程序

---

## 技术支持

- [微信小程序开发文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/quickstart.html)
- [内容安全文档](https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/security-msg-sec-check.html)

祝部署成功！🎮
