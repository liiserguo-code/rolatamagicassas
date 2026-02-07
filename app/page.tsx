"use client"

import { useState, useCallback, useEffect } from "react"
import { LuxuryBackground } from "@/components/luxury-background"
import { RouletteWheel } from "@/components/roulette-wheel"
import { GameControls } from "@/components/game-controls"
import { RegisterModal } from "@/components/register-modal"
import { FloatingNotification } from "@/components/floating-notification"
import { DepositModal } from "@/components/deposit-modal"
import { LevelDisplay } from "@/components/level-display"
import { User, LogOut } from "lucide-react"
import { calculateXPGain } from "@/lib/level-system"
import { logger } from "@/lib/logger"

interface AuthUser {
  name: string
  email: string
  phone: string
}

export default function Home() {
  const [balance, setBalance] = useState(0)
  const [betAmount, setBetAmount] = useState(0.50)
  const [gain, setGain] = useState<number | null>(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [showDeposit, setShowDeposit] = useState(false)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [totalXP, setTotalXP] = useState(0)
  const [spinMode, setSpinMode] = useState<'NORMAL' | 'RÁPIDO'>('NORMAL')

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("luxspin_current_user")
    const savedXP = localStorage.getItem("luxspin_total_xp")
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser))
    }
    if (savedXP) {
      setTotalXP(parseInt(savedXP))
    }
  }, [])

  // Save XP to localStorage when it changes
  useEffect(() => {
    if (totalXP > 0) {
      localStorage.setItem("luxspin_total_xp", totalXP.toString())
    }
  }, [totalXP])

  const [insufficientBalance, setInsufficientBalance] = useState(false)

  const handleSpin = useCallback(() => {
    if (balance < betAmount) {
      // Only show register if not logged in AND has no balance
      if (!currentUser) {
        setShowRegister(true)
        logger.logGameEvent('spin_blocked_no_user', { betAmount })
      } else {
        // Show insufficient balance warning
        setInsufficientBalance(true)
        setTimeout(() => setInsufficientBalance(false), 2000)
        logger.logGameEvent('spin_blocked_insufficient_balance', { 
          balance, 
          betAmount,
          userId: currentUser.email 
        })
      }
      return
    }
    
    logger.logGameEvent('spin_started', { 
      betAmount, 
      balance: balance - betAmount,
      userId: currentUser?.email 
    })
    
    setIsSpinning(true)
    setBalance(prev => prev - betAmount)
    setGain(null)
  }, [balance, betAmount, currentUser])

  const handleSpinComplete = useCallback((outerValue: string, innerValue: string) => {
    setIsSpinning(false)
    
    // Calculate winnings
    const outerMultiplier = parseFloat(outerValue.replace('x', ''))
    const innerMultiplier = parseFloat(innerValue.replace('x', ''))
    
    const won = outerMultiplier > 0
    
    // Calculate and award XP
    const xpGained = calculateXPGain(betAmount, won)
    setTotalXP(prev => prev + xpGained)
    
    logger.logGameEvent('spin_completed', {
      outerValue,
      innerValue,
      won,
      xpGained,
      totalXP: totalXP + xpGained,
      betAmount,
      userId: currentUser?.email
    })
    
    // If outer is 0x, lose based on inner multiplier (can lose more than bet)
    if (outerMultiplier === 0) {
      const lossMultiplier = innerMultiplier // 1x to 4x loss
      const lossAmount = betAmount * lossMultiplier
      setGain(-lossAmount)
      setBalance(prev => Math.max(0, prev - (lossAmount - betAmount))) // Already deducted betAmount on spin
      return
    }
    
    const totalMultiplier = outerMultiplier * innerMultiplier
    const winAmount = betAmount * totalMultiplier
    
    setGain(winAmount)
    setBalance(prev => prev + winAmount)
  }, [betAmount, totalXP])

  const handleDeposit = useCallback(() => {
    setShowDeposit(true)
  }, [])

  const handleDepositComplete = useCallback((amount: number) => {
    setBalance(prev => prev + amount)
  }, [])

  const handleBetChange = useCallback((amount: number) => {
    setBetAmount(amount)
  }, [])

  const handleAuthSuccess = useCallback((user: AuthUser) => {
    setCurrentUser(user)
    // Give welcome bonus
    setBalance(prev => prev + 10)
    
    logger.logAuthEvent('user_registered', {
      email: user.email,
      name: user.name,
      welcomeBonus: 10
    })
  }, [])

  const handleLogout = useCallback(() => {
    logger.logAuthEvent('user_logout', {
      email: currentUser?.email
    })
    
    localStorage.removeItem("luxspin_current_user")
    setCurrentUser(null)
    setBalance(0)
  }, [currentUser])

  return (
    <main className="min-h-screen relative overflow-hidden">
      <LuxuryBackground />
      
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-between py-6 px-4">
        {/* Header with brand and user info */}
        <header className="w-full max-w-md mb-4">
          <div className="flex items-center justify-between">
            {/* User profile or login button */}
            <div className="w-10">
              {currentUser ? (
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                  title="Sair"
                  aria-label="Sair da conta"
                >
                  <LogOut className="w-5 h-5 text-[#A0A0A0] hover:text-[#D4AF37]" />
                </button>
              ) : null}
            </div>

            {/* Brand */}
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold tracking-wider">
                <span className="gold-text">Lux</span>
                <span className="text-[#F5F5F5]">Spin</span>
              </h1>
              <p className="text-[#A0A0A0] text-xs mt-1 tracking-widest uppercase">
                Premium Roulette Experience
              </p>
            </div>

            {/* User profile or register button */}
            <div className="w-10">
              {currentUser ? (
                <div 
                  className="flex items-center justify-center w-10 h-10 rounded-full gold-gradient"
                  title={currentUser.name}
                >
                  <span className="text-[#0B0B0F] font-bold text-sm">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              ) : (
                <button
                  onClick={() => setShowRegister(true)}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                  aria-label="Criar conta ou entrar"
                >
                  <User className="w-5 h-5 text-[#A0A0A0] hover:text-[#D4AF37]" />
                </button>
              )}
            </div>
          </div>

          {/* Welcome message and level display for logged in users */}
          {currentUser && (
            <div className="mt-3 space-y-2">
              <div className="text-center">
                <p className="text-sm text-[#A0A0A0]">
                  Bem-vindo, <span className="gold-text font-semibold">{currentUser.name.split(' ')[0]}</span>
                </p>
              </div>
              {/* Level display */}
              <LevelDisplay totalXP={totalXP} />
            </div>
          )}
        </header>

        {/* Roulette wheel */}
        <div className="flex-1 flex flex-col items-center justify-center py-4">
          <RouletteWheel
            isSpinning={isSpinning}
            onSpin={handleSpin}
            onSpinComplete={handleSpinComplete}
            spinSpeed={spinMode === 'RÁPIDO' ? 'fast' : 'normal'}
          />
        </div>

        {/* Game controls */}
        <GameControls
          balance={balance}
          betAmount={betAmount}
          gain={gain}
          onBetChange={handleBetChange}
          onDeposit={handleDeposit}
          onRegister={() => setShowRegister(true)}
          isSpinning={isSpinning}
          isLoggedIn={!!currentUser}
          insufficientBalance={insufficientBalance}
          mode={spinMode}
          onModeChange={setSpinMode}
        />
      </div>

      {/* Floating notifications */}
      <FloatingNotification />

      {/* Register modal */}
      <RegisterModal
        isOpen={showRegister}
        onClose={() => setShowRegister(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Deposit modal */}
      <DepositModal
        isOpen={showDeposit}
        onClose={() => setShowDeposit(false)}
        onDepositComplete={handleDepositComplete}
        currentBalance={balance}
      />
    </main>
  )
}
