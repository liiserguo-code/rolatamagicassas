import type { DepositRequest, DepositResponse } from '@/app/api/deposit/route'
import type { WithdrawalRequest, WithdrawalResponse } from '@/app/api/withdrawal/route'
import { logger } from './logger'

export interface Deposit {
  id: string
  amount: number
  status: 'pending' | 'completed' | 'expired'
  createdAt: string
  expiresAt: string
}

export interface Withdrawal {
  id: string
  amount: number
  status: 'pending' | 'processing' | 'completed' | 'rejected'
  pixKey: string
  createdAt: string
  processedAt?: string
}

class PaymentService {
  private baseUrl = '/api'

  /**
   * Create a new deposit
   */
  async createDeposit(data: Omit<DepositRequest, 'paymentMethod'>): Promise<DepositResponse> {
    const startTime = Date.now()
    
    try {
      logger.logPaymentEvent('deposit_initiated', { 
        userId: data.userId, 
        amount: data.amount 
      })
      
      const response = await fetch(`${this.baseUrl}/deposit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          paymentMethod: 'pix'
        }),
      })

      const duration = Date.now() - startTime
      logger.logApiCall('POST', '/api/deposit', response.status, duration)

      if (!response.ok) {
        const error = await response.json()
        logger.logPaymentEvent('deposit_failed', {
          userId: data.userId,
          amount: data.amount,
          error: error.message
        })
        throw new Error(error.message || 'Erro ao criar depósito')
      }

      const result = await response.json()
      logger.logPaymentEvent('deposit_created', {
        userId: data.userId,
        amount: data.amount,
        depositId: result.depositId
      })
      
      return result
    } catch (error) {
      logger.error('PaymentService: Create deposit error', {
        userId: data.userId,
        amount: data.amount,
        error: error instanceof Error ? error.message : String(error)
      })
      throw error
    }
  }

  /**
   * Get deposit status
   */
  async getDepositStatus(depositId: string): Promise<Deposit> {
    try {
      const response = await fetch(`${this.baseUrl}/deposit?depositId=${depositId}`)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao buscar depósito')
      }

      const data = await response.json()
      return data.deposit
    } catch (error) {
      console.error('[PaymentService] Get deposit error:', error)
      throw error
    }
  }

  /**
   * Create a new withdrawal
   */
  async createWithdrawal(data: WithdrawalRequest): Promise<WithdrawalResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/withdrawal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao criar saque')
      }

      return await response.json()
    } catch (error) {
      console.error('[PaymentService] Create withdrawal error:', error)
      throw error
    }
  }

  /**
   * Get withdrawal status
   */
  async getWithdrawalStatus(withdrawalId: string): Promise<Withdrawal> {
    try {
      const response = await fetch(`${this.baseUrl}/withdrawal?withdrawalId=${withdrawalId}`)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao buscar saque')
      }

      const data = await response.json()
      return data.withdrawal
    } catch (error) {
      console.error('[PaymentService] Get withdrawal error:', error)
      throw error
    }
  }

  /**
   * Get all withdrawals for a user
   */
  async getUserWithdrawals(userId: string): Promise<Withdrawal[]> {
    try {
      const response = await fetch(`${this.baseUrl}/withdrawal?userId=${userId}`)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao buscar saques')
      }

      const data = await response.json()
      return data.withdrawals
    } catch (error) {
      console.error('[PaymentService] Get user withdrawals error:', error)
      throw error
    }
  }

  /**
   * Poll deposit status until completed or expired
   */
  async pollDepositStatus(
    depositId: string, 
    onUpdate: (status: string) => void,
    maxAttempts = 30
  ): Promise<Deposit> {
    let attempts = 0
    
    while (attempts < maxAttempts) {
      try {
        const deposit = await this.getDepositStatus(depositId)
        onUpdate(deposit.status)
        
        if (deposit.status === 'completed' || deposit.status === 'expired') {
          return deposit
        }
        
        // Wait 5 seconds before next poll
        await new Promise(resolve => setTimeout(resolve, 5000))
        attempts++
      } catch (error) {
        console.error('[PaymentService] Poll error:', error)
        attempts++
      }
    }
    
    throw new Error('Timeout ao verificar status do depósito')
  }
}

// Export singleton instance
export const paymentService = new PaymentService()

// Helper function to format PIX key based on type
export function formatPixKey(value: string, type: string): string {
  // Remove all non-alphanumeric characters first
  let cleaned = value.replace(/\W/g, '')
  
  switch (type) {
    case 'cpf':
      // Format as XXX.XXX.XXX-XX
      cleaned = cleaned.slice(0, 11)
      if (cleaned.length >= 4) {
        cleaned = cleaned.replace(/(\d{3})(\d)/, '$1.$2')
      }
      if (cleaned.length >= 8) {
        cleaned = cleaned.replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      }
      if (cleaned.length >= 12) {
        cleaned = cleaned.replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4')
      }
      return cleaned
      
    case 'phone':
      // Format as (XX) XXXXX-XXXX or (XX) XXXX-XXXX
      cleaned = cleaned.slice(0, 11)
      if (cleaned.length >= 3) {
        cleaned = cleaned.replace(/(\d{2})(\d)/, '($1) $2')
      }
      if (cleaned.length >= 10) {
        if (cleaned.length === 11) {
          // Mobile: (XX) XXXXX-XXXX
          cleaned = cleaned.replace(/(\d{2})\s(\d{5})(\d)/, '($1) $2-$3')
        } else {
          // Landline: (XX) XXXX-XXXX
          cleaned = cleaned.replace(/(\d{2})\s(\d{4})(\d)/, '($1) $2-$3')
        }
      }
      return cleaned
      
    case 'email':
      // No formatting for email
      return value
      
    case 'random':
      // Random key format (UUID-like)
      return value.toLowerCase()
      
    default:
      return value
  }
}

// Helper function to validate PIX key
export function isValidPixKey(value: string, type: string): boolean {
  switch (type) {
    case 'cpf':
      const cpf = value.replace(/\D/g, '')
      return cpf.length === 11
      
    case 'phone':
      const phone = value.replace(/\D/g, '')
      return phone.length === 10 || phone.length === 11
      
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      
    case 'random':
      return value.length >= 32
      
    default:
      return false
  }
}
