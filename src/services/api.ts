// 基于 localStorage 的 H5 API 服务（无需后端）
import { v4 as uuidv4 } from 'uuid';

// 生成一个伪 openid（用于区分用户）
function getOpenid(): string {
  let openid = localStorage.getItem('emoji_battle_openid');
  if (!openid) {
    openid = 'user_' + uuidv4().substring(0, 8);
    localStorage.setItem('emoji_battle_openid', openid);
  }
  return openid;
}

// 类型定义
export interface Skill {
  name: string;
  emoji: string;
  type: 'dot' | 'crit' | 'stack' | 'heal' | 'shield';
  color: string;
  baseDamage: number;
}

export interface Meme {
  id: string;
  userId: string;
  imageUrl: string;
  power: number;
  hp: number;
  skill: Skill;
  name: string;
  isSystem: boolean;
  isActive: boolean;
  createdAt: number;
}

export interface User {
  id: string;
  openid: string;
  nickName: string;
  avatarUrl: string;
  wins: number;
  losses: number;
  badges: string[];
  currentMemeId: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface Match {
  id: string;
  challengerId: string;
  challengedId: string | null;
  challengerWon: boolean;
  isChampionMatch: boolean;
  challengerPower: number;
  challengedPower: number;
  challengerBadge: string | null;
  createdAt: number;
}

export interface LeaderboardEntry {
  rank: number;
  openid: string;
  nickName: string;
  avatarUrl: string;
  wins: number;
  losses: number;
  winRate: number;
  badgeCount: number;
  isCurrentUser: boolean;
}

// 系统内置表情包（四大天王）- 使用本地图片
export const SYSTEM_MEMES: Meme[] = [
  {
    id: 'system_1',
    userId: 'system',
    imageUrl: '/emoji-battle/memes/meme2.jpg',
    power: 95,
    hp: 285,
    skill: { name: '致命毒液', emoji: '🧪', type: 'dot', color: '#22c55e', baseDamage: 25 },
    name: '表情天王',
    isSystem: true,
    isActive: false,
    createdAt: 0,
  },
  {
    id: 'system_2',
    userId: 'system',
    imageUrl: '/emoji-battle/memes/meme3.jpg',
    power: 88,
    hp: 264,
    skill: { name: '热血怒吼', emoji: '🔥', type: 'stack', color: '#ef4444', baseDamage: 15 },
    name: '热血天王',
    isSystem: true,
    isActive: false,
    createdAt: 0,
  },
  {
    id: 'system_3',
    userId: 'system',
    imageUrl: '/emoji-battle/memes/meme4.jpg',
    power: 82,
    hp: 246,
    skill: { name: '闪电打击', emoji: '⚡', type: 'crit', color: '#eab308', baseDamage: 45 },
    name: '闪电天王',
    isSystem: true,
    isActive: false,
    createdAt: 0,
  },
  {
    id: 'system_4',
    userId: 'system',
    imageUrl: '/emoji-battle/memes/meme5.jpg',
    power: 100,
    hp: 300,
    skill: { name: '钻石护盾', emoji: '💎', type: 'shield', color: '#06b6d4', baseDamage: 0 },
    name: '钻石天王',
    isSystem: true,
    isActive: false,
    createdAt: 0,
  },
];

// 热门表情包（可供用户选择的初始池）
export const HOT_MEMES: Meme[] = [
  {
    id: 'hot_1',
    userId: 'system',
    imageUrl: '/emoji-battle/memes/panda.jpg',
    power: 70,
    hp: 210,
    skill: { name: '卖萌攻击', emoji: '🥺', type: 'stack', color: '#ec4899', baseDamage: 12 },
    name: '委屈巴巴',
    isSystem: true,
    isActive: false,
    createdAt: 0,
  },
  {
    id: 'hot_2',
    userId: 'system',
    imageUrl: '/emoji-battle/memes/meme7.jpg',
    power: 65,
    hp: 195,
    skill: { name: '无语凝视', emoji: '😑', type: 'dot', color: '#6b7280', baseDamage: 18 },
    name: '冷漠脸',
    isSystem: true,
    isActive: false,
    createdAt: 0,
  },
  {
    id: 'hot_3',
    userId: 'system',
    imageUrl: '/emoji-battle/memes/meme9.jpg',
    power: 75,
    hp: 225,
    skill: { name: '大笑攻击', emoji: '🤣', type: 'crit', color: '#f97316', baseDamage: 35 },
    name: '笑到崩溃',
    isSystem: true,
    isActive: false,
    createdAt: 0,
  },
  {
    id: 'hot_4',
    userId: 'system',
    imageUrl: '/emoji-battle/memes/meme10.jpg',
    power: 68,
    hp: 204,
    skill: { name: '震惊一击', emoji: '😱', type: 'crit', color: '#8b5cf6', baseDamage: 40 },
    name: '惊恐万分',
    isSystem: true,
    isActive: false,
    createdAt: 0,
  },
  {
    id: 'hot_5',
    userId: 'system',
    imageUrl: '/emoji-battle/memes/meme11.jpg',
    power: 72,
    hp: 216,
    skill: { name: '得意洋洋', emoji: '😏', type: 'stack', color: '#14b8a6', baseDamage: 14 },
    name: '小人得志',
    isSystem: true,
    isActive: false,
    createdAt: 0,
  },
  {
    id: 'hot_6',
    userId: 'system',
    imageUrl: '/emoji-battle/memes/panda.jpg',
    power: 60,
    hp: 180,
    skill: { name: '哭泣治疗', emoji: '😭', type: 'heal', color: '#3b82f6', baseDamage: 20 },
    name: '痛哭流涕',
    isSystem: true,
    isActive: false,
    createdAt: 0,
  },
  {
    id: 'hot_7',
    userId: 'system',
    imageUrl: '/emoji-battle/memes/meme3.jpg',
    power: 78,
    hp: 234,
    skill: { name: '无语反击', emoji: '🙄', type: 'dot', color: '#a855f7', baseDamage: 22 },
    name: '翻白眼',
    isSystem: true,
    isActive: false,
    createdAt: 0,
  },
  {
    id: 'hot_8',
    userId: 'system',
    imageUrl: '/emoji-battle/memes/meme4.jpg',
    power: 85,
    hp: 255,
    skill: { name: '666冲击', emoji: '6️⃣', type: 'crit', color: '#22d3ee', baseDamage: 50 },
    name: '666大佬',
    isSystem: true,
    isActive: false,
    createdAt: 0,
  },
  {
    id: 'hot_9',
    userId: 'system',
    imageUrl: '/emoji-battle/memes/panda.jpg',
    power: 55,
    hp: 165,
    skill: { name: '狗头护体', emoji: '🐕', type: 'shield', color: '#d97706', baseDamage: 0 },
    name: '狗头保命',
    isSystem: true,
    isActive: false,
    createdAt: 0,
  },
  {
    id: 'hot_10',
    userId: 'system',
    imageUrl: '/emoji-battle/memes/meme7.jpg',
    power: 80,
    hp: 240,
    skill: { name: 'doge闪避', emoji: '✈️', type: 'shield', color: '#fbbf24', baseDamage: 0 },
    name: 'flying doge',
    isSystem: true,
    isActive: false,
    createdAt: 0,
  },
];

// 本地存储键名
const STORAGE_KEYS = {
  USER: 'emoji_battle_user',
  MATCHES: 'emoji_battle_matches',
  MEMES: 'emoji_battle_memes',
};

// 延迟模拟（让异步操作更真实）
function delay(ms: number = 100): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 用户 API
export const userApi = {
  async getInfo(): Promise<{ user: User }> {
    await delay();
    const openid = getOpenid();
    const stored = localStorage.getItem(STORAGE_KEYS.USER);
    if (stored) {
      return { user: JSON.parse(stored) };
    }
    // 创建新用户
    const user: User = {
      id: uuidv4(),
      openid,
      nickName: '玩家' + openid.substring(5, 9),
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${openid}`,
      wins: 0,
      losses: 0,
      badges: [],
      currentMemeId: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    return { user };
  },

  async register(nickName?: string, avatarUrl?: string): Promise<{ user: User }> {
    await delay();
    const openid = getOpenid();
    const user: User = {
      id: uuidv4(),
      openid,
      nickName: nickName || '玩家' + openid.substring(5, 9),
      avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${openid}`,
      wins: 0,
      losses: 0,
      badges: [],
      currentMemeId: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    return { user };
  },

  async updateCurrentMeme(memeId: string): Promise<{ meme: Meme; user: User }> {
    await delay();
    const user = (await this.getInfo()).user;
    user.currentMemeId = memeId;
    user.updatedAt = Date.now();
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

    // 获取对应的表情包
    const meme = await memeApi.getPool().then(res => res.memes.find(m => m.id === memeId));

    return { meme: meme!, user };
  },

  async updateStats(won: boolean, badge?: string): Promise<{ user: User }> {
    await delay();
    const user = (await this.getInfo()).user;
    if (won) {
      user.wins++;
    } else {
      user.losses++;
    }
    if (badge && !user.badges.includes(badge)) {
      user.badges.push(badge);
    }
    user.updatedAt = Date.now();
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    return { user };
  },
};

// 表情包 API
export const memeApi = {
  async getPool(): Promise<{ memes: Meme[] }> {
    await delay();
    const openid = getOpenid();

    // 获取用户自定义表情包
    const stored = localStorage.getItem(STORAGE_KEYS.MEMES);
    const userMemes: Meme[] = stored ? JSON.parse(stored) : [];

    // 获取当前用户选中的表情包
    const { user } = await userApi.getInfo();

    // 合并：系统表情包 + 用户表情包
    const allMemes = [
      ...SYSTEM_MEMES,
      ...HOT_MEMES,
      ...userMemes.map(m => ({ ...m, userId: openid }))
    ];

    // 标记当前选中的表情包
    return {
      memes: allMemes.map(m => ({
        ...m,
        isActive: m.userId === openid && m.id === user.currentMemeId
      }))
    };
  },

  async upload(data: {
    imageUrl: string;
    power: number;
    hp: number;
    skill: Skill;
    name: string;
  }): Promise<{ meme: Meme }> {
    await delay(300); // 模拟上传延迟
    const openid = getOpenid();

    const meme: Meme = {
      id: 'meme_' + uuidv4().substring(0, 8),
      userId: openid,
      imageUrl: data.imageUrl,
      power: data.power,
      hp: data.hp,
      skill: data.skill,
      name: data.name,
      isSystem: false,
      isActive: false,
      createdAt: Date.now(),
    };

    // 保存到本地存储
    const stored = localStorage.getItem(STORAGE_KEYS.MEMES);
    const memes: Meme[] = stored ? JSON.parse(stored) : [];

    // 检查是否超过10个
    if (memes.filter(m => m.userId === openid).length >= 10) {
      throw new Error('最多只能上传10个表情包');
    }

    memes.push(meme);
    localStorage.setItem(STORAGE_KEYS.MEMES, JSON.stringify(memes));

    return { meme };
  },

  async setActive(memeId: string): Promise<{ meme: Meme }> {
    await delay();
    const openid = getOpenid();

    // 更新用户当前表情包
    const { user } = await userApi.getInfo();
    user.currentMemeId = memeId;
    user.updatedAt = Date.now();
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

    const { memes } = await this.getPool();
    const meme = memes.find(m => m.id === memeId && m.userId === openid);

    if (!meme) {
      throw new Error('表情包不存在');
    }

    return { meme };
  },

  async delete(memeId: string): Promise<{ success: boolean }> {
    await delay();
    const openid = getOpenid();

    const stored = localStorage.getItem(STORAGE_KEYS.MEMES);
    const memes: Meme[] = stored ? JSON.parse(stored) : [];

    const filtered = memes.filter(m => !(m.id === memeId && m.userId === openid));

    if (filtered.length === memes.length) {
      throw new Error('表情包不存在或无权删除');
    }

    localStorage.setItem(STORAGE_KEYS.MEMES, JSON.stringify(filtered));

    // 如果删除的是当前选中的，清除选中
    const { user } = await userApi.getInfo();
    if (user.currentMemeId === memeId) {
      user.currentMemeId = null;
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }

    return { success: true };
  },
};

// 对战 API
export const matchApi = {
  async create(data: {
    challengedId?: string;
    challengerWon: boolean;
    isChampionMatch: boolean;
    challengerPower: number;
    challengedPower: number;
    challengerBadge?: string;
  }): Promise<{ match: Match }> {
    await delay();
    const openid = getOpenid();

    const match: Match = {
      id: 'match_' + uuidv4(),
      challengerId: openid,
      challengedId: data.challengedId || null,
      challengerWon: data.challengerWon,
      isChampionMatch: data.isChampionMatch,
      challengerPower: data.challengerPower,
      challengedPower: data.challengedPower,
      challengerBadge: data.challengerBadge || null,
      createdAt: Date.now(),
    };

    const stored = localStorage.getItem(STORAGE_KEYS.MATCHES);
    const matches: Match[] = stored ? JSON.parse(stored) : [];
    matches.unshift(match); // 新记录在前

    // 只保留最近100条
    if (matches.length > 100) {
      matches.splice(100);
    }

    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));

    return { match };
  },

  async getHistory(limit: number = 20): Promise<{ matches: Match[] }> {
    await delay();
    const stored = localStorage.getItem(STORAGE_KEYS.MATCHES);
    const matches: Match[] = stored ? JSON.parse(stored) : [];
    return { matches: matches.slice(0, limit) };
  },

  async getLeaderboard(top: number = 10): Promise<{ leaderboard: LeaderboardEntry[]; userRank: number }> {
    await delay();

    // 从所有 localStorage 数据中收集用户
    // 注意：这是单设备数据，如果需要真正排行榜需要后端
    const openid = getOpenid();
    const entries: LeaderboardEntry[] = [];

    // 当前用户
    const { user } = await userApi.getInfo();
    const totalGames = user.wins + user.losses;
    entries.push({
      rank: 0,
      openid: user.openid,
      nickName: user.nickName,
      avatarUrl: user.avatarUrl,
      wins: user.wins,
      losses: user.losses,
      winRate: totalGames > 0 ? Math.round((user.wins / totalGames) * 100) : 0,
      badgeCount: user.badges.length,
      isCurrentUser: true,
    });

    // 排序
    entries.sort((a, b) => {
      // 先按胜率，再按胜场，再按徽章数
      if (b.winRate !== a.winRate) return b.winRate - a.winRate;
      if (b.wins !== a.wins) return b.wins - a.wins;
      return b.badgeCount - a.badgeCount;
    });

    // 添加排名
    entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    const userRank = entries.findIndex(e => e.isCurrentUser) + 1;

    return {
      leaderboard: entries.slice(0, top),
      userRank,
    };
  },
};

// 徽章定义
export const BADGES = {
  champion_expression: { id: 'champion_expression', name: '挑战表情天王成功', emoji: '👑' },
  champion_passion: { id: 'champion_passion', name: '挑战热血天王成功', emoji: '🔥' },
  champion_lightning: { id: 'champion_lightning', name: '挑战闪电天王成功', emoji: '⚡' },
  champion_diamond: { id: 'champion_diamond', name: '挑战钻石天王成功', emoji: '💎' },
} as const;

export type BadgeId = keyof typeof BADGES;
