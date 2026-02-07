"use client"

import { useState } from "react"
import { Trophy, Star, TrendingUp, Gift, X } from "lucide-react"
import { getLevelData, getNextMilestone, type LevelData } from "@/lib/level-system"

interface LevelDisplayProps {
  totalXP: number
  className?: string
}

export function LevelDisplay({ totalXP, className = "" }: LevelDisplayProps) {
  const [showDetails, setShowDetails] = useState(false)
  const levelData = getLevelData(totalXP)
  const nextMilestone = getNextMilestone(levelData.level)
  
  const progressPercent = (levelData.currentXP / levelData.xpToNextLevel) * 100

  return (
    <>
      {/* Compact level indicator */}
      <button
        onClick={() => setShowDetails(true)}
        className={`glass-card rounded-xl p-3 hover:bg-white/10 transition-all duration-300 group ${className}`}
      >
        <div className="flex items-center gap-3">
          <div 
            className="relative w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2"
            style={{
              borderColor: levelData.color,
              boxShadow: `0 0 15px ${levelData.color}40`,
            }}
          >
            <span style={{ color: levelData.color }}>{levelData.level}</span>
            <div 
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(${levelData.color} ${progressPercent}%, transparent ${progressPercent}%)`,
                opacity: 0.2,
              }}
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold" style={{ color: levelData.color }}>
                {levelData.title}
              </span>
              <Trophy className="w-3 h-3 text-[#D4AF37]" />
            </div>
            
            {/* Progress bar */}
            <div className="w-full h-1.5 bg-[#1A1A24] rounded-full overflow-hidden mt-1">
              <div 
                className="h-full transition-all duration-500 ease-out rounded-full"
                style={{ 
                  width: `${progressPercent}%`,
                  background: `linear-gradient(90deg, ${levelData.color}, ${levelData.color}DD)`,
                  boxShadow: `0 0 8px ${levelData.color}80`,
                }}
              />
            </div>
            
            <div className="flex justify-between mt-0.5">
              <span className="text-[10px] text-[#666]">
                {levelData.currentXP} / {levelData.xpToNextLevel} XP
              </span>
            </div>
          </div>
        </div>
      </button>

      {/* Level details modal */}
      {showDetails && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowDetails(false)}
        >
          <div 
            className="w-full max-w-md glass-card rounded-2xl p-6 animate-modal-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-2"
                  style={{
                    borderColor: levelData.color,
                    boxShadow: `0 0 20px ${levelData.color}60`,
                  }}
                >
                  <span style={{ color: levelData.color }}>{levelData.level}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold" style={{ color: levelData.color }}>
                    Nível {levelData.level}
                  </h3>
                  <p className="text-sm text-[#A0A0A0]">{levelData.title}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-[#A0A0A0]" />
              </button>
            </div>

            {/* Progress section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#A0A0A0] flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  Progresso do Nível
                </span>
                <span className="text-sm font-semibold" style={{ color: levelData.color }}>
                  {Math.floor(progressPercent)}%
                </span>
              </div>
              
              {/* Progress bar */}
              <div className="w-full h-3 bg-[#1A1A24] rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-500 ease-out rounded-full"
                  style={{ 
                    width: `${progressPercent}%`,
                    background: `linear-gradient(90deg, ${levelData.color}, ${levelData.color}DD)`,
                    boxShadow: `0 0 12px ${levelData.color}80`,
                  }}
                />
              </div>
              
              <div className="flex justify-between mt-1">
                <span className="text-xs text-[#666]">
                  {levelData.currentXP.toLocaleString()} XP
                </span>
                <span className="text-xs text-[#666]">
                  {levelData.xpToNextLevel.toLocaleString()} XP
                </span>
              </div>
            </div>

            {/* Perks section */}
            {levelData.perks.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-sm font-semibold text-[#D4AF37]">Benefícios Ativos</span>
                </div>
                <div className="space-y-2">
                  {levelData.perks.map((perk, index) => (
                    <div 
                      key={index}
                      className="flex items-start gap-2 p-2 rounded-lg bg-[#1A1A24]/50"
                    >
                      <Gift className="w-4 h-4 text-[#059669] flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-[#F5F5F5]">{perk}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next milestone */}
            {nextMilestone && (
              <div className="p-3 rounded-lg bg-[#1A1A24]/30 border border-[#2A2A3A]">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-xs font-semibold text-[#D4AF37]">
                    Próximo Marco: Nível {nextMilestone.level}
                  </span>
                </div>
                <p className="text-xs text-[#A0A0A0]">
                  Faltam {(nextMilestone.xpRequired - levelData.totalXP).toLocaleString()} XP
                </p>
              </div>
            )}

            {/* Info text */}
            <p className="text-[10px] text-[#666] mt-4 text-center">
              Ganhe XP jogando. Apostas maiores = mais XP. Vitórias dão bônus de +50%!
            </p>
          </div>
        </div>
      )}
    </>
  )
}
