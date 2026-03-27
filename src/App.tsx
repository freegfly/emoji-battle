/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from './lib/utils'
import Leaderboard from './components/Leaderboard'
import MemePool from './components/MemePool'
import { userApi } from './services/api'

// ============ Types ============
interface Player {
  id: string
  name: string
  imageUrl: string
  power: number
  hp: number
  maxHp: number
  skill: Skill
  isChampion?: boolean
  championTitle?: string
}

interface Skill {
  name: string
  description: string
  emoji: string
  color: string
  type: 'dot' | 'crit' | 'stack' | 'heal' | 'shield'
  baseDamage: number
}

interface BattleLog {
  id: number
  text: string
  type: 'normal' | 'crit' | 'dot' | 'stack' | 'heal' | 'system'
  attacker: 'player' | 'enemy' | 'system'
}

interface Effect {
  id: number
  emoji: string
  x: number
  y: number
  color: string
}

interface Badge {
  id: string
  name: string
  emoji: string
  color: string
  earnedAt: number
}

type GamePhase = 'upload' | 'matching' | 'battle' | 'result'

// ============ Built-in Meme Images ============
const REGULAR_ENEMIES = [
  { image: '/emoji-battle/memes/panda.jpg', name: '老爷保号保号', power: 155 },
  { image: '/emoji-battle/memes/meme3.jpg', name: '呜呜呜我太难了', power: 170 },
  { image: '/emoji-battle/memes/meme4.jpg', name: '我疯了我真的疯了', power: 165 },
  { image: '/emoji-battle/memes/meme5.jpg', name: '就挺突然的', power: 150 },
  { image: '/emoji-battle/memes/meme7.jpg', name: '完了完了要没了', power: 175 },
  { image: '/emoji-battle/memes/meme9.jpg', name: '小丑竟是我自己', power: 160 },
  { image: '/emoji-battle/memes/meme2.jpg', name: '我就静静看着', power: 155 },
  { image: '/emoji-battle/memes/meme10.jpg', name: '你礼貌吗', power: 180 },
  { image: '/emoji-battle/memes/meme11.jpg', name: '就你叫XX啊', power: 165 },
]

// 4 Champions (Heavenly Kings) - 1.5x HP
const CHAMPIONS = [
  { emoji: '👑', name: '表情天王', power: 200, title: '挑战表情天王成功', skill: '至尊霸斩', skillType: 'crit' as const },
  { emoji: '🔥', name: '热血天王', power: 210, title: '挑战热血天王成功', skill: '烈焰风暴', skillType: 'dot' as const },
  { emoji: '⚡', name: '闪电天王', power: 205, title: '挑战闪电天王成功', skill: '雷霆万钧', skillType: 'stack' as const },
  { emoji: '💎', name: '钻石天王', power: 220, title: '挑战钻石天王成功', skill: '绝对防御', skillType: 'shield' as const },
]

function createSvgEmoji(emoji: string): string {
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="#15151f" width="100" height="100" rx="20"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="60">${emoji}</text></svg>`)}`
}

// ============ Utils ============
function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

function generateSkill(hash: number, forcedType?: string): Skill {
  const skills: Skill[] = [
    { name: '灼烧印记', description: '持续灼烧伤害', emoji: '🔥', color: '#ff6b35', type: 'dot', baseDamage: 15 },
    { name: '雷霆万钧', description: '暴击伤害翻倍', emoji: '⚡', color: '#ffed4a', type: 'crit', baseDamage: 60 },
    { name: '连击风暴', description: '连击伤害叠加', emoji: '🌀', color: '#ff2d95', type: 'stack', baseDamage: 20 },
    { name: '生命绽放', description: '恢复生命值', emoji: '💚', color: '#00ff88', type: 'heal', baseDamage: 80 },
    { name: '暗黑护盾', description: '减免伤害', emoji: '🛡️', color: '#b24bf3', type: 'shield', baseDamage: 40 },
    { name: '寒冰锁链', description: '持续冻结伤害', emoji: '❄️', color: '#00d4ff', type: 'dot', baseDamage: 12 },
    { name: '天罚之刃', description: '致命暴击', emoji: '👼', color: '#ffd700', type: 'crit', baseDamage: 80 },
    { name: '幻影连斩', description: '连续攻击叠加', emoji: '🌑', color: '#6b5b95', type: 'stack', baseDamage: 25 },
  ]

  if (forcedType) {
    const forced = skills.find(s => s.type === forcedType)
    if (forced) return forced
  }

  return skills[hash % skills.length]
}

// ============ Components ============
interface UploadPhaseProps {
  onUpload: (file: File) => void
  badges: Badge[]
  onOpenLeaderboard: () => void
  onOpenMemePool: () => void
  userStats?: { wins: number; losses: number; winRate: number }
}

function UploadPhase({ onUpload, badges, onOpenLeaderboard, onOpenMemePool, userStats }: UploadPhaseProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 relative">
      <div className="absolute inset-0 bg-grid opacity-30 sm:opacity-50" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-8 sm:top-20 left-4 sm:left-10 text-5xl sm:text-8xl opacity-15 sm:opacity-20 animate-float">⚔️</div>
        <div className="absolute top-16 sm:top-40 right-4 sm:right-20 text-4xl sm:text-6xl opacity-10 sm:opacity-15 animate-float" style={{ animationDelay: '0.5s' }}>💥</div>
        <div className="absolute bottom-24 sm:bottom-40 left-8 sm:left-20 text-5xl sm:text-7xl opacity-15 sm:opacity-20 animate-float" style={{ animationDelay: '1s' }}>🎭</div>
        <div className="absolute bottom-12 sm:bottom-20 right-4 sm:right-10 text-5xl sm:text-8xl opacity-10 sm:opacity-15 animate-float" style={{ animationDelay: '1.5s' }}>🔥</div>
      </div>

      <div className="relative z-10 w-full max-w-sm sm:max-w-md">
        {/* Header with buttons */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              <span className="text-neon-purple neon-text">表情包</span>
              <span className="text-white mx-1 sm:mx-2">VS</span>
              <span className="text-neon-green neon-text">对战</span>
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm">上传你的表情包，开启战斗之旅</p>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={onOpenLeaderboard}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-dark-card/80 border border-dark-border hover:border-neon-yellow/50 transition-colors"
            >
              <span>🏆</span>
              <span className="text-xs font-bold text-neon-yellow">排行</span>
            </button>
            <button
              onClick={onOpenMemePool}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-dark-card/80 border border-dark-border hover:border-neon-purple/50 transition-colors"
            >
              <span>🖼️</span>
              <span className="text-xs font-bold text-neon-purple">图库</span>
            </button>
          </div>
        </div>

        {/* User Stats */}
        {userStats && (userStats.wins + userStats.losses > 0) && (
          <div className="mb-4 p-3 bg-dark-card/50 rounded-xl border border-dark-border">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <span className="text-neon-green">胜 {userStats.wins}</span>
                <span className="text-neon-pink">败 {userStats.losses}</span>
              </div>
              <span className="text-neon-yellow font-bold">{userStats.winRate}%</span>
            </div>
          </div>
        )}

        {/* Badges Display */}
        {badges.length > 0 && (
          <div className="mb-4 p-3 bg-dark-card/50 rounded-xl border border-dark-border">
            <p className="text-xs text-gray-400 mb-2 text-center">🏆 获得的天王徽章</p>
            <div className="flex flex-wrap justify-center gap-2">
              {badges.map(badge => (
                <div
                  key={badge.id}
                  className="flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                  style={{ backgroundColor: badge.color + '30', color: badge.color }}
                >
                  <span>{badge.emoji}</span>
                  <span className="hidden sm:inline">{badge.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div
          className={cn(
            'upload-zone relative cursor-pointer',
            isDragging && 'dragging'
          )}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); const file = e.dataTransfer.files[0]; if (file) handleFile(file) }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />

          {preview ? (
            <div className="relative">
              <img src={preview} alt="Preview" className="w-32 h-32 sm:w-40 sm:h-40 mx-auto rounded-2xl object-cover shadow-neon-purple animate-glow" />
              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-neon-pink text-white text-xs px-2 py-0.5 sm:px-3 sm:py-1 rounded-full font-bold">
                已选择
              </div>
            </div>
          ) : (
            <div className="py-6 sm:py-8">
              <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">📤</div>
              <p className="text-gray-300 mb-1 sm:mb-2 text-sm sm:text-base">点击或拖拽上传表情包</p>
              <p className="text-gray-500 text-xs">支持 JPG, PNG, GIF 等格式</p>
            </div>
          )}
        </div>

        <button
          onClick={() => fileInputRef.current?.files?.[0] && onUpload(fileInputRef.current.files[0])}
          disabled={!preview}
          className={cn('w-full mt-4 sm:mt-6 py-3 sm:py-4 rounded-xl font-black text-base sm:text-lg transition-all duration-300', preview ? 'btn-primary' : 'bg-dark-border text-gray-500 cursor-not-allowed')}
        >
          ⚔️ 开始战斗
        </button>

        <div className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-xl bg-dark-card/50 border border-dark-border">
          <p className="text-xs sm:text-sm text-gray-400 text-center">
            💡 击败4大天王可获得专属徽章！
          </p>
        </div>
      </div>
    </div>
  )
}

function MatchingPhase({ isChampionMatch }: { isChampionMatch: boolean }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="text-center">
        <div className="relative w-28 h-28 sm:w-40 sm:h-40 mx-auto mb-6 sm:mb-10">
          <div className="absolute inset-0 animate-spin-slow">
            <span className="absolute top-0 left-1/2 -translate-x-1/2 text-2xl sm:text-3xl">⚔️</span>
          </div>
          <div className="absolute inset-0 animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '12s' }}>
            <span className="absolute bottom-2 right-2 text-xl sm:text-2xl">💥</span>
          </div>
          <div className="absolute inset-0 animate-spin-slow" style={{ animationDuration: '16s' }}>
            <span className="absolute bottom-0 left-2 text-lg sm:text-xl">✨</span>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl sm:text-6xl animate-pulse">{isChampionMatch ? '👑' : '🎮'}</span>
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-black mb-4 sm:mb-6" style={{ fontFamily: 'Orbitron, sans-serif' }}>
          {isChampionMatch ? (
            <>
              <span className="text-neon-yellow">天王挑战</span>
              <span className="text-white mx-1">匹配中...</span>
            </>
          ) : (
            <>
              <span className="text-neon-purple">正在</span>
              <span className="text-white mx-1">匹配</span>
              <span className="text-neon-green">对手</span>
              <span className="text-neon-pink">...</span>
            </>
          )}
        </h2>

        <div className="flex items-center justify-center gap-2 sm:gap-3">
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-neon-purple rounded-full loading-dot" />
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-neon-green rounded-full loading-dot" />
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-neon-pink rounded-full loading-dot" />
        </div>

        {isChampionMatch && (
          <p className="text-xs text-neon-yellow mt-4 animate-pulse">
            ⚠️ 天王拥有1.5倍血量，小心应对！
          </p>
        )}
      </div>
    </div>
  )
}

function BattleEffects({ effects }: { effects: Effect[] }) {
  return (
    <>
      {effects.map(effect => (
        <div
          key={effect.id}
          className="absolute text-2xl sm:text-3xl animate-particle pointer-events-none"
          style={{
            left: `${effect.x}%`,
            top: `${effect.y}%`,
            color: effect.color,
            transform: 'translate(-50%, -50%)'
          }}
        >
          {effect.emoji}
        </div>
      ))}
    </>
  )
}

function BattlePhase({ player, enemy, logs, timeLeft, playerHp, enemyHp, playerEffects, enemyEffects, playerCombo, enemyCombo, playerShaking, enemyShaking }: {
  player: Player
  enemy: Player
  logs: BattleLog[]
  timeLeft: number
  playerHp: number
  enemyHp: number
  playerEffects: Effect[]
  enemyEffects: Effect[]
  playerCombo: number
  enemyCombo: number
  playerShaking: boolean
  enemyShaking: boolean
}) {
  const getHpPercent = (hp: number, maxHp: number) => Math.max(0, (hp / maxHp) * 100)
  const getHpColor = (percent: number) => {
    if (percent > 60) return 'bg-neon-green'
    if (percent > 30) return 'bg-neon-yellow'
    return 'bg-neon-pink'
  }

  const playerHpPercent = getHpPercent(playerHp, player.maxHp)
  const enemyHpPercent = getHpPercent(enemyHp, enemy.maxHp)

  return (
    <div className="min-h-screen flex flex-col p-2 sm:p-4 relative">
      <div className="absolute inset-0 bg-grid opacity-20" />

      {/* Champion Banner */}
      {enemy.isChampion && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-20 bg-gradient-to-r from-neon-yellow/20 via-yellow-500/30 to-neon-yellow/20 border border-neon-yellow/50 rounded-full px-4 py-1 animate-pulse">
          <span className="text-neon-yellow text-xs sm:text-sm font-black">👑 {enemy.name} 👑</span>
        </div>
      )}

      {/* Timer */}
      <div className="flex justify-center mb-2 sm:mb-4 relative z-10">
        <div className={cn(
          'px-4 sm:px-6 py-1.5 sm:py-2 rounded-full font-black text-sm sm:text-lg',
          timeLeft > 10 ? 'border-2 border-neon-green text-neon-green' :
          timeLeft > 5 ? 'border-2 border-neon-yellow text-neon-yellow' :
          'border-2 border-neon-pink text-neon-pink animate-pulse'
        )}>
          ⏱️ {timeLeft}s
        </div>
      </div>

      {/* Battle Arena */}
      <div className="flex-1 flex items-center justify-between gap-2 sm:gap-4 mb-2 sm:mb-4 relative z-10">
        {/* Player */}
        <div className="flex-1 flex flex-col items-center max-w-[35vw] sm:max-w-none">
          <div className="relative">
            <div className={cn(
              'w-20 h-20 sm:w-28 sm:w-36 sm:h-36 rounded-xl sm:rounded-2xl bg-dark-card border-2 border-neon-purple overflow-hidden shadow-neon-purple transition-transform',
              playerShaking && 'animate-shake',
              playerHp <= 0 && 'opacity-50'
            )}>
              <img src={player.imageUrl} alt={player.name} className="w-full h-full object-cover" />
            </div>
            <BattleEffects effects={playerEffects} />
            {playerCombo > 1 && (
              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-neon-pink text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-black animate-pulse">
                x{playerCombo}
              </div>
            )}
          </div>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm font-bold text-neon-purple truncate max-w-[25vw] sm:max-w-28">{player.name}</p>

          <div className="w-20 sm:w-28 md:w-36 mt-1">
            <div className="h-2 sm:h-3 bg-dark-border rounded-full overflow-hidden">
              <div className={cn('h-full hp-bar', getHpColor(playerHpPercent))} style={{ width: `${playerHpPercent}%` }} />
            </div>
            <p className="text-xs text-center text-gray-400 mt-0.5 sm:mt-1 font-mono">
              {Math.max(0, playerHp)}/{player.maxHp}
            </p>
          </div>

          <div className="mt-1 sm:mt-2 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs flex items-center gap-1" style={{ backgroundColor: player.skill.color + '30', color: player.skill.color }}>
            <span>{player.skill.emoji}</span>
            <span className="hidden sm:inline">{player.skill.name}</span>
          </div>
        </div>

        <div className={cn('flex flex-col items-center px-1 sm:px-2 transition-transform', enemyShaking && 'animate-shake')}>
          <span className="text-2xl sm:text-3xl md:text-4xl animate-pulse">⚔️</span>
          <p className="text-xs text-gray-500 mt-0.5">VS</p>
        </div>

        {/* Enemy */}
        <div className="flex-1 flex flex-col items-center max-w-[35vw] sm:max-w-none">
          <div className="relative">
            <div className={cn(
              'w-20 h-20 sm:w-28 sm:w-36 sm:h-36 rounded-xl sm:rounded-2xl bg-dark-card overflow-hidden transition-transform',
              enemy.isChampion ? 'border-2 border-neon-yellow shadow-neon-yellow' : 'border-2 border-neon-pink shadow-neon-pink',
              enemyShaking && 'animate-shake',
              enemyHp <= 0 && 'opacity-50'
            )}>
              <img src={enemy.imageUrl} alt={enemy.name} className="w-full h-full object-cover" />
            </div>
            <BattleEffects effects={enemyEffects} />
            {enemyCombo > 1 && (
              <div className="absolute -top-1 -left-1 sm:-top-2 sm:-left-2 bg-neon-purple text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-black animate-pulse">
                x{enemyCombo}
              </div>
            )}
          </div>
          <p className={cn('mt-1 sm:mt-2 text-xs sm:text-sm font-bold truncate max-w-[25vw] sm:max-w-28', enemy.isChampion ? 'text-neon-yellow' : 'text-neon-pink')}>
            {enemy.isChampion && '👑'}{enemy.name}{enemy.isChampion && '👑'}
          </p>

          <div className="w-20 sm:w-28 md:w-36 mt-1">
            <div className="h-2 sm:h-3 bg-dark-border rounded-full overflow-hidden">
              <div className={cn('h-full hp-bar', getHpColor(enemyHpPercent))} style={{ width: `${enemyHpPercent}%` }} />
            </div>
            <p className="text-xs text-center text-gray-400 mt-0.5 sm:mt-1 font-mono">
              {Math.max(0, enemyHp)}/{enemy.maxHp}
              {enemy.isChampion && <span className="text-neon-yellow ml-1">(天王)</span>}
            </p>
          </div>

          <div className="mt-1 sm:mt-2 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs flex items-center gap-1" style={{ backgroundColor: enemy.skill.color + '30', color: enemy.skill.color }}>
            <span>{enemy.skill.emoji}</span>
            <span className="hidden sm:inline">{enemy.skill.name}</span>
          </div>
        </div>
      </div>

      {/* Battle Log */}
      <div className="flex-1 bg-dark-card/80 rounded-lg sm:rounded-xl p-2 sm:p-4 mb-2 sm:mb-4 overflow-y-auto max-h-[25vh] sm:max-h-40 border border-dark-border relative z-10">
        {logs.slice(-12).map((log) => (
          <div key={log.id} className={cn(
            'text-xs sm:text-sm mb-1 sm:mb-2 animate-slide-up',
            log.type === 'crit' && 'text-neon-yellow font-bold',
            log.type === 'dot' && 'text-orange-400 font-medium',
            log.type === 'stack' && 'text-neon-pink font-bold',
            log.type === 'heal' && 'text-neon-green font-bold',
            log.type === 'system' && 'text-gray-400 italic',
            log.attacker === 'player' && !log.type.includes('system') && 'text-neon-purple',
            log.attacker === 'enemy' && !log.type.includes('system') && (enemy.isChampion ? 'text-neon-yellow' : 'text-neon-pink')
          )}>
            {log.text}
          </div>
        ))}
        {logs.length === 0 && <p className="text-gray-500 text-center text-xs sm:text-sm">⚔️ 战斗即将开始...</p>}
      </div>
    </div>
  )
}

function ResultPhase({ playerWon, player, enemy, onNextRound, newBadge, onChangeMeme, onGoHome }: {
  playerWon: boolean
  player: Player
  enemy: Player
  onNextRound: () => void
  newBadge: Badge | null
  onChangeMeme: () => void
  onGoHome: () => void
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 relative">
      <div className="absolute inset-0 bg-grid opacity-30" />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {playerWon && (
          <>
            <div className="absolute top-12 sm:top-20 left-8 sm:left-10 text-4xl sm:text-5xl opacity-30 animate-float">🏆</div>
            <div className="absolute top-32 sm:top-40 right-12 sm:right-16 text-3xl sm:text-4xl opacity-25 animate-float" style={{ animationDelay: '0.5s' }}>⭐</div>
            <div className="absolute bottom-32 sm:bottom-40 left-16 sm:left-20 text-5xl sm:text-6xl opacity-20 animate-float" style={{ animationDelay: '1s' }}>✨</div>
          </>
        )}
      </div>

      <div className="relative z-10 w-full max-w-sm sm:max-w-md">
        {/* New Badge Earned! */}
        {newBadge && (
          <div className="mb-4 p-4 bg-gradient-to-r from-neon-yellow/20 to-yellow-500/20 border-2 border-neon-yellow rounded-2xl text-center animate-slide-up">
            <div className="text-5xl sm:text-6xl mb-2 animate-pulse">{newBadge.emoji}</div>
            <h2 className="text-lg sm:text-xl font-black text-neon-yellow mb-1">🎉 获得新徽章！</h2>
            <p className="text-sm text-gray-300">{newBadge.name}</p>
          </div>
        )}

        <div className="text-center mb-6 sm:mb-8 animate-slide-up" style={{ animationDelay: newBadge ? '0.1s' : '0s' }}>
          <div className="text-6xl sm:text-8xl mb-3 sm:mb-4">{playerWon ? '🏆' : '💔'}</div>
          <h1 className="text-3xl sm:text-4xl font-black mb-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            <span className={playerWon ? 'text-neon-yellow neon-text' : 'text-neon-pink'}>
              {playerWon ? '胜 利' : '失 败'}
            </span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
            {enemy.isChampion
              ? playerWon ? '你击败了天王！' : '天王太强了，再接再厉！'
              : playerWon ? '恭喜你击败了对手！' : '下次再接再厉！'}
          </p>
        </div>

        <div className="w-full bg-dark-card/80 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-8 border border-dark-border animate-slide-up" style={{ animationDelay: newBadge ? '0.2s' : '0.1s' }}>
          <h3 className="text-center text-xs sm:text-sm font-bold text-gray-400 mb-3 sm:mb-4">⚔️ 战斗统计</h3>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex-1 text-center">
              <img src={player.imageUrl} alt={player.name} className="w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-xl object-cover border-2 border-neon-purple" />
              <p className="text-xs sm:text-sm font-bold text-neon-purple mt-1 sm:mt-2">{player.name}</p>
              <p className="text-xs text-gray-400">战力 {player.power}</p>
            </div>
            <div className="text-xl sm:text-2xl font-black text-gray-500">VS</div>
            <div className="flex-1 text-center">
              <div className={cn('relative inline-block')}>
                <img src={enemy.imageUrl} alt={enemy.name} className={cn('w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-xl object-cover border-2', enemy.isChampion ? 'border-neon-yellow' : 'border-2 border-neon-pink')} />
                {enemy.isChampion && <span className="absolute -top-1 -right-1 text-sm">👑</span>}
              </div>
              <p className={cn('text-xs sm:text-sm font-bold mt-1 sm:mt-2', enemy.isChampion ? 'text-neon-yellow' : 'text-neon-pink')}>{enemy.name}</p>
              <p className="text-xs text-gray-400">战力 {enemy.power}{enemy.isChampion && ' (天王)'}</p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">
              {playerWon
                ? `造成 ${player.maxHp - enemy.hp > 0 ? player.maxHp - enemy.hp : 0} 点伤害`
                : `承受 ${player.maxHp - player.hp > 0 ? player.maxHp - player.hp : 0} 点伤害`
              }
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <button onClick={onNextRound} className="w-full py-3 sm:py-4 rounded-xl font-black text-base sm:text-lg btn-success animate-slide-up" style={{ animationDelay: newBadge ? '0.3s' : '0.2s' }}>
            🔄 再来一局
          </button>
          <div className="flex gap-3">
            <button onClick={onChangeMeme} className="flex-1 py-3 sm:py-4 rounded-xl font-black text-base sm:text-lg btn-secondary animate-slide-up">
              🖼️ 更换
            </button>
            <button onClick={onGoHome} className="flex-1 py-3 sm:py-4 rounded-xl font-black text-base sm:text-lg bg-dark-card border border-dark-border hover:border-neon-purple/50 animate-slide-up">
              🏠 返回主页
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-3 sm:mt-4 text-center">💡 分享战绩给好友一起对战吧！</p>
      </div>
    </div>
  )
}

// ============ Main App ============
function App() {
  const [phase, setPhase] = useState<GamePhase>('upload')
  const [player, setPlayer] = useState<Player | null>(null)
  const [enemy, setEnemy] = useState<Player | null>(null)
  const [logs, setLogs] = useState<BattleLog[]>([])
  const [timeLeft, setTimeLeft] = useState(15)
  const [logIdCounter, setLogIdCounter] = useState(0)
  const [playerHp, setPlayerHp] = useState(0)
  const [enemyHp, setEnemyHp] = useState(0)
  const [playerCombo, setPlayerCombo] = useState(0)
  const [enemyCombo, setEnemyCombo] = useState(0)
  const [playerEffects, setPlayerEffects] = useState<Effect[]>([])
  const [enemyEffects, setEnemyEffects] = useState<Effect[]>([])
  const [badges, setBadges] = useState<Badge[]>([])
  const [newBadge, setNewBadge] = useState<Badge | null>(null)
  const [isChampionMatch, setIsChampionMatch] = useState(false)
  const [playerShaking, setPlayerShaking] = useState(false)
  const [enemyShaking, setEnemyShaking] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [showMemePool, setShowMemePool] = useState(false)
  const changeMemeFileInputRef = useRef<HTMLInputElement>(null)
  const [userStats, setUserStats] = useState({ wins: 0, losses: 0, winRate: 0 })

  // 加载用户数据
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { user } = await userApi.getInfo()
        const total = user.wins + user.losses
        setUserStats({
          wins: user.wins,
          losses: user.losses,
          winRate: total > 0 ? Math.round((user.wins / total) * 100) : 0
        })
        // 加载徽章
        setBadges(user.badges.map((badgeId: string) => {
          const badgeMap: Record<string, Badge> = {
            'champion_expression': { id: 'champion_expression', name: '挑战表情天王成功', emoji: '👑', color: '#ffd700', earnedAt: Date.now() },
            'champion_passion': { id: 'champion_passion', name: '挑战热血天王成功', emoji: '🔥', color: '#ffd700', earnedAt: Date.now() },
            'champion_lightning': { id: 'champion_lightning', name: '挑战闪电天王成功', emoji: '⚡', color: '#ffd700', earnedAt: Date.now() },
            'champion_diamond': { id: 'champion_diamond', name: '挑战钻石天王成功', emoji: '💎', color: '#ffd700', earnedAt: Date.now() },
          }
          return badgeMap[badgeId] || { id: badgeId, name: badgeId, emoji: '🏆', color: '#ffd700', earnedAt: Date.now() }
        }))
      } catch (err) {
        console.error('加载用户数据失败:', err)
      }
    }
    loadUserData()
  }, [])

  // 返回主页
  const handleGoHome = () => {
    setPhase('upload')
    setEnemy(null)
    setLogs([])
    setNewBadge(null)
  }

  const battleState = useRef({
    playerHp: 0,
    enemyHp: 0,
    playerCombo: 0,
    enemyCombo: 0,
    playerDotTimer: 0,
    enemyDotTimer: 0,
    isProcessing: false,
    effectId: 0
  })

  const addLog = useCallback((text: string, type: BattleLog['type'], attacker: BattleLog['attacker']) => {
    setLogIdCounter(prev => {
      const newId = prev + 1
      setLogs(current => [...current.slice(-15), { id: newId, text, type, attacker }])
      return newId
    })
  }, [])

  const spawnEffect = useCallback((isPlayer: boolean, emoji: string, color: string) => {
    const id = ++battleState.current.effectId
    const effect: Effect = {
      id,
      emoji,
      x: isPlayer ? 80 : 20,
      y: 40,
      color
    }

    if (isPlayer) {
      setPlayerEffects(prev => [...prev, effect])
    } else {
      setEnemyEffects(prev => [...prev, effect])
    }

    setTimeout(() => {
      if (isPlayer) {
        setPlayerEffects(prev => prev.filter(e => e.id !== id))
      } else {
        setEnemyEffects(prev => prev.filter(e => e.id !== id))
      }
    }, 600)
  }, [])

  // Matching - decide champion or regular
  useEffect(() => {
    if (phase === 'matching') {
      // 20% chance for champion match
      const isChampion = Math.random() < 0.2
      setIsChampionMatch(isChampion)

      const timer = setTimeout(() => {
        setPhase('battle')
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [phase])

  // Initialize battle
  useEffect(() => {
    if (phase !== 'battle' || !player) return

    // Generate enemy based on match type
    let enemyData: Player

    if (isChampionMatch) {
      // Random champion
      const champion = CHAMPIONS[Math.floor(Math.random() * CHAMPIONS.length)]
      const hash = hashCode(Date.now().toString())

      enemyData = {
        id: 'enemy',
        name: champion.name,
        imageUrl: createSvgEmoji(champion.emoji),
        power: champion.power,
        hp: champion.power * 5,
        maxHp: champion.power * 5,
        skill: generateSkill(hash, champion.skillType),
        isChampion: true,
        championTitle: champion.title
      }
      enemyData.skill = {
        ...enemyData.skill,
        name: champion.skill,
        emoji: champion.emoji,
        baseDamage: champion.power / 3
      }
    } else {
      // Random regular enemy (use real meme image)
      const regular = REGULAR_ENEMIES[Math.floor(Math.random() * REGULAR_ENEMIES.length)]
      const hash = hashCode(Date.now().toString())

      enemyData = {
        id: 'enemy',
        name: regular.name,
        imageUrl: regular.image,
        power: regular.power,
        hp: regular.power * 3,
        maxHp: regular.power * 3,
        skill: generateSkill(hash)
      }
    }

    setEnemy(enemyData)

    battleState.current = {
      playerHp: player.hp,
      enemyHp: enemyData.hp,
      playerCombo: 0,
      enemyCombo: 0,
      playerDotTimer: 0,
      enemyDotTimer: 0,
      isProcessing: false,
      effectId: 0
    }

    setPlayerHp(player.hp)
    setEnemyHp(enemyData.hp)
    setPlayerCombo(0)
    setEnemyCombo(0)
    setPlayerEffects([])
    setEnemyEffects([])
    setLogs([])
    setTimeLeft(10)
    setNewBadge(null)

    addLog('⚔️ 战斗开始！', 'system', 'system')
    addLog(`${player.name} (战力${player.power}) vs ${enemyData.name}${enemyData.isChampion ? ' (天王)' : ''}`, 'system', 'system')
    addLog(`技能: ${player.skill.emoji}${player.skill.name} vs ${enemyData.skill.emoji}${enemyData.skill.name}`, 'system', 'system')

    if (enemyData.isChampion) {
      addLog('⚠️ 天王拥有1.5倍血量，小心应对！', 'system', 'system')
    }
  }, [phase, player, isChampionMatch, addLog])

  // Award badge helper
  const awardBadge = useCallback((enemyRef: typeof enemy) => {
    if (enemyRef?.isChampion && enemyRef?.championTitle) {
      const badge: Badge = {
        id: `champion_${enemyRef.name}`,
        name: enemyRef.championTitle,
        emoji: enemyRef.skill.emoji,
        color: '#ffd700',
        earnedAt: Date.now()
      }
      if (!badges.find(b => b.id === badge.id)) {
        setBadges(prev => [...prev, badge])
        setNewBadge(badge)
        addLog('🎉 获得天王徽章：' + badge.name, 'system', 'system')
      }
    }
  }, [badges, addLog])

  // Battle loop
  useEffect(() => {
    if (phase !== 'battle' || !player || !enemy) return

    const battleLoop = setInterval(() => {
      const state = battleState.current
      if (state.isProcessing) return
      state.isProcessing = true

      if (state.playerHp <= 0) {
        clearInterval(battleLoop)
        setPhase('result')
        // Update stats
        setUserStats(prev => {
          const newStats = { ...prev, losses: prev.losses + 1, winRate: Math.round((prev.wins / (prev.wins + prev.losses + 1)) * 100) }
          return newStats
        })
        addLog('💀 ' + player.name + ' 被击败了！', 'system', 'system')
        return
      }
      if (state.enemyHp <= 0) {
        clearInterval(battleLoop)
        setPhase('result')
        // Update stats
        setUserStats(prev => {
          const newStats = { ...prev, wins: prev.wins + 1, winRate: Math.round(((prev.wins + 1) / (prev.wins + prev.losses + 1)) * 100) }
          return newStats
        })
        addLog('🏆 ' + player.name + ' 获胜！', 'system', 'system')
        awardBadge(enemy)
        return
      }

      // Player attacks
      const playerSkill = player.skill
      let playerDamage = Math.floor(Math.random() * 30) + 25 + Math.floor(player.power / 5)
      let playerLogText = ''
      let playerLogType: BattleLog['type'] = 'normal'

      if (playerSkill.type === 'crit' && Math.random() < 0.4) {
        playerDamage *= 2
        playerLogText = `${player.name} ⚡发动${playerSkill.name}！暴击！造成 ${playerDamage} 点伤害！`
        playerLogType = 'crit'
        state.playerCombo = 0
        spawnEffect(true, '💥', '#ffed4a')
      } else if (playerSkill.type === 'stack') {
        state.playerCombo++
        playerDamage += state.playerCombo * 10
        playerLogText = `${player.name} 发动${playerSkill.name}！连击 x${state.playerCombo}！造成 ${playerDamage} 点伤害！`
        playerLogType = 'stack'
        spawnEffect(true, '🌀', '#ff2d95')
      } else if (playerSkill.type === 'dot') {
        state.playerDotTimer = 3
        playerLogText = `${player.name} 施放${playerSkill.name}！立即造成 ${playerDamage} 点伤害 + 持续灼烧`
        playerLogType = 'dot'
        spawnEffect(true, '🔥', '#ff6b35')
      } else if (playerSkill.type === 'heal') {
        const heal = Math.floor(player.maxHp * 0.2)
        state.playerHp = Math.min(player.maxHp, state.playerHp + heal)
        setPlayerHp(state.playerHp)
        playerLogText = `${player.name} 使用${playerSkill.name}！恢复了 ${heal} 点生命值！`
        playerLogType = 'heal'
        spawnEffect(true, '💚', '#00ff88')
      } else {
        playerLogText = `${player.name} 攻击！造成 ${playerDamage} 点伤害！`
        spawnEffect(true, '👊', '#b24bf3')
      }

      state.enemyHp = Math.max(0, state.enemyHp - playerDamage)
      setEnemyHp(state.enemyHp)
      setEnemyShaking(true)
      setTimeout(() => setEnemyShaking(false), 300)
      setPlayerCombo(state.playerCombo)
      addLog(playerLogText, playerLogType, 'player')

      if (state.enemyDotTimer > 0) {
        const dotDamage = Math.floor(playerSkill.baseDamage * 0.5)
        state.enemyHp = Math.max(0, state.enemyHp - dotDamage)
        setEnemyHp(state.enemyHp)
        setEnemyShaking(true)
        setTimeout(() => setEnemyShaking(false), 200)
        state.enemyDotTimer--
        addLog(`${enemy.name} 受到灼烧伤害 -${dotDamage} 血`, 'dot', 'player')
      }

      if (state.enemyHp <= 0) {
        clearInterval(battleLoop)
        setPhase('result')
        setUserStats(prev => {
          const newStats = { ...prev, wins: prev.wins + 1, winRate: Math.round(((prev.wins + 1) / (prev.wins + prev.losses + 1)) * 100) }
          return newStats
        })
        addLog('🏆 ' + player.name + ' 获胜！', 'system', 'system')
        awardBadge(enemy)
        state.isProcessing = false
        return
      }

      setTimeout(() => {
        const enemySkill = enemy.skill
        let enemyDamage = Math.floor(Math.random() * 30) + 25 + Math.floor(enemy.power / 5)
        let enemyLogText = ''
        let enemyLogType: BattleLog['type'] = 'normal'

        if (enemySkill.type === 'crit' && Math.random() < 0.4) {
          enemyDamage *= 2
          enemyLogText = `${enemy.name} ⚡发动${enemySkill.name}！暴击！造成 ${enemyDamage} 点伤害！`
          enemyLogType = 'crit'
          state.enemyCombo = 0
          spawnEffect(false, '💥', '#ffed4a')
        } else if (enemySkill.type === 'stack') {
          state.enemyCombo++
          enemyDamage += state.enemyCombo * 10
          enemyLogText = `${enemy.name} 发动${enemySkill.name}！连击 x${state.enemyCombo}！造成 ${enemyDamage} 点伤害！`
          enemyLogType = 'stack'
          spawnEffect(false, '🌀', '#ff2d95')
        } else if (enemySkill.type === 'dot') {
          state.enemyDotTimer = 3
          enemyLogText = `${enemy.name} 施放${enemySkill.name}！立即造成 ${enemyDamage} 点伤害 + 持续灼烧`
          enemyLogType = 'dot'
          spawnEffect(false, '🔥', '#ff6b35')
        } else if (enemySkill.type === 'heal') {
          const heal = Math.floor(enemy.maxHp * 0.2)
          state.enemyHp = Math.min(enemy.maxHp, state.enemyHp + heal)
          setEnemyHp(state.enemyHp)
          enemyLogText = `${enemy.name} 使用${enemySkill.name}！恢复了 ${heal} 点生命值！`
          enemyLogType = 'heal'
          spawnEffect(false, '💚', '#00ff88')
        } else {
          enemyLogText = `${enemy.name} 攻击！造成 ${enemyDamage} 点伤害！`
          spawnEffect(false, '👊', enemy.isChampion ? '#ffd700' : '#ff2d95')
        }

        state.playerHp = Math.max(0, state.playerHp - enemyDamage)
        setPlayerHp(state.playerHp)
        setPlayerShaking(true)
        setTimeout(() => setPlayerShaking(false), 300)
        setEnemyCombo(state.enemyCombo)
        addLog(enemyLogText, enemyLogType, 'enemy')

        if (state.playerDotTimer > 0) {
          const dotDamage = Math.floor(enemySkill.baseDamage * 0.5)
          state.playerHp = Math.max(0, state.playerHp - dotDamage)
          setPlayerHp(state.playerHp)
          setPlayerShaking(true)
          setTimeout(() => setPlayerShaking(false), 200)
          state.playerDotTimer--
          addLog(`${player.name} 受到灼烧伤害 -${dotDamage} 血`, 'dot', 'enemy')
        }

        if (state.playerHp <= 0) {
          clearInterval(battleLoop)
          setPhase('result')
          setUserStats(prev => {
            const newStats = { ...prev, losses: prev.losses + 1, winRate: Math.round((prev.wins / (prev.wins + prev.losses + 1)) * 100) }
            return newStats
          })
          addLog('💀 ' + player.name + ' 被击败了！', 'system', 'system')
        }

        state.isProcessing = false
      }, 500)

    }, 1000)

    return () => clearInterval(battleLoop)
  }, [phase, player, enemy, addLog, spawnEffect, badges, awardBadge])

  // Timer
  useEffect(() => {
    if (phase !== 'battle') return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          setPhase('result')
          const won = battleState.current.playerHp > battleState.current.enemyHp
          addLog(won ? '🏆 时间到！胜利！' : '💔 时间到！失败...', 'system', 'system')

          // Update stats
          if (won) {
            setUserStats(prev => {
              const newStats = { ...prev, wins: prev.wins + 1, winRate: Math.round(((prev.wins + 1) / (prev.wins + prev.losses + 1)) * 100) }
              return newStats
            })
            awardBadge(enemy)
          } else {
            setUserStats(prev => {
              const newStats = { ...prev, losses: prev.losses + 1, winRate: Math.round((prev.wins / (prev.wins + prev.losses + 1)) * 100) }
              return newStats
            })
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [phase, addLog, enemy, awardBadge])

  const handleUpload = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string
      const hash = hashCode(file.name + file.size + Date.now())
      const power = generatePower(hash)
      const hp = generateHP(power)
      const skill = generateSkill(hash)
      const name = generateName(hash)

      const newPlayer: Player = {
        id: 'player',
        name,
        imageUrl,
        power,
        hp,
        maxHp: hp,
        skill
      }

      setPlayer(newPlayer)
      setEnemy(null)
      setLogs([])
      setLogIdCounter(0)
      setNewBadge(null)
      setPhase('matching')
    }
    reader.readAsDataURL(file)
  }

  const handleNextRound = () => {
    if (player) {
      setPlayer(prev => prev ? { ...prev, hp: prev.maxHp, combo: 0 } : null)
    }
    setEnemy(null)
    setLogs([])
    setLogIdCounter(0)
    setTimeLeft(15)
    setPlayerHp(0)
    setEnemyHp(0)
    setPlayerCombo(0)
    setEnemyCombo(0)
    setPlayerEffects([])
    setEnemyEffects([])
    setNewBadge(null)
    setPhase('matching')
  }

  const handleChangeMeme = () => {
    changeMemeFileInputRef.current?.click()
  }

  const handleChangeMemeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      const imageUrl = ev.target?.result as string
      const hash = hashCode(file.name + file.size + Date.now())
      const power = generatePower(hash)
      const hp = generateHP(power)
      const skill = generateSkill(hash)
      const name = generateName(hash)

      const newPlayer: Player = {
        id: 'player',
        name,
        imageUrl,
        power,
        hp,
        maxHp: hp,
        skill
      }

      setPlayer(newPlayer)
      setEnemy(null)
      setLogs([])
      setLogIdCounter(0)
      setNewBadge(null)
      setPhase('upload')
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  return (
    <div className="min-h-screen text-white relative">
      {/* Hidden file input for changing meme */}
      <input
        ref={changeMemeFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChangeMemeFile}
      />

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setShowLeaderboard(false)}>
          <div className="w-full max-w-md" onClick={e => e.stopPropagation()}>
            <Leaderboard onClose={() => setShowLeaderboard(false)} />
          </div>
        </div>
      )}

      {/* Meme Pool Modal */}
      {showMemePool && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setShowMemePool(false)}>
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <MemePool onClose={() => setShowMemePool(false)} onSelectMeme={(meme) => {
              // Handle meme selection from pool
              setShowMemePool(false)
            }} />
          </div>
        </div>
      )}

      {phase === 'upload' && (
        <UploadPhase
          onUpload={handleUpload}
          badges={badges}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
          onOpenMemePool={() => setShowMemePool(true)}
          userStats={userStats}
        />
      )}
      {phase === 'matching' && <MatchingPhase isChampionMatch={isChampionMatch} />}
      {phase === 'battle' && player && enemy && (
        <BattlePhase
          player={player}
          enemy={enemy}
          logs={logs}
          timeLeft={timeLeft}
          playerHp={playerHp}
          enemyHp={enemyHp}
          playerEffects={playerEffects}
          enemyEffects={enemyEffects}
          playerCombo={playerCombo}
          enemyCombo={enemyCombo}
          playerShaking={playerShaking}
          enemyShaking={enemyShaking}
        />
      )}
      {phase === 'result' && player && enemy && (
        <ResultPhase
          playerWon={playerHp > enemyHp}
          player={player}
          enemy={enemy}
          onNextRound={handleNextRound}
          newBadge={newBadge}
          onChangeMeme={handleChangeMeme}
          onGoHome={handleGoHome}
        />
      )}
    </div>
  )
}

function generatePower(hash: number): number {
  return (hash % 200) + 100
}

function generateHP(power: number): number {
  return power * 3
}

function generateName(hash: number): string {
  const prefixes = ['超级', '无敌', '神秘', '黑暗', '光明', '狂野', '冷静', '热血', '霸气', '逗比']
  const suffixes = ['战士', '侠客', '王者', '魔王', '天使', '恶魔', '骑士', '法师', '忍者', '龙']
  return prefixes[hash % prefixes.length] + suffixes[(hash >> 3) % suffixes.length]
}

export default App
