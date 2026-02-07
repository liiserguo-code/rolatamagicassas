"use client"

import { useState, useCallback, useEffect } from "react"
import { LuxuryBackground } from "@/components/luxury-background"
import { RouletteWheel } from "@/components/roulette-wheel"
import { GameControls } from "@/components/game-controls"
import { RegisterModal } from "@/components/register-modal"
import { FloatingNotification } from "@/components/floating-notification"
import { User, LogOut } from "lucide-react"

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
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("luxspin_current_user")
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser))
    }
  }, [])

  const [insufficientBalance, setInsufficientBalance] = useState(false)

  const handleSpin = useCallback(() => {
    if (balance < betAmount) {
      // Only show register if not logged in AND has no balance
      if (!currentUser) {
        setShowRegister(true)
      } else {
        // Show insufficient balance warning
        setInsufficientBalance(true)
        setTimeout(() => setInsufficientBalance(false), 2000)
      }
      return
    }
    setIsSpinning(true)
    setBalance(prev => prev - betAmount)
    setGain(null)
  }, [balance, betAmount, currentUser])

  const handleSpinComplete = useCallback((outerValue: string, innerValue: string) => {
    setIsSpinning(false)
    
    // Calculate winnings
    const outerMultiplier = parseFloat(outerValue.replace('x', ''))
    const innerMultiplier = parseFloat(innerValue.replace('x', ''))
    
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
  }, [betAmount])

  const handleDeposit = useCallback(() => {
    // For demo, add R$ 50,00
    setBalance(prev => prev + 50)
  }, [])

  const handleBetChange = useCallback((amount: number) => {
    setBetAmount(amount)
  }, [])

  const handleAuthSuccess = useCallback((user: AuthUser) => {
    setCurrentUser(user)
    // Give welcome bonus
    setBalance(prev => prev + 10)
  }, [])

  const handleLogout = useCallback(() => {
    localStorage.removeItem("luxspin_current_user")
    setCurrentUser(null)
    setBalance(0)
  }, [])

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

          {/* Welcome message for logged in users */}
          {currentUser && (
            <div className="mt-3 text-center">
              <p className="text-sm text-[#A0A0A0]">
                Bem-vindo, <span className="gold-text font-semibold">{currentUser.name.split(' ')[0]}</span>
              </p>
            </div>
          )}
        </header>

        {/* Roulette wheel */}
        <div className="flex-1 flex flex-col items-center justify-center py-4 gap-6">
          <RouletteWheel
            isSpinning={isSpinning}
            onSpin={handleSpin}
            onSpinComplete={handleSpinComplete}
          />
          
          {/* Spin button below wheel */}
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className="relative px-12 py-4 rounded-2xl font-bold text-lg tracking-widest uppercase overflow-hidden group disabled:cursor-not-allowed"
            style={{
              background: isSpinning 
                ? 'linear-gradient(135deg, #4A4A4A 0%, #2A2A2A 100%)'
                : 'linear-gradient(135deg, #F7E98E 0%, #D4AF37 50%, #996515 100%)',
              boxShadow: isSpinning 
                ? '0 4px 15px rgba(0, 0, 0, 0.3)'
                : '0 4px 30px rgba(212, 175, 55, 0.5), 0 0 60px rgba(212, 175, 55, 0.2)',
            }}
          >
            {/* Animated background glow */}
            {!isSpinning && (
              <div 
                className="absolute inset-0 animate-pulse opacity-50"
                style={{
                  background: 'radial-gradient(circle at center, rgba(247, 233, 142, 0.4) 0%, transparent 70%)',
                }}
              />
            )}
            
            {/* Light sweep effect */}
            {!isSpinning && (
              <div 
                className="absolute inset-0 animate-light-sweep opacity-40"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
                  width: '50%',
                }}
              />
            )}
            
            <span className={`relative z-10 flex items-center gap-3 ${isSpinning ? 'text-[#666]' : 'text-[#0B0B0F]'}`}>
              {isSpinning ? (
                <>
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  GIRANDO...
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>
                  GIRAR ROLETA
                </>
              )}
            </span>
            
            {/* Hover effect */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 100%)',
              }}
            />
          </button>
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
    </main>
  )
}
