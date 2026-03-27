import { Router } from 'express';
import { db, User } from '../data/db';

const router = Router();

// 获取用户信息
router.get('/info', (req, res) => {
  const openid = req.headers['x-openid'] as string;

  if (!openid) {
    return res.status(401).json({ error: '缺少用户标识' });
  }

  const user = db.getUserByOpenid(openid);
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }

  res.json({ user });
});

// 注册/更新用户
router.post('/register', (req, res) => {
  const openid = req.headers['x-openid'] as string;
  const { nickName, avatarUrl } = req.body;

  if (!openid) {
    return res.status(401).json({ error: '缺少用户标识' });
  }

  const user = db.getOrCreateUser(openid, nickName, avatarUrl);
  res.json({ user });
});

// 更新当前使用表情包
router.put('/current-meme', (req, res) => {
  const openid = req.headers['x-openid'] as string;
  const { memeId } = req.body;

  if (!openid) {
    return res.status(401).json({ error: '缺少用户标识' });
  }

  const user = db.getUserByOpenid(openid);
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }

  const meme = db.setActiveMeme(user.id, memeId);
  if (!meme) {
    return res.status(400).json({ error: '表情包不存在或不属于该用户' });
  }

  user.currentMemeId = memeId;
  res.json({ meme, user });
});

// 更新战绩
router.post('/update-stats', (req, res) => {
  const openid = req.headers['x-openid'] as string;
  const { won, badge } = req.body;

  if (!openid) {
    return res.status(401).json({ error: '缺少用户标识' });
  }

  const user = db.updateUserStats(openid, won, badge);
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }

  res.json({ user });
});

export default router;
