-- 表情包对战游戏数据库 Schema

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  openid VARCHAR(64) UNIQUE NOT NULL,  -- 微信 OpenID
  nick_name VARCHAR(50) DEFAULT '匿名用户',
  avatar_url TEXT DEFAULT '',
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  badges TEXT[] DEFAULT '{}',  -- 徽章 ID 数组
  current_meme_id UUID,  -- 当前选中的表情包
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 表情包表
CREATE TABLE IF NOT EXISTS memes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  power INTEGER NOT NULL,
  hp INTEGER NOT NULL,
  skill_name VARCHAR(50),
  skill_emoji VARCHAR(10),
  skill_type VARCHAR(20),
  skill_color VARCHAR(20),
  skill_base_damage INTEGER,
  name VARCHAR(50),
  is_system BOOLEAN DEFAULT false,  -- 是否系统表情包
  is_active BOOLEAN DEFAULT false,   -- 是否正在使用
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 对战记录表
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_id UUID REFERENCES users(id),
  challenged_id UUID REFERENCES users(id),  -- NULL 表示系统对战
  challenger_won BOOLEAN NOT NULL,
  is_champion_match BOOLEAN DEFAULT false,
  challenger_power INTEGER,
  challenged_power INTEGER,
  challenger_badge VARCHAR(100),  -- 获得的徽章
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 排行榜视图（物化视图用于缓存）
CREATE INDEX idx_users_wins ON users(wins DESC);
CREATE INDEX idx_users_openid ON users(openid);
CREATE INDEX idx_memes_user_id ON memes(user_id);
CREATE INDEX idx_matches_challenger ON matches(challenger_id);
CREATE INDEX idx_matches_created ON matches(created_at DESC);

-- 获取排行榜 Top 10 + 用户排名的函数
CREATE OR REPLACE FUNCTION get_leaderboard(p_openid VARCHAR)
RETURNS TABLE (
  rank BIGINT,
  openid VARCHAR,
  nick_name VARCHAR,
  avatar_url TEXT,
  wins BIGINT,
  losses BIGINT,
  win_rate DECIMAL,
  badge_count BIGINT,
  is_current_user BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  WITH ranked_users AS (
    SELECT
      u.openid,
      u.nick_name,
      u.avatar_url,
      u.wins,
      u.losses,
      CASE WHEN u.wins + u.losses > 0
        THEN ROUND((u.wins::DECIMAL / (u.wins + u.losses)) * 100, 1)
        ELSE 0 END as win_rate,
      ARRAY_LENGTH(u.badges, 1) as badge_count,
      RANK() OVER (ORDER BY u.wins DESC, u.losses ASC) as rank
    FROM users u
    WHERE u.wins + u.losses > 0
  ),
  user_rank AS (
    SELECT rank FROM ranked_users WHERE openid = p_openid
  )
  SELECT
    r.rank,
    r.openid,
    r.nick_name,
    r.avatar_url,
    r.wins,
    r.losses,
    r.win_rate,
    COALESCE(r.badge_count, 0)::DECIMAL as badge_count,
    (r.openid = p_openid) as is_current_user
  FROM ranked_users r
  WHERE r.rank <= 10
     OR r.openid = p_openid
  ORDER BY
    CASE WHEN r.openid = p_openid THEN 0 ELSE 1 END,
    r.rank;
END;
$$ LANGUAGE plpgsql;

-- 添加外键约束
ALTER TABLE memes ADD CONSTRAINT memes_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
