"use client"

import { useState } from "react"
import { Volume2, VolumeX, HelpCircle, Crown, Zap, TrendingUp, TrendingDown } from "lucide-react"

interface GameControlsProps {
  balance: number
  betAmount: number
  gain: number | null
  onBetChange: (amount: number) => void
  onDeposit: () => void
  onRegister: () => void
  isSpinning: boolean
  isLoggedIn?: boolean
  insufficientBalance?: boolean
}

const BET_OPTIONS = [0.50, 1.00, 2.00, 5.00, 10.00, 20.00]

export function GameControls({
  balance,
  betAmount,
  gain,
  onBetChange,
  onDeposit,
  onRegister,
  isSpinning,
  isLoggedIn = false,
  insufficientBalance = false,
}: GameControlsProps) {
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [mode] = useState("NORMAL")

  const isWin = gain !== null && gain > 0
  const isLoss = gain !== null && gain < 0

  return (
    <div className="w-full max-w-md mx-auto px-4">
      {/* Top controls with enhanced styling */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2.5 rounded-xl glass-card hover:bg-white/10 transition-all duration-300 group"
          aria-label={soundEnabled ? "Mute sound" : "Enable sound"}
        >
          {soundEnabled ? (
            <Volume2 className="w-5 h-5 text-[#D4AF37] group-hover:scale-110 transition-transform" />
          ) : (
            <VolumeX className="w-5 h-5 text-[#A0A0A0] group-hover:text-[#D4AF37] transition-colors" />
          )}
        </button>

        <div className="flex items-center gap-2">
          <button
            className="p-2.5 rounded-xl glass-card hover:bg-white/10 transition-all duration-300 group"
            aria-label="Help"
          >
            <HelpCircle className="w-5 h-5 text-[#A0A0A0] group-hover:text-[#D4AF37] group-hover:scale-110 transition-all" />
          </button>
          <div className="p-2.5 rounded-xl glass-card">
            <Crown className="w-5 h-5 text-[#D4AF37]" />
          </div>
        </div>
      </div>

      {/* Deposit button with enhanced effects */}
      <button
        onClick={onDeposit}
        className={`w-full mb-4 py-3.5 px-6 rounded-xl font-bold text-sm tracking-wider relative overflow-hidden group transition-all duration-300 ${insufficientBalance ? 'animate-shake' : ''}`}
        style={{
          background: 'linear-gradient(135deg, #1A1A24 0%, #12121A 100%)',
          border: insufficientBalance ? '2px solid rgba(220, 38, 38, 0.5)' : '1px solid rgba(212, 175, 55, 0.3)',
          boxShadow: insufficientBalance 
            ? '0 0 20px rgba(220, 38, 38, 0.3)' 
            : '0 4px 15px rgba(0, 0, 0, 0.3)',
        }}
      >
        <span className={`relative z-10 flex items-center justify-center gap-2 ${insufficientBalance ? 'text-[#DC2626]' : ''}`}>
          <Zap className={`w-4 h-4 ${insufficientBalance ? 'text-[#DC2626]' : 'text-[#D4AF37]'}`} />
          <span className={insufficientBalance ? 'text-[#DC2626]' : 'gold-text'}>
            {insufficientBalance ? 'SALDO INSUFICIENTE - DEPOSITE' : 'DEPOSITAR'}
          </span>
        </span>
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, transparent 100%)',
          }}
        />
        {/* Animated border glow */}
        <div className="absolute inset-0 rounded-xl animate-border-glow opacity-50" style={{ border: '1px solid rgba(212, 175, 55, 0.3)' }} />
      </button>

      {/* Mode selector with icon */}
      <div className="glass-card rounded-xl p-3 mb-4 animate-border-glow">
        <div className="flex items-center justify-center gap-3">
          <Crown className="w-4 h-4 text-[#D4AF37]" />
          <span className="text-[#A0A0A0] text-sm">Modo:</span>
          <span className="gold-text font-bold tracking-wider">{mode}</span>
        </div>
      </div>

      {/* Balance, Bet, and Gain with enhanced styling */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div 
          className="glass-card rounded-xl p-3 text-center relative overflow-hidden group hover:scale-105 transition-transform duration-300"
          style={{
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="text-[#A0A0A0] text-xs block mb-1 relative z-10">Saldo</span>
          <span className="gold-text font-bold text-sm relative z-10">
            R$ {balance.toFixed(2).replace('.', ',')}
          </span>
        </div>
        
        <div 
          className={`glass-card rounded-xl p-3 text-center relative overflow-hidden group hover:scale-105 transition-transform duration-300 ${isSpinning ? 'animate-glow-pulse' : ''}`}
          style={{
            boxShadow: isSpinning ? '0 0 20px rgba(5, 150, 105, 0.3)' : '0 4px 15px rgba(0, 0, 0, 0.2)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#059669]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="text-[#A0A0A0] text-xs block mb-1 relative z-10">Giro</span>
          <span className="text-[#059669] font-bold text-sm relative z-10">
            R$ {betAmount.toFixed(2).replace('.', ',')}
          </span>
        </div>
        
        <div 
          className={`glass-card rounded-xl p-3 text-center relative overflow-hidden group hover:scale-105 transition-transform duration-300 ${isWin ? 'animate-win-glow' : isLoss ? 'animate-lose-pulse' : ''}`}
          style={{
            boxShadow: isWin 
              ? '0 0 20px rgba(5, 150, 105, 0.4)' 
              : isLoss 
                ? '0 0 20px rgba(220, 38, 38, 0.4)' 
                : '0 4px 15px rgba(0, 0, 0, 0.2)',
          }}
        >
          <div className={`absolute inset-0 transition-opacity ${
            isWin ? 'bg-gradient-to-br from-[#059669]/20 to-transparent opacity-100' : 
            isLoss ? 'bg-gradient-to-br from-[#DC2626]/20 to-transparent opacity-100' : 
            'opacity-0'
          }`} />
          <span className="text-[#A0A0A0] text-xs block mb-1 relative z-10 flex items-center justify-center gap-1">
            {isWin && <TrendingUp className="w-3 h-3 text-[#059669]" />}
            {isLoss && <TrendingDown className="w-3 h-3 text-[#DC2626]" />}
            Ganho
          </span>
          <span className={`font-bold text-sm relative z-10 ${
            gain !== null 
              ? gain > 0 
                ? 'text-[#059669]' 
                : gain < 0 
                  ? 'text-[#DC2626]' 
                  : 'text-[#A0A0A0]'
              : 'text-[#A0A0A0]'
          }`}>
            {gain !== null 
              ? gain < 0 
                ? `-R$ ${Math.abs(gain).toFixed(2).replace('.', ',')}` 
                : `R$ ${gain.toFixed(2).replace('.', ',')}`
              : '-'}
          </span>
        </div>
      </div>

      {/* Bet amount selector with enhanced styling */}
      <div className="glass-card rounded-xl p-4 mb-6">
        <span className="text-[#A0A0A0] text-xs block mb-3 text-center uppercase tracking-wider">Valor do Giro</span>
        <div className="flex flex-wrap justify-center gap-2">
          {BET_OPTIONS.map((option) => (
            <button
              key={option}
              onClick={() => !isSpinning && onBetChange(option)}
              disabled={isSpinning}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 relative overflow-hidden ${
                betAmount === option
                  ? 'gold-gradient text-[#0B0B0F] scale-110'
                  : 'bg-[#1A1A24] text-[#A0A0A0] hover:text-[#D4AF37] hover:bg-[#1A1A24]/80'
              } border ${betAmount === option ? 'border-transparent' : 'border-[#2A2A3A] hover:border-[#D4AF37]/30'} ${isSpinning ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
              style={betAmount === option ? {
                boxShadow: '0 0 20px rgba(212, 175, 55, 0.4), 0 4px 10px rgba(0, 0, 0, 0.3)',
              } : {}}
            >
              {betAmount === option && (
                <div className="absolute inset-0 animate-shimmer opacity-30" style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
                }} />
              )}
              <span className="relative z-10">R$ {option.toFixed(2).replace('.', ',')}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Register CTA - only show when not logged in */}
      {!isLoggedIn && (
        <button
          onClick={onRegister}
          className="w-full py-4 px-8 rounded-xl font-bold text-lg tracking-wider relative overflow-hidden animate-glow-pulse group hover:scale-[1.02] transition-transform duration-300"
          style={{
            background: 'linear-gradient(135deg, #F7E98E 0%, #D4AF37 50%, #996515 100%)',
            boxShadow: '0 4px 30px rgba(212, 175, 55, 0.5), 0 0 60px rgba(212, 175, 55, 0.2)',
          }}
        >
          <span className="text-[#0B0B0F] relative z-10 flex items-center justify-center gap-2">
            <Crown className="w-5 h-5" />
            REGISTRAR-SE
          </span>
          
          {/* Light sweep effect */}
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)',
            }}
          />
          
          {/* Animated light sweep */}
          <div 
            className="absolute inset-0 animate-light-sweep opacity-40"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.6) 50%, transparent 100%)',
              width: '50%',
            }}
          />

          {/* Sparkle corners */}
          <div className="absolute top-2 left-2 w-2 h-2 bg-white/60 rounded-full animate-sparkle" />
          <div className="absolute top-2 right-2 w-2 h-2 bg-white/60 rounded-full animate-sparkle" style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-2 left-2 w-2 h-2 bg-white/60 rounded-full animate-sparkle" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-2 right-2 w-2 h-2 bg-white/60 rounded-full animate-sparkle" style={{ animationDelay: '1.5s' }} />
        </button>
      )}
    </div>
  )
}
