"use client"

import { useState } from "react"
import { X, Wallet, ArrowDownToLine, ArrowUpFromLine, Copy, CheckCircle2, Clock, CreditCard, AlertCircle } from "lucide-react"
import { paymentService, formatPixKey, isValidPixKey } from "@/lib/payment-service"

interface DepositModalProps {
  isOpen: boolean
  onClose: () => void
  onDepositComplete?: (amount: number) => void
  currentBalance: number
}

type TabType = "deposit" | "withdraw"
type DepositStatus = "selecting" | "processing" | "completed"
type WithdrawStatus = "form" | "pending"

const DEPOSIT_AMOUNTS = [10, 25, 50, 100, 250, 500]

export function DepositModal({ isOpen, onClose, onDepositComplete, currentBalance }: DepositModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("deposit")
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState("")
  const [depositStatus, setDepositStatus] = useState<DepositStatus>("selecting")
  const [withdrawStatus, setWithdrawStatus] = useState<WithdrawStatus>("form")
  const [pixKey, setPixKey] = useState("")
  const [pixKeyType, setPixKeyType] = useState<'cpf' | 'email' | 'phone' | 'random'>('cpf')
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [copiedPix, setCopiedPix] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // API response data
  const [pixCode, setPixCode] = useState("")
  const [pixQRCode, setPixQRCode] = useState("")
  const [depositId, setDepositId] = useState("")

  if (!isOpen) return null

  const handleDepositSelect = (amount: number) => {
    setSelectedAmount(amount)
  }

  const handleConfirmDeposit = async () => {
    const amount = selectedAmount || parseFloat(customAmount)
    if (amount > 0) {
      setIsLoading(true)
      setError(null)
      
      try {
        console.log("[v0] Creating deposit:", amount)
        
        // Call API to create deposit
        const response = await paymentService.createDeposit({
          userId: 'demo-user', // TODO: Replace with actual user ID from auth
          amount
        })

        if (response.success && response.pixCode && response.pixQRCode) {
          console.log("[v0] Deposit created successfully:", response.depositId)
          setPixCode(response.pixCode)
          setPixQRCode(response.pixQRCode)
          setDepositId(response.depositId)
          setDepositStatus("processing")
        } else {
          throw new Error('Falha ao criar depósito')
        }
      } catch (err) {
        console.error("[v0] Deposit error:", err)
        setError(err instanceof Error ? err.message : 'Erro ao processar depósito')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleFinishDeposit = () => {
    const amount = selectedAmount || parseFloat(customAmount)
    if (onDepositComplete && amount > 0) {
      onDepositComplete(amount)
    }
    resetModal()
    onClose()
  }

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount)
    
    // Validate inputs
    if (!isValidPixKey(pixKey, pixKeyType)) {
      setError('Chave PIX inválida')
      return
    }
    
    if (amount > 0 && amount <= currentBalance && pixKey.trim()) {
      setIsLoading(true)
      setError(null)
      
      try {
        console.log("[v0] Creating withdrawal:", { amount, pixKey, pixKeyType })
        
        // Call API to create withdrawal
        const response = await paymentService.createWithdrawal({
          userId: 'demo-user', // TODO: Replace with actual user ID from auth
          amount,
          pixKey,
          pixKeyType
        })

        if (response.success) {
          console.log("[v0] Withdrawal created:", response.withdrawalId, "Status:", response.status)
          setWithdrawStatus("pending")
          
          // Update user balance - deduct withdrawal amount
          onDepositComplete?.(-amount)
        } else {
          throw new Error(response.message || 'Falha ao criar saque')
        }
      } catch (err) {
        console.error("[v0] Withdrawal error:", err)
        setError(err instanceof Error ? err.message : 'Erro ao processar saque')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const copyPixCode = () => {
    navigator.clipboard.writeText(pixCode)
    setCopiedPix(true)
    setTimeout(() => setCopiedPix(false), 2000)
  }

  const resetModal = () => {
    setSelectedAmount(null)
    setCustomAmount("")
    setDepositStatus("selecting")
    setWithdrawStatus("form")
    setPixKey("")
    setPixKeyType("cpf")
    setWithdrawAmount("")
    setActiveTab("deposit")
    setError(null)
    setIsLoading(false)
    setPixCode("")
    setPixQRCode("")
    setDepositId("")
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  const finalAmount = selectedAmount || parseFloat(customAmount) || 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-md glass-card rounded-2xl p-6 animate-modal-in"
        style={{
          background: 'linear-gradient(135deg, rgba(26, 26, 36, 0.98) 0%, rgba(18, 18, 26, 0.98) 100%)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 100px rgba(212, 175, 55, 0.1)',
          border: '1px solid rgba(212, 175, 55, 0.2)',
        }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/5 transition-colors group"
          aria-label="Fechar"
        >
          <X className="w-5 h-5 text-[#A0A0A0] group-hover:text-[#D4AF37]" />
        </button>

        {/* Header with tabs */}
        <div className="mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Wallet className="w-6 h-6 text-[#D4AF37]" />
            <h2 className="text-2xl font-bold gold-text">Carteira</h2>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-2 p-1 rounded-lg bg-[#0B0B0F]/50">
            <button
              onClick={() => setActiveTab("deposit")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-300 ${
                activeTab === "deposit"
                  ? "gold-gradient text-[#0B0B0F]"
                  : "text-[#A0A0A0] hover:text-[#D4AF37]"
              }`}
            >
              <ArrowDownToLine className="w-4 h-4" />
              Depositar
            </button>
            <button
              onClick={() => setActiveTab("withdraw")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-300 ${
                activeTab === "withdraw"
                  ? "gold-gradient text-[#0B0B0F]"
                  : "text-[#A0A0A0] hover:text-[#D4AF37]"
              }`}
            >
              <ArrowUpFromLine className="w-4 h-4" />
              Sacar
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-[#DC2626]/10 border border-[#DC2626]/20 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-[#DC2626] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[#DC2626]">{error}</p>
          </div>
        )}

        {/* Deposit Tab */}
        {activeTab === "deposit" && (
          <div className="space-y-4">
            {depositStatus === "selecting" && (
              <>
                {/* Header with icon */}
                <div className="text-center mb-6 pb-4 border-b border-[#2A2A3A]">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gold-gradient mb-3">
                    <Wallet className="w-8 h-8 text-[#0B0B0F]" />
                  </div>
                  <h3 className="text-xl font-bold gold-text mb-1">Fazer Depósito</h3>
                  <p className="text-sm text-[#A0A0A0]">Escolha o valor e confirme via PIX</p>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-semibold text-[#D4AF37] uppercase tracking-wider flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Valor do Depósito
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {DEPOSIT_AMOUNTS.map((amount) => (
                      <button
                        key={amount}
                        onClick={() => {
                          handleDepositSelect(amount)
                          setCustomAmount("")
                        }}
                        className={`relative py-4 px-4 rounded-xl font-bold text-base transition-all duration-300 overflow-hidden group ${
                          selectedAmount === amount
                            ? "gold-gradient text-[#0B0B0F] scale-[1.03]"
                            : "bg-gradient-to-br from-[#1A1A24] to-[#12121C] text-[#A0A0A0] hover:text-[#D4AF37] border-2 border-[#2A2A3A] hover:border-[#D4AF37]/50"
                        }`}
                        style={
                          selectedAmount === amount
                            ? { boxShadow: "0 0 25px rgba(212, 175, 55, 0.5), 0 4px 15px rgba(0, 0, 0, 0.3)" }
                            : {}
                        }
                      >
                        {/* Shine effect */}
                        {selectedAmount === amount && (
                          <div 
                            className="absolute inset-0 opacity-30"
                            style={{
                              background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.4) 50%, transparent 70%)',
                              animation: 'shimmer 2s infinite',
                            }}
                          />
                        )}
                        <div className="relative z-10 flex flex-col items-center gap-1">
                          <span className="text-xs opacity-70">R$</span>
                          <span className="text-lg">{amount}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative mt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />
                    <span className="text-xs font-semibold text-[#D4AF37] uppercase tracking-widest px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20">
                      ou
                    </span>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />
                  </div>
                  
                  <label className="text-sm font-semibold text-[#D4AF37] uppercase tracking-wider block mb-3 flex items-center gap-2">
                    <div className="w-1 h-4 bg-[#D4AF37] rounded-full" />
                    Valor Personalizado
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#D4AF37]/20 to-[#9333EA]/20 opacity-0 group-focus-within:opacity-100 blur-lg transition-opacity duration-300" />
                    <div className="relative">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#D4AF37] font-bold text-lg">
                        R$
                      </span>
                      <input
                        type="number"
                        value={customAmount}
                        onChange={(e) => {
                          setCustomAmount(e.target.value)
                          setSelectedAmount(null)
                        }}
                        placeholder="Digite o valor"
                        className="w-full py-4 pl-14 pr-5 bg-gradient-to-br from-[#1A1A24] to-[#12121C] border-2 border-[#2A2A3A] rounded-xl text-[#F5F5F5] text-lg font-semibold placeholder:text-[#666] focus:outline-none focus:border-[#D4AF37]/60 transition-all duration-300"
                        min="1"
                        step="0.01"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-[#A0A0A0] mt-2 ml-1">Valor mínimo: R$ 10,00</p>
                </div>

                {/* Summary card */}
                {finalAmount > 0 && (
                  <div className="glass-card rounded-xl p-4 border border-[#D4AF37]/20 bg-gradient-to-br from-[#D4AF37]/5 to-transparent">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#A0A0A0]">Valor a depositar:</span>
                      <span className="text-2xl font-bold gold-text">R$ {finalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleConfirmDeposit}
                  disabled={finalAmount <= 0 || isLoading}
                  className="relative w-full py-4 px-6 rounded-xl font-bold text-base tracking-wider gold-gradient text-[#0B0B0F] disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 overflow-hidden group mt-6"
                  style={{
                    boxShadow: finalAmount > 0 ? "0 8px 30px rgba(212, 175, 55, 0.5), 0 4px 15px rgba(0, 0, 0, 0.3)" : "none",
                  }}
                >
                  {/* Animated shine effect */}
                  {!isLoading && finalAmount > 0 && (
                    <div 
                      className="absolute inset-0 opacity-40"
                      style={{
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.6) 50%, transparent 100%)',
                        animation: 'shimmer 3s infinite',
                      }}
                    />
                  )}
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        Processando...
                      </>
                    ) : (
                      <>
                        <ArrowDownToLine className="w-5 h-5" />
                        Confirmar Depósito
                      </>
                    )}
                  </span>
                </button>
              </>
            )}

            {depositStatus === "processing" && (
              <div className="py-8 space-y-6">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <CreditCard className="w-16 h-16 text-[#D4AF37] animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#F5F5F5] mb-2">
                      Escaneie o QR Code PIX
                    </h3>
                    <p className="text-sm text-[#A0A0A0]">
                      Use o app do seu banco para pagar
                    </p>
                  </div>
                </div>

                {/* QR Code */}
                <div className="flex justify-center">
                  <div 
                    className="w-48 h-48 bg-white rounded-lg flex items-center justify-center overflow-hidden"
                    style={{
                      boxShadow: "0 0 30px rgba(212, 175, 55, 0.3)",
                    }}
                  >
                    {pixQRCode ? (
                      <img 
                        src={pixQRCode} 
                        alt="QR Code PIX" 
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <CreditCard className="w-12 h-12 text-[#0B0B0F] mx-auto mb-2 animate-pulse" />
                        <p className="text-xs text-[#666]">Gerando QR Code...</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* PIX Code */}
                {pixCode && (
                  <div className="space-y-2">
                    <label className="text-xs text-[#A0A0A0] uppercase tracking-wider">
                      Ou copie o código PIX
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-1 py-2.5 px-3 bg-[#1A1A24] border border-[#2A2A3A] rounded-lg text-xs text-[#A0A0A0] overflow-hidden">
                        <code className="break-all">{pixCode}</code>
                      </div>
                      <button
                        onClick={copyPixCode}
                        className="px-4 py-2.5 rounded-lg bg-[#1A1A24] border border-[#2A2A3A] hover:border-[#D4AF37]/50 transition-colors"
                      >
                        {copiedPix ? (
                          <CheckCircle2 className="w-5 h-5 text-[#059669]" />
                        ) : (
                          <Copy className="w-5 h-5 text-[#A0A0A0]" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleFinishDeposit}
                  className="w-full py-3 px-6 rounded-lg font-semibold text-sm bg-[#059669] text-white hover:bg-[#059669]/90 transition-colors"
                >
                  Já realizei o pagamento
                </button>

                <p className="text-xs text-center text-[#666]">
                  O saldo será creditado automaticamente após confirmação
                </p>
              </div>
            )}

            {depositStatus === "completed" && (
              <div className="py-8 text-center space-y-4">
                <div className="flex justify-center">
                  <CheckCircle2 className="w-16 h-16 text-[#059669]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#F5F5F5] mb-2">
                    Depósito Confirmado!
                  </h3>
                  <p className="text-sm text-[#A0A0A0]">
                    R$ {finalAmount.toFixed(2)} foram adicionados à sua conta
                  </p>
                </div>
                <button
                  onClick={handleFinishDeposit}
                  className="w-full py-3 px-6 rounded-lg font-semibold gold-gradient text-[#0B0B0F] hover:scale-[1.02] transition-transform"
                >
                  Continuar Jogando
                </button>
              </div>
            )}
          </div>
        )}

        {/* Withdraw Tab */}
        {activeTab === "withdraw" && (
          <div className="space-y-4">
            {withdrawStatus === "form" && (
              <>
                <div className="p-4 rounded-lg bg-[#1A1A24] border border-[#2A2A3A]">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#A0A0A0]">Saldo disponível</span>
                    <span className="text-lg font-bold gold-text">
                      R$ {currentBalance.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-[#A0A0A0] uppercase tracking-wider">
                    Valor do saque
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A0A0A0] font-semibold">
                      R$
                    </span>
                    <input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="0,00"
                      className="w-full py-3 pl-12 pr-4 bg-[#1A1A24] border border-[#2A2A3A] rounded-lg text-[#F5F5F5] placeholder:text-[#666] focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
                      min="1"
                      max={currentBalance}
                      step="0.01"
                    />
                  </div>
                  <button
                    onClick={() => setWithdrawAmount(currentBalance.toString())}
                    className="text-xs text-[#D4AF37] hover:underline"
                  >
                    Sacar tudo
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-[#A0A0A0] uppercase tracking-wider">
                    Tipo de Chave PIX
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'cpf', label: 'CPF' },
                      { value: 'email', label: 'E-mail' },
                      { value: 'phone', label: 'Telefone' },
                      { value: 'random', label: 'Aleatória' }
                    ].map((type) => (
                      <button
                        key={type.value}
                        onClick={() => {
                          setPixKeyType(type.value as typeof pixKeyType)
                          setPixKey("")
                        }}
                        className={`py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                          pixKeyType === type.value
                            ? "bg-[#D4AF37] text-[#0B0B0F]"
                            : "bg-[#1A1A24] text-[#A0A0A0] border border-[#2A2A3A] hover:border-[#D4AF37]/30"
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-[#A0A0A0] uppercase tracking-wider">
                    Chave PIX
                  </label>
                  <input
                    type="text"
                    value={pixKey}
                    onChange={(e) => {
                      const formatted = formatPixKey(e.target.value, pixKeyType)
                      setPixKey(formatted)
                      setError(null)
                    }}
                    placeholder={
                      pixKeyType === 'cpf' ? '000.000.000-00' :
                      pixKeyType === 'email' ? 'email@exemplo.com' :
                      pixKeyType === 'phone' ? '(00) 00000-0000' :
                      'Chave aleatória'
                    }
                    className="w-full py-3 px-4 bg-[#1A1A24] border border-[#2A2A3A] rounded-lg text-[#F5F5F5] placeholder:text-[#666] focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
                  />
                  <p className="text-xs text-[#666]">
                    Informe a chave PIX cadastrada no seu banco
                  </p>
                </div>

                <button
                  onClick={handleWithdraw}
                  disabled={
                    isLoading ||
                    !pixKey.trim() ||
                    parseFloat(withdrawAmount) <= 0 ||
                    parseFloat(withdrawAmount) > currentBalance
                  }
                  className="w-full py-3.5 px-6 rounded-xl font-bold text-sm tracking-wider gold-gradient text-[#0B0B0F] disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] transition-transform duration-300"
                  style={{
                    boxShadow:
                      pixKey.trim() && parseFloat(withdrawAmount) > 0
                        ? "0 4px 20px rgba(212, 175, 55, 0.4)"
                        : "none",
                  }}
                >
                  {isLoading ? "Processando..." : "Solicitar Saque"}
                </button>

                <div className="p-3 rounded-lg bg-[#DC2626]/10 border border-[#DC2626]/20">
                  <p className="text-xs text-[#DC2626] text-center">
                    Saques são processados em até 24 horas úteis
                  </p>
                </div>
              </>
            )}

            {withdrawStatus === "pending" && (
              <div className="py-8 text-center space-y-4">
                <div className="flex justify-center">
                  <Clock className="w-16 h-16 text-[#F59E0B] animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#F5F5F5] mb-2">
                    Saque em Análise
                  </h3>
                  <p className="text-sm text-[#A0A0A0] mb-4">
                    Sua solicitação de saque está sendo processada
                  </p>
                  <div className="inline-block px-4 py-2 rounded-lg bg-[#F59E0B]/20 border border-[#F59E0B]/30">
                    <p className="text-lg font-bold text-[#F59E0B]">
                      R$ {parseFloat(withdrawAmount).toFixed(2)}
                    </p>
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-[#1A1A24] border border-[#2A2A3A] text-left space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#A0A0A0]">Chave PIX:</span>
                    <span className="text-[#F5F5F5] font-mono">{pixKey}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#A0A0A0]">Status:</span>
                    <span className="text-[#F59E0B] font-semibold flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Pendente
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#666]">
                  Você receberá uma notificação quando o saque for aprovado
                </p>

                <button
                  onClick={handleClose}
                  className="w-full py-3 px-6 rounded-lg font-semibold text-sm bg-[#1A1A24] border border-[#2A2A3A] text-[#F5F5F5] hover:border-[#D4AF37]/50 transition-colors"
                >
                  Fechar
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
