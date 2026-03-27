import { Router } from 'express';
import { db } from '../data/db';

const router = Router();

// 创建对战记录
router.post('/create', (req, res) => {
  const openid = req.headers['x-openid'] as string;
  const { challengedId, challengerWon, isChampionMatch, challengerPower, challengedPower, challengerBadge } = req.body;

  if (!openid) {
    return res.status(401).json({ error: '缺少用户标识' });
  }

  const user = db.getUserByOpenid(openid);
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }

  // 创建对战记录
  const match = db.createMatch({
    challengerId: user.id,
    challengedId: challengedId || null,
    challengerWon,
    isChampionMatch,
    challengerPower,
    challengedPower,
    challengerBadge
  });

  // 更新用户战绩
  if (!isChampionMatch) {
    db.updateUserStats(openid, challengerWon, challengerBadge || undefined);
  }

  res.json({ match });
});

// 获取用户对战历史
router.get('/history', (req, res) => {
  const openid = req.headers['x-openid'] as string;
  const limit = parseInt(req.query.limit as string) || 20;

  if (!openid) {
    return res.status(401).json({ error: '缺少用户标识' });
  }

  const user = db.getUserByOpenid(openid);
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }

  const matches = db.getUserMatches(user.id, limit);
  res.json({ matches });
});

// 获取排行榜
router.get('/leaderboard', (req, res) => {
  const openid = req.headers['x-openid'] as string;
  const topN = parseInt(req.query.top as string) || 10;

  const leaderboard = db.getLeaderboard(topN, openid);
  const userRank = openid ? db.getUserRank(openid) : 0;

  res.json({ leaderboard, userRank });
});

export default router;
