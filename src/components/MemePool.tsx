/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useRef } from 'react';
import { cn } from '../lib/utils';
import { memeApi, Meme } from '../services/api';

interface MemePoolProps {
  openid?: string;
  onSelectMeme?: (meme: Meme) => void;
  onClose?: () => void;
  selectionMode?: boolean;
}

function MemeCard({
  meme,
  isActive,
  isSystem,
  onSetActive,
  onDelete,
  selectionMode,
  onSelect
}: {
  meme: Meme;
  isActive: boolean;
  isSystem: boolean;
  onSetActive?: () => void;
  onDelete?: () => void;
  selectionMode?: boolean;
  onSelect?: () => void;
}) {
  const skillColors: Record<string, string> = {
    dot: 'text-orange-400 bg-orange-400/20',
    crit: 'text-neon-yellow bg-neon-yellow/20',
    stack: 'text-neon-pink bg-neon-pink/20',
    heal: 'text-neon-green bg-neon-green/20',
    shield: 'text-neon-purple bg-neon-purple/20',
  };

  return (
    <div
      className={cn(
        'relative rounded-xl overflow-hidden transition-all',
        isActive && 'ring-2 ring-neon-purple shadow-lg shadow-neon-purple/30',
        !isActive && 'hover:scale-[1.02] cursor-pointer',
        selectionMode && 'cursor-pointer'
      )}
      onClick={selectionMode ? onSelect : undefined}
    >
      {/* 头像 */}
      <div className="aspect-square bg-dark-card relative">
        <img
          src={meme.imageUrl}
          alt={meme.name}
          className="w-full h-full object-cover"
        />

        {/* 活跃标记 */}
        {isActive && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-neon-purple text-white text-xs font-bold">
            使用中
          </div>
        )}

        {/* 系统标记 */}
        {isSystem && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-dark-border text-gray-400 text-xs">
            系统
          </div>
        )}

        {/* 技能图标 */}
        <div className="absolute bottom-2 left-2">
          <span className="text-xl">{meme.skill.emoji}</span>
        </div>
      </div>

      {/* 信息 */}
      <div className="p-2 bg-dark-card/80">
        <p className="font-bold text-sm truncate">{meme.name}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-400">战力 {meme.power}</span>
          <span className={cn('text-xs px-1.5 py-0.5 rounded', skillColors[meme.skill.type] || 'text-gray-400')}>
            {meme.skill.type === 'dot' && '持续'}
            {meme.skill.type === 'crit' && '暴击'}
            {meme.skill.type === 'stack' && '连击'}
            {meme.skill.type === 'heal' && '治疗'}
            {meme.skill.type === 'shield' && '护盾'}
          </span>
        </div>
      </div>

      {/* 操作按钮 */}
      {!isSystem && (
        <div className="absolute top-2 right-2 flex gap-1">
          {onSetActive && (
            <button
              onClick={(e) => { e.stopPropagation(); onSetActive(); }}
              className={cn(
                'w-7 h-7 rounded-full text-xs font-bold transition-all',
                isActive
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-neon-purple text-white hover:bg-neon-purple/80'
              )}
              disabled={isActive}
              title="设为主战表情包"
            >
              ★
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="w-7 h-7 rounded-full bg-neon-pink/80 text-white text-xs hover:bg-neon-pink transition-colors"
              title="删除"
            >
              ✕
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function MemePool({
  openid,
  onSelectMeme,
  onClose,
  selectionMode = false
}: MemePoolProps) {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMemes();
  }, []);

  const loadMemes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await memeApi.getPool();
      setMemes(data.memes);
    } catch (err) {
      setError('加载表情包失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    try {
      setUploading(true);

      // 读取图片为 base64
      const reader = new FileReader();
      const imageUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // 生成随机属性
      const hash = Date.now();
      const power = (hash % 200) + 100;
      const hp = power * 3;

      const skills = [
        { name: '灼烧印记', emoji: '🔥', type: 'dot' as const, color: '#ff6b35', baseDamage: 15 },
        { name: '雷霆万钧', emoji: '⚡', type: 'crit' as const, color: '#ffed4a', baseDamage: 60 },
        { name: '连击风暴', emoji: '🌀', type: 'stack' as const, color: '#ff2d95', baseDamage: 20 },
        { name: '生命绽放', emoji: '💚', type: 'heal' as const, color: '#00ff88', baseDamage: 80 },
        { name: '暗黑护盾', emoji: '🛡️', type: 'shield' as const, color: '#b24bf3', baseDamage: 40 },
      ];

      const skill = skills[hash % skills.length];

      const prefixes = ['超级', '无敌', '神秘', '黑暗', '光明', '狂野', '冷静', '热血', '霸气', '逗比'];
      const suffixes = ['战士', '侠客', '王者', '魔王', '天使', '恶魔', '骑士', '法师', '忍者', '龙'];
      const name = prefixes[hash % prefixes.length] + suffixes[(hash >> 3) % suffixes.length];

      await memeApi.upload({
        imageUrl,
        power,
        hp,
        skill,
        name,
      });

      await loadMemes();
    } catch (err) {
      alert('上传失败');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleSetActive = async (memeId: string) => {
    try {
      await memeApi.setActive(memeId);
      await loadMemes();
    } catch (err) {
      alert('设置失败');
      console.error(err);
    }
  };

  const handleDelete = async (memeId: string) => {
    if (!confirm('确定删除这个表情包？')) return;

    try {
      await memeApi.delete(memeId);
      await loadMemes();
    } catch (err) {
      alert('删除失败');
      console.error(err);
    }
  };

  const userMemes = memes.filter(m => !m.isSystem);
  const systemMemes = memes.filter(m => m.isSystem);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg max-h-[90vh] bg-dark-bg rounded-2xl overflow-hidden border border-dark-border shadow-2xl flex flex-col">
        {/* Header */}
        <div className="relative p-4 bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 border-b border-dark-border flex-shrink-0">
          <div className="absolute inset-0 bg-grid opacity-10" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🖼️</span>
              <h2 className="text-lg font-black">表情包池</h2>
              <span className="text-xs text-gray-400">
                {userMemes.length}/10
              </span>
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
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-neon-purple border-t-transparent rounded-full animate-spin" />
              <p className="mt-4 text-gray-400">加载中...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-neon-pink">{error}</p>
              <button
                onClick={loadMemes}
                className="mt-4 px-4 py-2 rounded-lg bg-neon-purple/20 text-neon-purple"
              >
                重试
              </button>
            </div>
          ) : (
            <>
              {/* 上传按钮 */}
              {!selectionMode && (
                <div
                  className={cn(
                    'mb-4 p-4 rounded-xl border-2 border-dashed border-dark-border text-center cursor-pointer transition-all hover:border-neon-purple/50',
                    uploading && 'opacity-50 pointer-events-none'
                  )}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                  />
                  <div className="text-3xl mb-2">{uploading ? '⏳' : '📤'}</div>
                  <p className="text-sm text-gray-400">
                    {uploading ? '上传中...' : '点击上传新表情包'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    微信保存表情包后，从相册选择
                  </p>
                </div>
              )}

              {/* 用户表情包 */}
              {userMemes.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-gray-400 mb-2">我的表情包</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {userMemes.map((meme) => (
                      <MemeCard
                        key={meme.id}
                        meme={meme}
                        isActive={meme.isActive}
                        isSystem={false}
                        onSetActive={() => handleSetActive(meme.id)}
                        onDelete={() => handleDelete(meme.id)}
                        selectionMode={selectionMode}
                        onSelect={() => onSelectMeme?.(meme)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* 系统表情包 */}
              {systemMemes.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-400 mb-2">系统表情包</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {systemMemes.map((meme) => (
                      <MemeCard
                        key={meme.id}
                        meme={meme}
                        isActive={false}
                        isSystem={true}
                        selectionMode={selectionMode}
                        onSelect={() => onSelectMeme?.(meme)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {memes.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-4xl mb-4">🖼️</p>
                  <p>还没有表情包</p>
                  <p className="text-sm mt-2">上传一个开始战斗吧！</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-dark-card/50 border-t border-dark-border flex-shrink-0">
          <p className="text-xs text-gray-500 text-center">
            💡 选择表情包作为主战角色参与匹配对战
          </p>
        </div>
      </div>
    </div>
  );
}
