import { NextRequest, NextResponse } from 'next/server'

export interface WithdrawalRequest {
  userId: string
  amount: number
  pixKey: string
  pixKeyType: 'cpf' | 'email' | 'phone' | 'random'
}

export interface WithdrawalResponse {
  success: boolean
  withdrawalId?: string
  status?: 'pending' | 'processing' | 'completed' | 'rejected'
  estimatedTime?: string
  message?: string
}

// In-memory storage for demo (replace with database)
const withdrawals = new Map<string, {
  id: string
  userId: string
  amount: number
  pixKey: string
  pixKeyType: string
  status: 'pending' | 'processing' | 'completed' | 'rejected'
  createdAt: Date
  processedAt?: Date
}>()

export async function POST(request: NextRequest) {
  try {
    const body: WithdrawalRequest = await request.json()
    
    const { userId, amount, pixKey, pixKeyType } = body

    // Validation
    if (!userId || !amount || amount <= 0) {
      return NextResponse.json(
        { success: false, message: 'Dados de saque inválidos' },
        { status: 400 }
      )
    }

    if (!pixKey || !pixKeyType) {
      return NextResponse.json(
        { success: false, message: 'Chave PIX é obrigatória' },
        { status: 400 }
      )
    }

    // Minimum withdrawal amount
    if (amount < 10) {
      return NextResponse.json(
        { success: false, message: 'Valor mínimo de saque é R$ 10,00' },
        { status: 400 }
      )
    }

    // TODO: Check user balance in database
    // const userBalance = await getUserBalance(userId)
    // if (userBalance < amount) {
    //   return NextResponse.json(
    //     { success: false, message: 'Saldo insuficiente' },
    //     { status: 400 }
    //   )
    // }

    // Validate PIX key format
    if (!validatePixKey(pixKey, pixKeyType)) {
      return NextResponse.json(
        { success: false, message: 'Chave PIX inválida' },
        { status: 400 }
      )
    }

    // Generate withdrawal ID
    const withdrawalId = `WTH${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    
    // Create withdrawal (always starts as pending as requested)
    withdrawals.set(withdrawalId, {
      id: withdrawalId,
      userId,
      amount,
      pixKey,
      pixKeyType,
      status: 'pending',
      createdAt: new Date()
    })

    // TODO: Integrate with payment gateway for withdrawal processing
    // Example:
    // const paymentGatewayResponse = await paymentGateway.createPixWithdrawal({
    //   amount,
    //   pixKey,
    //   pixKeyType,
    //   callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/withdrawal/callback`
    // })

    // TODO: Deduct amount from user balance in database
    // await updateUserBalance(userId, -amount)

    console.log('[v0] Withdrawal created:', withdrawalId, 'Amount:', amount, 'User:', userId, 'PIX:', pixKey)

    return NextResponse.json<WithdrawalResponse>({
      success: true,
      withdrawalId,
      status: 'pending',
      estimatedTime: '1-3 dias úteis',
      message: 'Saque solicitado com sucesso. Aguarde aprovação.'
    })
  } catch (error) {
    console.error('[v0] Withdrawal error:', error)
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const withdrawalId = searchParams.get('withdrawalId')
    const userId = searchParams.get('userId')

    if (withdrawalId) {
      // Get specific withdrawal
      const withdrawal = withdrawals.get(withdrawalId)

      if (!withdrawal) {
        return NextResponse.json(
          { success: false, message: 'Saque não encontrado' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        withdrawal: {
          id: withdrawal.id,
          amount: withdrawal.amount,
          status: withdrawal.status,
          pixKey: maskPixKey(withdrawal.pixKey, withdrawal.pixKeyType),
          createdAt: withdrawal.createdAt,
          processedAt: withdrawal.processedAt
        }
      })
    } else if (userId) {
      // Get all withdrawals for user
      const userWithdrawals = Array.from(withdrawals.values())
        .filter(w => w.userId === userId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map(w => ({
          id: w.id,
          amount: w.amount,
          status: w.status,
          pixKey: maskPixKey(w.pixKey, w.pixKeyType),
          createdAt: w.createdAt,
          processedAt: w.processedAt
        }))

      return NextResponse.json({
        success: true,
        withdrawals: userWithdrawals
      })
    } else {
      return NextResponse.json(
        { success: false, message: 'ID do saque ou usuário é obrigatório' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('[v0] Get withdrawal error:', error)
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Helper function to validate PIX key format
function validatePixKey(key: string, type: string): boolean {
  switch (type) {
    case 'cpf':
      // Remove non-digits and check if it's 11 digits
      const cpf = key.replace(/\D/g, '')
      return cpf.length === 11
    case 'email':
      // Basic email validation
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(key)
    case 'phone':
      // Remove non-digits and check if it's 10 or 11 digits (with area code)
      const phone = key.replace(/\D/g, '')
      return phone.length === 10 || phone.length === 11
    case 'random':
      // Random key (UUID format)
      return key.length >= 32
    default:
      return false
  }
}

// Helper function to mask PIX key for privacy
function maskPixKey(key: string, type: string): string {
  switch (type) {
    case 'cpf':
      const cpf = key.replace(/\D/g, '')
      return `***${cpf.slice(-3)}`
    case 'email':
      const [username, domain] = key.split('@')
      return `${username.slice(0, 3)}***@${domain}`
    case 'phone':
      const phone = key.replace(/\D/g, '')
      return `***${phone.slice(-4)}`
    case 'random':
      return `${key.slice(0, 8)}...${key.slice(-8)}`
    default:
      return '***'
  }
}
