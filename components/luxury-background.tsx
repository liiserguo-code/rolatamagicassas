"use client"

import { useEffect, useState } from "react"

interface Particle {
  id: number
  x: number
  y: number
  size: number
  delay: number
  duration: number
  opacity: number
}

interface Star {
  id: number
  x: number
  y: number
  size: number
  delay: number
}

export function LuxuryBackground() {
  const [particles, setParticles] = useState<Particle[]>([])
  const [stars, setStars] = useState<Star[]>([])

  useEffect(() => {
    // Gold floating particles
    const newParticles: Particle[] = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 8,
      duration: Math.random() * 6 + 6,
      opacity: Math.random() * 0.4 + 0.2,
    }))
    setParticles(newParticles)

    // Twinkling stars
    const newStars: Star[] = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 5,
    }))
    setStars(newStars)
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Deep black base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#050508] via-[#0B0B0F] to-[#080810]" />
      
      {/* Animated mesh gradient */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 20% 40%, rgba(147, 51, 234, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 60%, rgba(212, 175, 55, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse 50% 30% at 50% 80%, rgba(5, 150, 105, 0.1) 0%, transparent 50%)
          `,
        }}
      />

      {/* Large animated orbs */}
      <div 
        className="absolute w-[800px] h-[800px] rounded-full animate-float opacity-20"
        style={{
          top: '-20%',
          left: '-10%',
          background: 'radial-gradient(circle, rgba(147, 51, 234, 0.3) 0%, rgba(147, 51, 234, 0.1) 40%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div 
        className="absolute w-[600px] h-[600px] rounded-full animate-float opacity-15"
        style={{
          bottom: '-15%',
          right: '-10%',
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.4) 0%, rgba(212, 175, 55, 0.1) 40%, transparent 70%)',
          filter: 'blur(60px)',
          animationDelay: '2s',
          animationDirection: 'reverse',
        }}
      />
      <div 
        className="absolute w-[400px] h-[400px] rounded-full animate-float opacity-10"
        style={{
          top: '40%',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'radial-gradient(circle, rgba(5, 150, 105, 0.4) 0%, transparent 70%)',
          filter: 'blur(50px)',
          animationDelay: '4s',
        }}
      />

      {/* Twinkling stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            background: 'white',
            boxShadow: '0 0 4px rgba(255, 255, 255, 0.8)',
            animation: `twinkle ${2 + Math.random() * 2}s ease-in-out infinite`,
            animationDelay: `${star.delay}s`,
            opacity: 0.3,
          }}
        />
      ))}

      {/* Floating gold particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full animate-particle"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            background: `radial-gradient(circle, rgba(247, 233, 142, ${particle.opacity + 0.3}) 0%, rgba(212, 175, 55, ${particle.opacity}) 50%, transparent 100%)`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
            boxShadow: `0 0 ${particle.size * 2}px rgba(212, 175, 55, ${particle.opacity})`,
          }}
        />
      ))}

      {/* Diagonal light rays */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          background: `
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 100px,
              rgba(212, 175, 55, 0.1) 100px,
              rgba(212, 175, 55, 0.1) 101px
            )
          `,
        }}
      />

      {/* Corner accent glows */}
      <div 
        className="absolute top-0 left-0 w-96 h-96 opacity-20"
        style={{
          background: 'radial-gradient(circle at top left, rgba(147, 51, 234, 0.3) 0%, transparent 60%)',
        }}
      />
      <div 
        className="absolute bottom-0 right-0 w-96 h-96 opacity-15"
        style={{
          background: 'radial-gradient(circle at bottom right, rgba(212, 175, 55, 0.3) 0%, transparent 60%)',
        }}
      />

      {/* Subtle animated aurora */}
      <div 
        className="absolute top-0 left-0 right-0 h-[50vh] opacity-10"
        style={{
          background: 'linear-gradient(180deg, rgba(147, 51, 234, 0.2) 0%, rgba(5, 150, 105, 0.1) 50%, transparent 100%)',
          animation: 'aurora 8s ease-in-out infinite',
        }}
      />

      {/* Subtle bokeh effects */}
      <div 
        className="absolute top-20 right-1/4 w-40 h-40 rounded-full opacity-10 blur-3xl animate-pulse"
        style={{ background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)' }}
      />
      <div 
        className="absolute bottom-40 left-1/3 w-56 h-56 rounded-full opacity-10 blur-3xl animate-pulse"
        style={{ background: 'radial-gradient(circle, #9333EA 0%, transparent 70%)', animationDelay: '1s' }}
      />
      <div 
        className="absolute top-1/2 right-1/4 w-32 h-32 rounded-full opacity-10 blur-2xl animate-pulse"
        style={{ background: 'radial-gradient(circle, #059669 0%, transparent 70%)', animationDelay: '2s' }}
      />

      {/* Vignette effect */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, transparent 40%, rgba(0, 0, 0, 0.4) 100%)',
        }}
      />

      {/* Subtle noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
}
