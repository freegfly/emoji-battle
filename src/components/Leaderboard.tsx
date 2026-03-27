/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { matchApi, BADGES, LeaderboardEntry } from '../services/api';

interface LeaderboardProps {
  currentOpenid?: string;
  onClose?: () => void;
}

function BadgeIcon({ badgeId }: { badgeId: string }) {
  const badge = Object.values(BADGES).find(b => b.id === badgeId);
  if (!badge) return null;
  return (
    <span
      className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs"
      style={{ backgroundColor: '#ffd70030', color: '#ffd700' }}
      title={badge.name}
    >
      {badge.emoji}
    </span>
  );
}

function LeaderboardItem({ entry, isUser }: { entry: LeaderboardEntry; isUser: boolean }) {
  const rankColors: Record<number, string> = {
    1: 'text-neon-yellow bg-neon-yellow/20 border-neon-yellow',
    2: 'text-gray-300 bg-gray-500/20 border-gray-400',
    3: 'text-orange-400 bg-orange-400/20 border-orange-400',
  };

  const rankStyle = rankColors[entry.rank] || 'text-gray-400 bg-dark-card border-dark-border';

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl transition-all',
        isUser && 'bg-neon-purple/10 border border-neon-purple/30',
        !isUser && 'bg-dark-card/50'
      )}
    >
      {/* 排名 */}
      <div
        className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm border',
          rankStyle
        )}
      >
        {entry.rank <= 3 ? (
          <span>{entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}</span>
        ) : (
          <span>{entry.rank}</span>
        )}
      </div>

      {/* 头像 */}
      <div className="w-10 h-10 rounded-full overflow-hidden bg-dark-border flex-shrink-0">
        {entry.avatarUrl ? (
          <img src={entry.avatarUrl} alt={entry.nickName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xl">👤</div>
        )}
      </div>

      {/* 信息 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-bold text-sm truncate">{entry.nickName}</p>
          {isUser && (
            <span className="px-1.5 py-0.5 rounded text-xs bg-neon-purple/30 text-neon-purple">
              我
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
          <span>胜 {entry.wins}</span>
          <span>败 {entry.losses}</span>
          <span className="text-neon-green">{entry.winRate}%</span>
        </div>
      </div>

      {/* 徽章 */}
      {entry.badgeCount > 0 && (
        <div className="flex -space-x-1">
          {Array.from({ length: Math.min(entry.badgeCount, 4) }).map((_, i) => (
            <BadgeIcon key={i} badgeId={Object.keys(BADGES)[i]} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Leaderboard({ currentOpenid, onClose }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await matchApi.getLeaderboard(10);
      setLeaderboard(data.leaderboard);
    } catch (err) {
      setError('加载排行榜失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-dark-bg rounded-2xl overflow-hidden border border-dark-border shadow-2xl">
        {/* Header */}
        <div className="relative p-4 bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 border-b border-dark-border">
          <div className="absolute inset-0 bg-grid opacity-10" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏆</span>
              <h2 className="text-lg font-black">战绩排行</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-dark-card flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-neon-purple border-t-transparent rounded-full animate-spin" />
              <p className="mt-4 text-gray-400">加载中...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-neon-pink">{error}</p>
              <button
                onClick={loadLeaderboard}
                className="mt-4 px-4 py-2 rounded-lg bg-neon-purple/20 text-neon-purple"
              >
                重试
              </button>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-4">📊</p>
              <p>暂无排行数据</p>
              <p className="text-sm mt-2">开始战斗后即可上榜！</p>
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry) => (
                <LeaderboardItem
                  key={entry.openid}
                  entry={entry}
                  isUser={entry.isCurrentUser}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-dark-card/50 border-t border-dark-border text-center">
          <p className="text-xs text-gray-500">
            🏆 击败天王可获得专属徽章！
          </p>
        </div>
      </div>
    </div>
  );
}
