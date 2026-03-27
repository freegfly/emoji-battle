import { Router } from 'express';
import { db } from '../data/db';

const router = Router();

// 获取用户表情包池
router.get('/pool', (req, res) => {
  const openid = req.headers['x-openid'] as string;

  if (!openid) {
    return res.status(401).json({ error: '缺少用户标识' });
  }

  const user = db.getUserByOpenid(openid);
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }

  const memes = db.getUserMemes(user.id);
  res.json({ memes });
});

// 上传新表情包
router.post('/upload', (req, res) => {
  const openid = req.headers['x-openid'] as string;
  const { imageUrl, power, hp, skill, name } = req.body;

  if (!openid) {
    return res.status(401).json({ error: '缺少用户标识' });
  }

  const user = db.getOrCreateUser(openid);
  
  // 检查表情包数量限制（最多10个）
  const userMemes = db.getUserMemes(user.id).filter(m => !m.isSystem);
  if (userMemes.length >= 10) {
    return res.status(400).json({ error: '表情包池已满（最多10个）' });
  }

  const meme = db.createMeme(user.id, {
    imageUrl,
    power,
    hp,
    skill,
    name,
    isSystem: false
  });

  res.json({ meme });
});

// 设置为主动挑战表情包
router.put('/:memeId/set-active', (req, res) => {
  const openid = req.headers['x-openid'] as string;
  const { memeId } = req.params;

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

  // 更新用户的当前表情包信息
  user.currentMemeId = memeId;

  res.json({ meme });
});

// 删除表情包
router.delete('/:memeId', (req, res) => {
  const openid = req.headers['x-openid'] as string;
  const { memeId } = req.params;

  if (!openid) {
    return res.status(401).json({ error: '缺少用户标识' });
  }

  const user = db.getUserByOpenid(openid);
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }

  const success = db.deleteMeme(memeId, user.id);
  if (!success) {
    return res.status(400).json({ error: '无法删除系统表情包或表情包不存在' });
  }

  res.json({ success: true });
});

export default router;
