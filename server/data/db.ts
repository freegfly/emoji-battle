// 内存数据库 - 模拟 Supabase
// 生产环境请替换为真实的 Supabase 客户端

import { v4 as uuidv4 } from 'uuid';

// 类型定义
export interface User {
  id: string
  openid: string
  nickName: string
  avatarUrl: string
  wins: number
  losses: number
  badges: string[]
  currentMemeId: string | null
  createdAt: number
  updatedAt: number
}

export interface Meme {
  id: string
  userId: string
  imageUrl: string
  power: number
  hp: number
  skill: {
    name: string
    emoji: string
    type: string
    color: string
    baseDamage: number
  }
  name: string
  isSystem: boolean
  isActive: boolean
  createdAt: number
}

export interface Match {
  id: string
  challengerId: string
  challengedId: string | null
  challengerWon: boolean
  isChampionMatch: boolean
  challengerPower: number
  challengedPower: number
  challengerBadge: string | null
  createdAt: number
}

export interface LeaderboardEntry {
  rank: number
  openid: string
  nickName: string
  avatarUrl: string
  wins: number
  losses: number
  winRate: number
  badgeCount: number
  isCurrentUser: boolean
}

// 系统表情包数据
const SYSTEM_MEMES: Omit<Meme, 'userId' | 'isActive' | 'createdAt'>[] = [
  // 10 个鬼畜表情包
  { id: 'sys_1', imageUrl: '/memes/panda.jpg', power: 155, hp: 465, skill: { name: '灼烧印记', emoji: '🔥', type: 'dot', color: '#ff6b35', baseDamage: 15 }, name: '老爷保号保号', isSystem: true },
  { id: 'sys_2', imageUrl: '/memes/meme2.jpg', power: 155, hp: 465, skill: { name: '雷霆万钧', emoji: '⚡', type: 'crit', color: '#ffed4a', baseDamage: 60 }, name: '我就静静看着', isSystem: true },
  { id: 'sys_3', imageUrl: '/memes/meme3.jpg', power: 170, hp: 510, skill: { name: '连击风暴', emoji: '🌀', type: 'stack', color: '#ff2d95', baseDamage: 20 }, name: '呜呜呜我太难了', isSystem: true },
  { id: 'sys_4', imageUrl: '/memes/meme4.jpg', power: 165, hp: 495, skill: { name: '生命绽放', emoji: '💚', type: 'heal', color: '#00ff88', baseDamage: 80 }, name: '我疯了我真的疯了', isSystem: true },
  { id: 'sys_5', imageUrl: '/memes/meme5.jpg', power: 150, hp: 450, skill: { name: '暗黑护盾', emoji: '🛡️', type: 'shield', color: '#b24bf3', baseDamage: 40 }, name: '就挺突然的', isSystem: true },
  { id: 'sys_6', imageUrl: '/memes/meme7.jpg', power: 175, hp: 525, skill: { name: '寒冰锁链', emoji: '❄️', type: 'dot', color: '#00d4ff', baseDamage: 12 }, name: '完了完了要没了', isSystem: true },
  { id: 'sys_7', imageUrl: '/memes/meme9.jpg', power: 160, hp: 480, skill: { name: '天罚之刃', emoji: '👼', type: 'crit', color: '#ffd700', baseDamage: 80 }, name: '小丑竟是我自己', isSystem: true },
  { id: 'sys_8', imageUrl: '/memes/meme10.jpg', power: 180, hp: 540, skill: { name: '幻影连斩', emoji: '🌑', type: 'stack', color: '#6b5b95', baseDamage: 25 }, name: '你礼貌吗', isSystem: true },
  { id: 'sys_9', imageUrl: '/memes/meme11.jpg', power: 165, hp: 495, skill: { name: '雷霆万钧', emoji: '⚡', type: 'crit', color: '#ffed4a', baseDamage: 60 }, name: '就你叫XX啊', isSystem: true },
  // 4 个天王表情包 (使用 SVG emoji)
  { id: 'sys_champ_1', imageUrl: 'data:image/svg+xml,...', power: 200, hp: 1000, skill: { name: '至尊霸斩', emoji: '👑', type: 'crit', color: '#ffd700', baseDamage: 80 }, name: '表情天王', isSystem: true },
  { id: 'sys_champ_2', imageUrl: 'data:image/svg+xml,...', power: 210, hp: 1050, skill: { name: '烈焰风暴', emoji: '🔥', type: 'dot', color: '#ff6b35', baseDamage: 20 }, name: '热血天王', isSystem: true },
  { id: 'sys_champ_3', imageUrl: 'data:image/svg+xml,...', power: 205, hp: 1025, skill: { name: '雷霆万钧', emoji: '⚡', type: 'stack', color: '#ffed4a', baseDamage: 25 }, name: '闪电天王', isSystem: true },
  { id: 'sys_champ_4', imageUrl: 'data:image/svg+xml,...', power: 220, hp: 1100, skill: { name: '绝对防御', emoji: '💎', type: 'shield', color: '#00d4ff', baseDamage: 50 }, name: '钻石天王', isSystem: true },
];

// 内存数据存储
class InMemoryDB {
  users: Map<string, User> = new Map();
  memes: Map<string, Meme> = new Map();
  matches: Match[] = [];

  constructor() {
    // 初始化系统表情包
    SYSTEM_MEMES.forEach(meme => {
      this.memes.set(meme.id, {
        ...meme,
        userId: 'system',
        isActive: false,
        createdAt: Date.now()
      });
    });
  }

  // 用户操作
  createUser(openid: string, nickName: string = '匿名用户', avatarUrl: string = ''): User {
    const user: User = {
      id: uuidv4(),
      openid,
      nickName,
      avatarUrl,
      wins: 0,
      losses: 0,
      badges: [],
      currentMemeId: null,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    this.users.set(openid, user);
    return user;
  }

  getUserByOpenid(openid: string): User | undefined {
    return this.users.get(openid);
  }

  getOrCreateUser(openid: string, nickName?: string, avatarUrl?: string): User {
    let user = this.users.get(openid);
    if (!user) {
      user = this.createUser(openid, nickName, avatarUrl);
    } else if (nickName || avatarUrl) {
      user.nickName = nickName || user.nickName;
      user.avatarUrl = avatarUrl || user.avatarUrl;
      user.updatedAt = Date.now();
    }
    return user;
  }

  updateUserStats(openid: string, won: boolean, badge?: string): User | undefined {
    const user = this.users.get(openid);
    if (user) {
      if (won) {
        user.wins++;
      } else {
        user.losses++;
      }
      if (badge && !user.badges.includes(badge)) {
        user.badges = [...user.badges.slice(0, 4), badge]; // 最多4个徽章
      }
      user.updatedAt = Date.now();
    }
    return user;
  }

  // 表情包操作
  createMeme(userId: string, data: Omit<Meme, 'id' | 'userId' | 'isActive' | 'createdAt'>): Meme {
    const meme: Meme = {
      ...data,
      id: uuidv4(),
      userId,
      isActive: false,
      createdAt: Date.now()
    };
    this.memes.set(meme.id, meme);
    return meme;
  }

  getUserMemes(userId: string): Meme[] {
    return Array.from(this.memes.values()).filter(m => m.userId === userId);
  }

  getActiveMeme(userId: string): Meme | undefined {
    return Array.from(this.memes.values()).find(m => m.userId === userId && m.isActive);
  }

  setActiveMeme(userId: string, memeId: string): Meme | undefined {
    // 取消所有该用户的 active 状态
    this.getUserMemes(userId).forEach(m => {
      m.isActive = false;
    });
    const meme = this.memes.get(memeId);
    if (meme && meme.userId === userId) {
      meme.isActive = true;
      return meme;
    }
    return undefined;
  }

  deleteMeme(memeId: string, userId: string): boolean {
    const meme = this.memes.get(memeId);
    if (meme && meme.userId === userId && !meme.isSystem) {
      return this.memes.delete(memeId);
    }
    return false;
  }

  // 对战记录
  createMatch(data: Omit<Match, 'id' | 'createdAt'>): Match {
    const match: Match = {
      ...data,
      id: uuidv4(),
      createdAt: Date.now()
    };
    this.matches.push(match);
    return match;
  }

  getUserMatches(userId: string, limit: number = 20): Match[] {
    return this.matches
      .filter(m => m.challengerId === userId || m.challengedId === userId)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);
  }

  // 排行榜
  getLeaderboard(topN: number = 10, currentOpenid?: string): LeaderboardEntry[] {
    const users = Array.from(this.users.values())
      .filter(u => u.wins + u.losses > 0)
      .sort((a, b) => b.wins - a.wins || a.losses - b.losses);

    const ranked = users.map((u, index) => ({
      rank: index + 1,
      openid: u.openid,
      nickName: u.nickName,
      avatarUrl: u.avatarUrl,
      wins: u.wins,
      losses: u.losses,
      winRate: u.wins + u.losses > 0 ? Math.round((u.wins / (u.wins + u.losses)) * 1000) / 10 : 0,
      badgeCount: u.badges.length,
      isCurrentUser: currentOpenid ? u.openid === currentOpenid : false
    }));

    // 如果指定了当前用户，确保其在列表中
    if (currentOpenid) {
      const userRank = ranked.find(r => r.openid === currentOpenid);
      const hasUser = ranked.some(r => r.isCurrentUser);

      if (userRank && !hasUser) {
        userRank.isCurrentUser = true;
        // 按排名重新排序，当前用户优先
        ranked.sort((a, b) => {
          if (a.isCurrentUser) return -1;
          if (b.isCurrentUser) return 1;
          return a.rank - b.rank;
        });
      }
    }

    return ranked.slice(0, topN + (currentOpenid ? 1 : 0));
  }

  getUserRank(openid: string): number {
    const leaderboard = this.getLeaderboard(100);
    const entry = leaderboard.find(e => e.openid === openid);
    return entry?.rank || 0;
  }
}

// 导出单例
export const db = new InMemoryDB();
