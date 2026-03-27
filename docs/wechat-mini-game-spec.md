# 表情包对战小游戏 - 微信小程序技术规格

## 概述
将 H5 原型迁移到微信小程序，增加社交功能。

## 微信 API 限制说明

### 表情包上传
- **限制**: 微信不开放聊天表情包的直接访问权限
- **解决方案**: 用户需先保存表情包到相册，再通过 `wx.chooseImage` 选择
- **API**: `wx.chooseImage({ sourceType: ['album'] })`

### 用户身份
- 使用微信 OpenID 作为用户唯一标识
- 通过 `wx.getUserProfile` 获取昵称和头像（需用户授权）

## 数据库设计 (微信云开发)

### Collection: users
```javascript
{
  _id: string,           // 微信用户 OpenID
  nickName: string,      // 昵称
  avatarUrl: string,     // 头像 URL
  createdAt: number,     // 创建时间戳
  stats: {
    wins: number,        // 胜利次数
    losses: number,      // 失败次数
    totalBattles: number // 总战斗次数
  },
  badges: string[],      // 获得的徽章 ID 数组 (最多4个)
  currentMemePower: number, // 当前表情包战力
  currentMemeHp: number     // 当前表情包血量
}
```

### Collection: matches
```javascript
{
  _id: string,
  challengerId: string,    // 挑战者 OpenID
  challengedId: string,    // 被挑战者 OpenID (可为 "system")
  challengerWon: boolean,
  isChampionMatch: boolean,
  challengerPower: number,
  challengedPower: number,
  challengerBadge: string | null,  // 获得的徽章
  createdAt: number
}
```

### Collection: memes (表情包池)
```javascript
{
  _id: string,
  userId: string,         // 所属用户 OpenID
  imageUrl: string,       // 云存储路径
  power: number,
  hp: number,
  skill: object,
  name: string,
  isSystem: boolean,      // 是否系统表情包
  createdAt: number
}
```

### Collection: leaderboard (排行榜缓存)
```javascript
{
  _id: string,            // OpenID
  rank: number,           // 排名
  wins: number,
  winRate: number,
  badgeCount: number
}
```

## 排行榜展示

### 入口
- 首页顶部导航栏入口 "🏆 战绩排行"

### 显示内容
1. **用户本身战绩**（固定在最上方，高亮显示）
   - 头像 + 昵称
   - 胜利/失败次数
   - 胜率百分比
   - 徽章列表（最多4个）

2. **Top 10 排行榜**
   - 排名序号
   - 头像 + 昵称
   - 胜利次数
   - 胜率
   - 徽章图标

## 表情包池

### 功能
- 用户上传表情包存入个人表情包池
- 匹配时从表情包池随机选择一个作为"本体"进行战斗
- 最多保存 10 个表情包

### 系统表情包
- 10 个热门鬼畜表情包（系统内置）
- 4 个天王表情包
- 系统表情包**不计入用户战绩**

## 匹配逻辑修改

### 用户发起挑战
1. 用户选择表情包池中的一个表情包
2. 系统匹配：
   - 20% 概率匹配天王（保持原逻辑）
   - 80% 概率匹配其他在线用户的表情包
   - 如果没有其他用户，回退到系统表情包

### 被挑战
- 当其他用户匹配到当前用户时，触发被挑战
- 使用当前用户表情包池中随机一个进行战斗
- 战斗结果计入战绩

## 页面结构

```
pages/
├── index/          # 首页 - 上传表情包入口
├── battle/         # 战斗页面
├── result/         # 战斗结果
├── pool/           # 表情包池管理
├── leaderboard/    # 排行榜
└── profile/        # 个人战绩详情
```

## 微信小程序配置

### app.json 关键配置
```json
{
  "pages": ["pages/index/index", ...],
  "permission": {
    "scope.userLocation": {
      "desc": "用于排行榜定位"
    }
  },
  "requiredPrivateInfos": ["chooseAddress"]
}
```

### 需要的权限
- `scope.writePhotosAlbum` - 保存图片到相册
- 用户信息获取 (getUserProfile)
- 开放数据域 (用于获取用户敏感信息)

## API 端点 (云函数)

### user
- `GET /user/info` - 获取用户信息
- `POST /user/register` - 注册/更新用户信息
- `POST /user/updateMeme` - 更新当前使用表情包

### match
- `POST /match/create` - 创建对战记录
- `GET /match/history` - 获取对战历史

### leaderboard
- `GET /leaderboard/top10` - 获取 Top 10 排行
- `GET /leaderboard/user` - 获取用户排名

### meme
- `GET /meme/pool` - 获取用户表情包池
- `POST /meme/upload` - 上传新表情包
- `DELETE /meme/:id` - 删除表情包
- `PUT /meme/:id/setActive` - 设置为主动挑战表情包

## 技术栈

- **前端**: 微信小程序原生开发 (Taro 框架可选)
- **后端**: 微信云开发 (云函数 + 云数据库 + 云存储)
- **实时性**: 云数据库触发器更新排行榜
