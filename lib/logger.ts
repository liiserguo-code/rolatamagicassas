// Centralized logging system for the application

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical'

export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: Record<string, any>
  userId?: string
  sessionId?: string
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private logBuffer: LogEntry[] = []
  private maxBufferSize = 100

  // Format timestamp in ISO format
  private getTimestamp(): string {
    return new Date().toISOString()
  }

  // Get session ID from browser (or generate one)
  private getSessionId(): string {
    if (typeof window === 'undefined') return 'server'
    
    let sessionId = sessionStorage.getItem('luxspin_session_id')
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('luxspin_session_id', sessionId)
    }
    return sessionId
  }

  // Core logging function
  private log(level: LogLevel, message: string, context?: Record<string, any>) {
    const entry: LogEntry = {
      timestamp: this.getTimestamp(),
      level,
      message,
      context,
      sessionId: typeof window !== 'undefined' ? this.getSessionId() : 'server',
    }

    // Add to buffer
    this.logBuffer.push(entry)
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift()
    }

    // Console output with colors
    const emoji = {
      debug: '🔍',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      critical: '🚨',
    }[level]

    const color = {
      debug: '#A0A0A0',
      info: '#4169E1',
      warn: '#F59E0B',
      error: '#DC2626',
      critical: '#7F1D1D',
    }[level]

    if (this.isDevelopment || level !== 'debug') {
      console.log(
        `%c${emoji} [${level.toUpperCase()}] ${entry.timestamp}`,
        `color: ${color}; font-weight: bold`,
        message,
        context || ''
      )
    }

    // Send to backend for persistence (only in production and for important logs)
    if (!this.isDevelopment && (level === 'error' || level === 'critical')) {
      this.sendToBackend(entry)
    }
  }

  // Send log to backend API
  private async sendToBackend(entry: LogEntry) {
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      })
    } catch (error) {
      // Silent fail - don't log errors about logging
      console.error('Failed to send log to backend:', error)
    }
  }

  // Public logging methods
  debug(message: string, context?: Record<string, any>) {
    this.log('debug', message, context)
  }

  info(message: string, context?: Record<string, any>) {
    this.log('info', message, context)
  }

  warn(message: string, context?: Record<string, any>) {
    this.log('warn', message, context)
  }

  error(message: string, context?: Record<string, any>) {
    this.log('error', message, context)
  }

  critical(message: string, context?: Record<string, any>) {
    this.log('critical', message, context)
  }

  // Game-specific logging methods
  logGameEvent(event: string, data: Record<string, any>) {
    this.info(`Game: ${event}`, { ...data, category: 'game' })
  }

  logPaymentEvent(event: string, data: Record<string, any>) {
    this.info(`Payment: ${event}`, { ...data, category: 'payment' })
  }

  logAuthEvent(event: string, data: Record<string, any>) {
    this.info(`Auth: ${event}`, { ...data, category: 'auth' })
  }

  logApiCall(method: string, endpoint: string, status: number, duration?: number) {
    const level = status >= 400 ? 'error' : 'info'
    this.log(level, `API: ${method} ${endpoint}`, {
      category: 'api',
      status,
      duration,
    })
  }

  // Get recent logs (for debugging)
  getRecentLogs(count: number = 50): LogEntry[] {
    return this.logBuffer.slice(-count)
  }

  // Export logs as JSON
  exportLogs(): string {
    return JSON.stringify(this.logBuffer, null, 2)
  }

  // Clear log buffer
  clearLogs() {
    this.logBuffer = []
  }
}

// Export singleton instance
export const logger = new Logger()

// Export convenience function for error boundaries
export function logError(error: Error, componentStack?: string) {
  logger.error('React Error Boundary caught error', {
    error: error.message,
    stack: error.stack,
    componentStack,
  })
}
