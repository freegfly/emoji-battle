import express from 'express';
import cors from 'cors';
import userRoutes from './api/user';
import matchRoutes from './api/match';
import memeRoutes from './api/meme';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// API Routes
app.use('/api/user', userRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/meme', memeRoutes);

// Leaderboard 单独路由
app.get('/api/leaderboard', (req, res) => {
  const openid = req.headers['x-openid'] as string;
  const topN = parseInt(req.query.top as string) || 10;

  // 动态导入 db 以避免循环依赖
  import('./data/db').then(({ db }) => {
    const leaderboard = db.getLeaderboard(topN, openid);
    const userRank = openid ? db.getUserRank(openid) : 0;
    res.json({ leaderboard, userRank });
  });
});

// 排行榜 Top 10
app.get('/api/leaderboard/top10', (req, res) => {
  const openid = req.headers['x-openid'] as string;

  import('./data/db').then(({ db }) => {
    const leaderboard = db.getLeaderboard(10, openid);
    res.json({ leaderboard });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🎮 Game API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

export default app;
