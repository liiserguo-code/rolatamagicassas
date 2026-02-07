// Level System for user progression
export interface LevelData {
  level: number
  currentXP: number
  xpToNextLevel: number
  totalXP: number
  title: string
  color: string
  perks: string[]
}

const LEVEL_TITLES = [
  { level: 1, title: "Novato", color: "#A0A0A0" },
  { level: 5, title: "Iniciante", color: "#8B8B8B" },
  { level: 10, title: "Jogador", color: "#C0C0C0" },
  { level: 15, title: "Experiente", color: "#87CEEB" },
  { level: 20, title: "Profissional", color: "#4169E1" },
  { level: 25, title: "Elite", color: "#9370DB" },
  { level: 30, title: "Mestre", color: "#D4AF37" },
  { level: 40, title: "Lenda", color: "#FF6B35" },
  { level: 50, title: "Campeão", color: "#FF1744" },
]

const LEVEL_PERKS = [
  { minLevel: 5, perk: "Cashback de 1% em perdas" },
  { minLevel: 10, perk: "Bônus diário de R$5" },
  { minLevel: 15, perk: "Cashback de 2% em perdas" },
  { minLevel: 20, perk: "Saque prioritário" },
  { minLevel: 25, perk: "Cashback de 3% em perdas" },
  { minLevel: 30, perk: "Gerente VIP dedicado" },
  { minLevel: 40, perk: "Cashback de 5% em perdas" },
  { minLevel: 50, perk: "Torneios exclusivos" },
]

// Calculate XP required for next level (exponential growth)
export function calculateXPForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.15, level - 1))
}

// Get current level from total XP
export function getLevelFromXP(totalXP: number): number {
  let level = 1
  let xpNeeded = 0
  
  while (totalXP >= xpNeeded) {
    xpNeeded += calculateXPForLevel(level)
    if (totalXP >= xpNeeded) {
      level++
    } else {
      break
    }
  }
  
  return level
}

// Get XP progress for current level
export function getXPProgress(totalXP: number): { currentXP: number; xpToNextLevel: number } {
  let level = 1
  let xpUsed = 0
  
  while (true) {
    const xpForThisLevel = calculateXPForLevel(level)
    if (xpUsed + xpForThisLevel > totalXP) {
      return {
        currentXP: totalXP - xpUsed,
        xpToNextLevel: xpForThisLevel
      }
    }
    xpUsed += xpForThisLevel
    level++
  }
}

// Get title and color for level
export function getLevelTitle(level: number): { title: string; color: string } {
  let currentTitle = LEVEL_TITLES[0]
  
  for (const entry of LEVEL_TITLES) {
    if (level >= entry.level) {
      currentTitle = entry
    } else {
      break
    }
  }
  
  return { title: currentTitle.title, color: currentTitle.color }
}

// Get all unlocked perks for level
export function getPerksForLevel(level: number): string[] {
  return LEVEL_PERKS
    .filter(perk => level >= perk.minLevel)
    .map(perk => perk.perk)
}

// Get complete level data from total XP
export function getLevelData(totalXP: number): LevelData {
  const level = getLevelFromXP(totalXP)
  const { currentXP, xpToNextLevel } = getXPProgress(totalXP)
  const { title, color } = getLevelTitle(level)
  const perks = getPerksForLevel(level)
  
  return {
    level,
    currentXP,
    xpToNextLevel,
    totalXP,
    title,
    color,
    perks
  }
}

// Calculate XP gain from gameplay
export function calculateXPGain(betAmount: number, won: boolean): number {
  // Base XP from bet amount (1 XP per R$1)
  let xp = Math.floor(betAmount)
  
  // Win bonus (+50% XP)
  if (won) {
    xp = Math.floor(xp * 1.5)
  }
  
  // Minimum 1 XP
  return Math.max(1, xp)
}

// Get next milestone level and XP required
export function getNextMilestone(currentLevel: number): { level: number; xpRequired: number } | null {
  const nextMilestone = LEVEL_TITLES.find(t => t.level > currentLevel)
  
  if (!nextMilestone) {
    return null
  }
  
  // Calculate total XP needed to reach milestone
  let totalXP = 0
  for (let i = 1; i < nextMilestone.level; i++) {
    totalXP += calculateXPForLevel(i)
  }
  
  return {
    level: nextMilestone.level,
    xpRequired: totalXP
  }
}
