# 快速检查清单 - 表情包对战微信小程序

## 部署前检查 ✅

### 账号准备
- [ ] 注册微信公众平台小程序账号
- [ ] 获取 AppID（开发设置页面）
- [ ] 下载安装微信开发者工具

### 文件检查
- [ ] `project.config.json` - AppID 已配置
- [ ] `app.js` - 云开发环境 ID 已配置
- [ ] `cloudfunctions/login/` - 依赖已安装

### 云开发检查
- [ ] 已开通云开发
- [ ] 已创建 `users` 集合
- [ ] 已创建 `matches` 集合
- [ ] 已创建 `memes` 集合
- [ ] `login` 云函数已上传

---

## 部署步骤速览

```
1. 打开微信开发者工具
   ↓
2. 导入 wechat-game 项目
   ↓
3. 填写 AppID（project.config.json）
   ↓
4. 填写环境 ID（app.js）
   ↓
5. 上传 login 云函数
   ↓
6. 创建数据库集合
   ↓
7. 编译运行
   ↓
8. 测试功能
   ↓
9. 上传代码
   ↓
10. 提交审核
```

---

## 关键配置项

### AppID 配置
文件：`project.config.json`
```json
{
  "appid": "wx1234567890abcdef"
}
```

### 环境 ID 配置
文件：`app.js`
```javascript
wx.cloud.init({
  env: 'emoji-battle-1a2b3c',  // 替换为你的环境 ID
  traceUser: true,
});
```

### 数据库集合名称
| 集合名 | 用途 |
|--------|------|
| `users` | 用户信息 |
| `matches` | 对战记录 |
| `memes` | 表情包池 |

---

## 测试账号申请

提交审核时，如果需要测试账号：

```
测试微信号：提供任意微信账号即可
测试说明：表情包对战游戏，登录后可上传表情包进行对战
```

---

## 常见报错对照

| 错误信息 | 原因 | 解决方法 |
|----------|------|----------|
| `appid missing` | 未配置 AppID | 修改 project.config.json |
| `env missing` | 未配置云环境 | 修改 app.js 中的 env |
| `function not found` | 云函数未上传 | 右键上传 login 函数 |
| `collection not exists` | 数据库未创建 | 云开发控制台创建集合 |
| `api not supported` | 基础库版本过低 | 更新微信版本 |

---

## 联系支持

如有部署问题：
1. 查看微信开发者工具「帮助」菜单
2. 查看 [微信小程序开发文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
3. 查看 [云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/quickstart.html)
