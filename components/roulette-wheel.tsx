"use client"

import { useState, useEffect, useCallback } from "react"
import { Sparkles } from "lucide-react"
import { soundManager } from "@/lib/sound-manager"

interface RouletteWheelProps {
  onSpinComplete?: (outerValue: string, innerValue: string) => void
  isSpinning: boolean
  onSpin: () => void
  spinSpeed?: 'normal' | 'fast'
}

const OUTER_VALUES = ["0x", "2x", "5x", "10x", "15x", "20x", "50x"]
const INNER_VALUES = ["1x", "2x", "3x", "4x"]

export function RouletteWheel({ onSpinComplete, isSpinning, onSpin, spinSpeed = 'normal' }: RouletteWheelProps) {
  const [outerRotation, setOuterRotation] = useState(0)
  const [innerRotation, setInnerRotation] = useState(0)
  const [finalOuterValue, setFinalOuterValue] = useState<string | null>(null)
  const [finalInnerValue, setFinalInnerValue] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [particles, setParticles] = useState<Array<{ translateY: number; opacity: number }>>([])
  const [sparklePositions, setSparklePositions] = useState<Array<{ top: string; left: string }>>([])
  
  // Dynamic spin duration based on speed mode
  const spinDuration = spinSpeed === 'fast' ? 2500 : 5000

  // Initialize particles on client side only to avoid hydration mismatch
  useEffect(() => {
    setParticles(
      Array.from({ length: 8 }, () => ({
        translateY: 180 + Math.random() * 20,
        opacity: 0.4 + Math.random() * 0.3,
      }))
    )
    setSparklePositions(
      Array.from({ length: 6 }, () => ({
        top: `${20 + Math.random() * 60}%`,
        left: `${20 + Math.random() * 60}%`,
      }))
    )
  }, [])

  const spin = useCallback(() => {
    if (isSpinning) return
    
    setShowResult(false)
    onSpin()
    
    // Play spin sound with dynamic duration
    soundManager.playSpinSound(spinDuration)
    
    // Always lose - outer wheel always lands on 0x
    const outerFinal = 0
    
    // Weighted probability for inner wheel (heavily favors lower multipliers)
    // 1x: 65%, 2x: 25%, 3x: 8%, 4x: 2%
    const innerWeights = [65, 25, 8, 2]
    const innerRandom = Math.random() * 100
    let innerFinal = 0
    let cumulative = 0
    for (let i = 0; i < innerWeights.length; i++) {
      cumulative += innerWeights[i]
      if (innerRandom < cumulative) {
        innerFinal = i
        break
      }
    }
    
    // Random rotations (multiple full spins + calculated position)
    const outerSpins = 5 + Math.random() * 3
    const innerSpins = 4 + Math.random() * 3
    
    const outerDegrees = outerSpins * 360 + (outerFinal * (360 / OUTER_VALUES.length))
    const innerDegrees = innerSpins * 360 + (innerFinal * (360 / INNER_VALUES.length))
    
    setOuterRotation(prev => prev + outerDegrees)
    setInnerRotation(prev => prev + innerDegrees)
    setFinalOuterValue(OUTER_VALUES[outerFinal])
    setFinalInnerValue(INNER_VALUES[innerFinal])
  }, [isSpinning, onSpin, spinDuration])

  useEffect(() => {
    if (isSpinning && finalOuterValue && finalInnerValue) {
      const timer = setTimeout(() => {
        setShowResult(true)
        
        // Play win or lose sound
        if (finalOuterValue !== "0x") {
          soundManager.playWinSound()
        } else {
          soundManager.playLoseSound()
        }
        
        onSpinComplete?.(finalOuterValue, finalInnerValue)
      }, spinDuration)
      return () => clearTimeout(timer)
    }
  }, [isSpinning, finalOuterValue, finalInnerValue, onSpinComplete, spinDuration])

  const isWin = showResult && finalOuterValue && finalOuterValue !== "0x"
  const isLoss = showResult && finalOuterValue === "0x"

  return (
    <div className="relative flex items-center justify-center">
      {/* Animated outer glow rings */}
      <div 
        className="absolute w-[380px] h-[380px] md:w-[480px] md:h-[480px] rounded-full animate-pulse-ring"
        style={{
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%)',
        }}
      />
      <div 
        className="absolute w-[360px] h-[360px] md:w-[460px] md:h-[460px] rounded-full animate-pulse-ring"
        style={{
          background: 'radial-gradient(circle, rgba(147, 51, 234, 0.1) 0%, transparent 60%)',
          animationDelay: '0.5s',
        }}
      />
      
      {/* Spinning ambient particles */}
      <div className="absolute w-[400px] h-[400px] md:w-[500px] md:h-[500px] animate-spin-slow">
        {particles.map((particle, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-[#D4AF37] rounded-full"
            style={{
              top: '50%',
              left: '50%',
              transform: `rotate(${i * 45}deg) translateY(-${particle.translateY}px)`,
              opacity: particle.opacity,
              boxShadow: '0 0 8px rgba(212, 175, 55, 0.6)',
            }}
          />
        ))}
      </div>

      {/* Result glow effect */}
      {showResult && (
        <div 
          className={`absolute w-[340px] h-[340px] md:w-[420px] md:h-[420px] rounded-full ${isWin ? 'animate-win-glow' : 'animate-lose-pulse'}`}
          style={{
            background: isWin 
              ? 'radial-gradient(circle, rgba(5, 150, 105, 0.2) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(220, 38, 38, 0.2) 0%, transparent 70%)',
          }}
        />
      )}

      {/* Main wheel container */}
      <div className="relative w-[300px] h-[300px] md:w-[380px] md:h-[380px]">
        {/* Outer decorative ring with glow */}
        <div 
          className={`absolute -inset-3 rounded-full ${isSpinning ? 'animate-border-glow' : ''}`}
          style={{
            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, transparent 50%, rgba(147, 51, 234, 0.1) 100%)',
            border: '1px solid rgba(212, 175, 55, 0.2)',
          }}
        />

        {/* Outer ring - gold metallic with enhanced effect */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: 'linear-gradient(135deg, #F7E98E 0%, #D4AF37 25%, #996515 50%, #D4AF37 75%, #F7E98E 100%)',
            boxShadow: `
              0 0 40px rgba(212, 175, 55, 0.4), 
              0 0 80px rgba(212, 175, 55, 0.2),
              inset 0 2px 4px rgba(255, 255, 255, 0.3),
              inset 0 -2px 4px rgba(0, 0, 0, 0.2)
            `,
            padding: '8px',
          }}
        >
          {/* Outer wheel with values */}
          <div 
            className="w-full h-full rounded-full relative overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #1A1A24 0%, #0B0B0F 100%)',
              transform: `rotate(${outerRotation}deg)`,
              transition: isSpinning ? `transform ${spinDuration}ms cubic-bezier(0.17, 0.67, 0.12, 0.99)` : 'none',
              boxShadow: 'inset 0 0 40px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Radial lines decoration */}
            <div className="absolute inset-0">
              {[...Array(24)].map((_, i) => (
                <div
                  key={i}
                  className="absolute top-0 left-1/2 w-[1px] h-1/2 origin-bottom"
                  style={{
                    transform: `rotate(${i * 15}deg) translateX(-50%)`,
                    background: 'linear-gradient(to top, transparent 60%, rgba(212, 175, 55, 0.1) 100%)',
                  }}
                />
              ))}
            </div>

            {/* Outer segments */}
            {OUTER_VALUES.map((value, index) => {
              const angle = (index * 360) / OUTER_VALUES.length
              const isHighValue = value === "100x" || value === "20x"
              const isZero = value === "0x"
              return (
                <div
                  key={value}
                  className="absolute inset-0 flex items-start justify-center pt-4 md:pt-6"
                  style={{ transform: `rotate(${angle}deg)` }}
                >
                  <span 
                    className={`font-bold text-sm md:text-lg ${
                      isZero 
                        ? 'text-[#DC2626]' 
                        : isHighValue 
                          ? 'text-[#F7E98E]' 
                          : 'text-[#D4AF37]'
                    }`}
                    style={{
                      textShadow: isZero
                        ? '0 0 10px rgba(220, 38, 38, 0.8)'
                        : isHighValue 
                          ? '0 0 10px rgba(247, 233, 142, 0.8), 0 0 20px rgba(212, 175, 55, 0.5)' 
                          : '0 0 5px rgba(212, 175, 55, 0.3)',
                    }}
                  >
                    {value}
                  </span>
                </div>
              )
            })}

            {/* Segment dividers with glow */}
            {OUTER_VALUES.map((_, index) => {
              const angle = (index * 360) / OUTER_VALUES.length + (180 / OUTER_VALUES.length)
              return (
                <div
                  key={`divider-${index}`}
                  className="absolute top-0 left-1/2 w-[2px] h-1/2 origin-bottom"
                  style={{
                    transform: `rotate(${angle}deg) translateX(-50%)`,
                    background: 'linear-gradient(to top, transparent 40%, rgba(212, 175, 55, 0.4) 100%)',
                    boxShadow: '0 0 4px rgba(212, 175, 55, 0.3)',
                  }}
                />
              )
            })}
          </div>
        </div>

        {/* Inner wheel container with enhanced styling */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160px] h-[160px] md:w-[200px] md:h-[200px] rounded-full"
          style={{
            background: 'linear-gradient(135deg, #F7E98E 0%, #D4AF37 25%, #996515 50%, #D4AF37 75%, #F7E98E 100%)',
            boxShadow: `
              0 0 30px rgba(212, 175, 55, 0.4),
              0 4px 15px rgba(0, 0, 0, 0.3),
              inset 0 2px 4px rgba(255, 255, 255, 0.3)
            `,
            padding: '4px',
          }}
        >
          {/* Inner wheel pointer */}
          <div 
            className="absolute -top-1 left-1/2 -translate-x-1/2 z-20"
          >
            <div
              style={{
                width: '0',
                height: '0',
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderTop: '16px solid #059669',
                filter: 'drop-shadow(0 0 8px rgba(5, 150, 105, 0.8)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
              }}
            />
            <div
              className="absolute -top-[16px] left-1/2 -translate-x-1/2"
              style={{
                width: '0',
                height: '0',
                borderLeft: '4px solid transparent',
                borderRight: '4px solid transparent',
                borderTop: '8px solid #10B981',
              }}
            />
          </div>
          {/* Inner wheel */}
          <div 
            className="w-full h-full rounded-full relative overflow-hidden"
            style={{
              background: 'radial-gradient(circle at 30% 30%, #1A1A24 0%, #0B0B0F 100%)',
              transform: `rotate(${innerRotation}deg)`,
              transition: isSpinning ? `transform ${spinDuration}ms cubic-bezier(0.17, 0.67, 0.12, 0.99)` : 'none',
              boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Inner segments */}
            {INNER_VALUES.map((value, index) => {
              const angle = (index * 360) / INNER_VALUES.length
              return (
                <div
                  key={value}
                  className="absolute inset-0 flex items-start justify-center pt-3 md:pt-4"
                  style={{ transform: `rotate(${angle}deg)` }}
                >
                  <span 
                    className="font-bold text-xs md:text-sm text-[#059669]"
                    style={{ textShadow: '0 0 10px rgba(5, 150, 105, 0.6)' }}
                  >
                    {value}
                  </span>
                </div>
              )
            })}

            {/* Inner segment dividers */}
            {INNER_VALUES.map((_, index) => {
              const angle = (index * 360) / INNER_VALUES.length + (180 / INNER_VALUES.length)
              return (
                <div
                  key={`inner-divider-${index}`}
                  className="absolute top-0 left-1/2 w-[1px] h-1/2 origin-bottom"
                  style={{
                    transform: `rotate(${angle}deg) translateX(-50%)`,
                    background: 'linear-gradient(to top, transparent 30%, rgba(5, 150, 105, 0.3) 100%)',
                  }}
                />
              )
            })}
          </div>
        </div>

        {/* Center hub with enhanced effects */}
        <div 
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 md:w-20 md:h-20 rounded-full cursor-pointer group ${isSpinning ? '' : 'hover:scale-105'} transition-transform duration-200`}
          onClick={spin}
          style={{
            background: 'linear-gradient(135deg, #F7E98E 0%, #D4AF37 30%, #996515 70%, #D4AF37 100%)',
            boxShadow: `
              0 4px 20px rgba(212, 175, 55, 0.5),
              0 0 40px rgba(212, 175, 55, 0.3),
              inset 0 2px 4px rgba(255, 255, 255, 0.5),
              inset 0 -2px 4px rgba(0, 0, 0, 0.2)
            `,
          }}
        >
          {/* Inner hub */}
          <div 
            className="absolute inset-2 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(180deg, #D4AF37 0%, #996515 100%)',
              boxShadow: 'inset 0 2px 6px rgba(255, 255, 255, 0.3)',
            }}
          >
            <span className="text-[#0B0B0F] font-bold text-xs md:text-sm tracking-wider flex items-center gap-1">
              {isSpinning ? (
                <span className="animate-pulse">...</span>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 md:w-4 md:h-4" />
                  <span>SPIN</span>
                </>
              )}
            </span>
          </div>
          
          {/* Hover glow */}
          <div 
            className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              boxShadow: '0 0 40px rgba(212, 175, 55, 0.7), 0 0 60px rgba(212, 175, 55, 0.4)',
            }}
          />
        </div>

        {/* Pointer with enhanced styling */}
        <div 
          className="absolute -top-3 left-1/2 -translate-x-1/2 z-10"
        >
          <div
            style={{
              width: '0',
              height: '0',
              borderLeft: '14px solid transparent',
              borderRight: '14px solid transparent',
              borderTop: '28px solid #D4AF37',
              filter: 'drop-shadow(0 0 12px rgba(212, 175, 55, 0.8)) drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))',
            }}
          />
          <div
            className="absolute -top-[28px] left-1/2 -translate-x-1/2"
            style={{
              width: '0',
              height: '0',
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '16px solid #F7E98E',
            }}
          />
        </div>

        {/* Win sparkles */}
        {isWin && (
          <div className="absolute inset-0 pointer-events-none">
            {sparklePositions.map((position, i) => (
              <Sparkles
                key={i}
                className="absolute text-[#D4AF37] animate-sparkle"
                style={{
                  top: position.top,
                  left: position.left,
                  width: '20px',
                  height: '20px',
                  animationDelay: `${i * 0.3}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
