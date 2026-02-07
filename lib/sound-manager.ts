// Sound Manager for game audio effects
class SoundManager {
  private audioContext: AudioContext | null = null
  private enabled: boolean = true
  private volume: number = 0.5

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume))
  }

  // Generate spin sound - simulates spinning wheel with frequency modulation
  playSpinSound(duration: number = 3000) {
    if (!this.enabled || !this.audioContext) return

    const now = this.audioContext.currentTime
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    // Spinning wheel effect - frequency increases then decreases
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(200, now)
    oscillator.frequency.exponentialRampToValueAtTime(600, now + duration / 2000)
    oscillator.frequency.exponentialRampToValueAtTime(100, now + duration / 1000)

    // Volume envelope
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, now + 0.1)
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.2, now + duration / 1000 - 0.2)
    gainNode.gain.linearRampToValueAtTime(0, now + duration / 1000)

    oscillator.start(now)
    oscillator.stop(now + duration / 1000)

    console.log("[v0] Playing spin sound, duration:", duration)
  }

  // Generate win sound - celebratory ascending notes
  playWinSound() {
    if (!this.enabled || !this.audioContext) return

    const now = this.audioContext.currentTime
    
    // Play a chord progression
    const notes = [
      { freq: 523.25, start: 0, duration: 0.15 },      // C5
      { freq: 659.25, start: 0.1, duration: 0.15 },    // E5
      { freq: 783.99, start: 0.2, duration: 0.15 },    // G5
      { freq: 1046.50, start: 0.3, duration: 0.4 }     // C6
    ]

    notes.forEach(note => {
      const oscillator = this.audioContext!.createOscillator()
      const gainNode = this.audioContext!.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext!.destination)

      oscillator.type = 'sine'
      oscillator.frequency.value = note.freq

      const startTime = now + note.start
      const endTime = startTime + note.duration

      gainNode.gain.setValueAtTime(0, startTime)
      gainNode.gain.linearRampToValueAtTime(this.volume * 0.4, startTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.01, endTime)

      oscillator.start(startTime)
      oscillator.stop(endTime)
    })

    console.log("[v0] Playing win sound")
  }

  // Generate lose sound - descending tone
  playLoseSound() {
    if (!this.enabled || !this.audioContext) return

    const now = this.audioContext.currentTime
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(400, now)
    oscillator.frequency.exponentialRampToValueAtTime(150, now + 0.5)

    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, now + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5)

    oscillator.start(now)
    oscillator.stop(now + 0.5)

    console.log("[v0] Playing lose sound")
  }

  // Generate click sound for button interactions
  playClickSound() {
    if (!this.enabled || !this.audioContext) return

    const now = this.audioContext.currentTime
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator.type = 'sine'
    oscillator.frequency.value = 800

    gainNode.gain.setValueAtTime(this.volume * 0.2, now)
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05)

    oscillator.start(now)
    oscillator.stop(now + 0.05)
  }
}

// Export singleton instance
export const soundManager = new SoundManager()
