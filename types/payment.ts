export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'expired' | 'rejected'

export type PixKeyType = 'cpf' | 'email' | 'phone' | 'random'

export interface Transaction {
  id: string
  type: 'deposit' | 'withdrawal' | 'bet' | 'win'
  amount: number
  status: PaymentStatus
  createdAt: string
  completedAt?: string
  description?: string
}

export interface UserBalance {
  available: number
  pending: number
  total: number
}

export interface PaymentMethod {
  id: string
  type: 'pix'
  name: string
  enabled: boolean
}
