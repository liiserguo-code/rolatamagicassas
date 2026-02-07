"use client"

import React from "react"

import { useState } from "react"
import { X, Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

interface RegisterModalProps {
  isOpen: boolean
  onClose: () => void
  onAuthSuccess?: (user: User) => void
}

interface User {
  name: string
  email: string
  phone: string
}

type TabType = "register" | "login"

export function RegisterModal({ isOpen, onClose, onAuthSuccess }: RegisterModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("register")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  })
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  })

  if (!isOpen) return null

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const validatePhone = (phone: string) => {
    const numbers = phone.replace(/\D/g, "")
    return numbers.length >= 10 && numbers.length <= 11
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Validations
    if (!formData.name.trim() || formData.name.trim().length < 3) {
      setError("Nome deve ter pelo menos 3 caracteres")
      return
    }

    if (!validateEmail(formData.email)) {
      setError("Email inválido")
      return
    }

    if (!validatePhone(formData.phone)) {
      setError("Telefone inválido")
      return
    }

    if (formData.password.length < 6) {
      setError("Senha deve ter pelo menos 6 caracteres")
      return
    }

    setIsLoading(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Check if user already exists
    const existingUsers = JSON.parse(localStorage.getItem("luxspin_users") || "[]")
    const userExists = existingUsers.some((u: { email: string }) => u.email === formData.email)

    if (userExists) {
      setError("Este email já está cadastrado")
      setIsLoading(false)
      return
    }

    // Save new user
    const newUser = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password, // In production, this should be hashed
      createdAt: new Date().toISOString(),
    }

    existingUsers.push(newUser)
    localStorage.setItem("luxspin_users", JSON.stringify(existingUsers))
    localStorage.setItem("luxspin_current_user", JSON.stringify({
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
    }))

    setSuccess("Conta criada com sucesso!")
    setIsLoading(false)

    // Notify parent and close after delay
    setTimeout(() => {
      onAuthSuccess?.({ name: newUser.name, email: newUser.email, phone: newUser.phone })
      onClose()
      setFormData({ name: "", email: "", phone: "", password: "" })
      setSuccess(null)
    }, 1500)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!validateEmail(loginData.email)) {
      setError("Email inválido")
      return
    }

    if (!loginData.password) {
      setError("Digite sua senha")
      return
    }

    setIsLoading(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Check credentials
    const existingUsers = JSON.parse(localStorage.getItem("luxspin_users") || "[]")
    const user = existingUsers.find(
      (u: { email: string; password: string }) => 
        u.email === loginData.email && u.password === loginData.password
    )

    if (!user) {
      setError("Email ou senha incorretos")
      setIsLoading(false)
      return
    }

    localStorage.setItem("luxspin_current_user", JSON.stringify({
      name: user.name,
      email: user.email,
      phone: user.phone,
    }))

    setSuccess("Login realizado com sucesso!")
    setIsLoading(false)

    // Notify parent and close after delay
    setTimeout(() => {
      onAuthSuccess?.({ name: user.name, email: user.email, phone: user.phone })
      onClose()
      setLoginData({ email: "", password: "" })
      setSuccess(null)
    }, 1500)
  }

  const handleSubmit = (e: React.FormEvent) => {
    if (activeTab === "register") {
      handleRegister(e)
    } else {
      handleLogin(e)
    }
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 2) return `(${numbers}`
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
    if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, rgba(18, 18, 26, 0.95) 0%, rgba(11, 11, 15, 0.98) 100%)',
          border: '1px solid rgba(212, 175, 55, 0.2)',
          boxShadow: '0 0 60px rgba(212, 175, 55, 0.15), 0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Gold border glow */}
        <div 
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, transparent 50%, rgba(212, 175, 55, 0.05) 100%)',
          }}
        />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/5 transition-colors z-10"
          aria-label="Close modal"
        >
          <X className="w-5 h-5 text-[#A0A0A0]" />
        </button>

        <div className="p-6 pt-8">
          {/* Logo/Brand */}
          <h2 className="text-center mb-6">
            <span className="gold-text text-2xl font-bold tracking-wider">LuxSpin</span>
          </h2>

          {/* Tabs */}
          <div className="flex mb-6 rounded-xl overflow-hidden" style={{ background: 'rgba(26, 26, 36, 0.5)' }}>
            <button
              onClick={() => setActiveTab("register")}
              className={`flex-1 py-3 px-4 font-bold text-sm transition-all duration-300 ${
                activeTab === "register"
                  ? 'gold-gradient text-[#0B0B0F]'
                  : 'text-[#A0A0A0] hover:text-[#D4AF37]'
              }`}
            >
              Criar Conta
            </button>
            <button
              onClick={() => setActiveTab("login")}
              className={`flex-1 py-3 px-4 font-bold text-sm transition-all duration-300 ${
                activeTab === "login"
                  ? 'gold-gradient text-[#0B0B0F]'
                  : 'text-[#A0A0A0] hover:text-[#D4AF37]'
              }`}
            >
              Entrar
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === "register" && (
              <>
                {/* Name field */}
                <div>
                  <input
                    type="text"
                    placeholder="Digite seu nome completo"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#1A1A24] border border-[#2A2A3A] text-[#F5F5F5] placeholder-[#6B6B7B] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 focus:scale-[1.02] transition-all duration-200 outline-none"
                    required
                  />
                </div>

                {/* Email field */}
                <div>
                  <input
                    type="email"
                    placeholder="Digite seu email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#1A1A24] border border-[#2A2A3A] text-[#F5F5F5] placeholder-[#6B6B7B] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 focus:scale-[1.02] transition-all duration-200 outline-none"
                    required
                  />
                </div>

                {/* Phone field */}
                <div>
                  <input
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl bg-[#1A1A24] border border-[#2A2A3A] text-[#F5F5F5] placeholder-[#6B6B7B] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 focus:scale-[1.02] transition-all duration-200 outline-none"
                    required
                  />
                  <p className="text-[#6B6B7B] text-xs mt-1.5 px-1">
                    Formato: (11) 99999-9999 para celular ou (11) 3333-3333 para fixo
                  </p>
                </div>

                {/* Password field */}
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Crie uma senha (mín. 6 caracteres)"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    minLength={6}
                    className="w-full px-4 py-3 pr-12 rounded-xl bg-[#1A1A24] border border-[#2A2A3A] text-[#F5F5F5] placeholder-[#6B6B7B] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 focus:scale-[1.02] transition-all duration-200 outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#6B6B7B] hover:text-[#D4AF37] transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  <p className="text-[#6B6B7B] text-xs mt-1.5 px-1">
                    A senha deve conter pelo menos 6 caracteres.
                  </p>
                </div>
              </>
            )}

            {activeTab === "login" && (
              <>
                {/* Email field */}
                <div>
                  <input
                    type="email"
                    placeholder="Digite seu email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#1A1A24] border border-[#2A2A3A] text-[#F5F5F5] placeholder-[#6B6B7B] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 focus:scale-[1.02] transition-all duration-200 outline-none"
                    required
                  />
                </div>

                {/* Password field */}
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua senha"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="w-full px-4 py-3 pr-12 rounded-xl bg-[#1A1A24] border border-[#2A2A3A] text-[#F5F5F5] placeholder-[#6B6B7B] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 focus:scale-[1.02] transition-all duration-200 outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#6B6B7B] hover:text-[#D4AF37] transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </>
            )}

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Success message */}
            {success && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <p className="text-emerald-400 text-sm">{success}</p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-6 rounded-xl font-bold text-base tracking-wider relative overflow-hidden group mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #F7E98E 0%, #D4AF37 50%, #996515 100%)',
                boxShadow: '0 4px 20px rgba(212, 175, 55, 0.3)',
              }}
            >
              <span className="text-[#0B0B0F] relative z-10 flex items-center justify-center gap-2">
                {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                {isLoading 
                  ? (activeTab === "register" ? "Criando conta..." : "Entrando...")
                  : (activeTab === "register" ? "Criar Conta" : "Entrar")
                }
              </span>
              
              {/* Hover effect */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 100%)',
                }}
              />
            </button>
          </form>

          {/* Footer link */}
          <p className="text-center mt-6 text-sm text-[#A0A0A0]">
            {activeTab === "register" ? (
              <>
                Já tem uma conta?{" "}
                <button
                  onClick={() => setActiveTab("login")}
                  className="gold-text font-bold hover:underline"
                >
                  Entrar
                </button>
              </>
            ) : (
              <>
                Não tem uma conta?{" "}
                <button
                  onClick={() => setActiveTab("register")}
                  className="gold-text font-bold hover:underline"
                >
                  Criar Conta
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
