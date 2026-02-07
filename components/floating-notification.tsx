"use client"

import { useEffect, useState } from "react"
import { CheckCircle } from "lucide-react"

interface Notification {
  id: number
  name: string
  amount: number
}

const SAMPLE_NAMES = [
  "Isabela Carvalho",
  "Lucas Oliveira",
  "Maria Santos",
  "Pedro Silva",
  "Ana Costa",
  "João Pereira",
  "Beatriz Lima",
  "Rafael Souza",
  "Camila Rodrigues",
  "Gabriel Almeida",
]

const SAMPLE_AMOUNTS = [100, 200, 350, 500, 600, 750, 1000, 1500, 2000, 2500]

export function FloatingNotification() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    const generateNotification = () => {
      const name = SAMPLE_NAMES[Math.floor(Math.random() * SAMPLE_NAMES.length)]
      const amount = SAMPLE_AMOUNTS[Math.floor(Math.random() * SAMPLE_AMOUNTS.length)]
      
      const newNotification: Notification = {
        id: Date.now(),
        name,
        amount,
      }

      setNotifications(prev => [...prev, newNotification])

      // Remove notification after animation completes
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotification.id))
      }, 5000)
    }

    // Initial notification after 3 seconds
    const initialTimeout = setTimeout(generateNotification, 3000)

    // Generate notifications at random intervals
    const interval = setInterval(() => {
      if (Math.random() > 0.4) {
        generateNotification()
      }
    }, 8000)

    return () => {
      clearTimeout(initialTimeout)
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="fixed bottom-24 right-4 z-40 flex flex-col gap-2 pointer-events-none">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="animate-notification glass-card rounded-xl px-4 py-3 flex items-center gap-3 max-w-xs"
          style={{
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), 0 0 30px rgba(212, 175, 55, 0.1)',
          }}
        >
          <div 
            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.2) 0%, rgba(5, 150, 105, 0.1) 100%)',
            }}
          >
            <CheckCircle className="w-5 h-5 text-[#059669]" />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-[#D4AF37] font-bold text-xs uppercase tracking-wider">
              SAQUE REALIZADO
            </p>
            <p className="text-[#F5F5F5] text-sm truncate">
              {notification.name}
            </p>
            <p className="text-[#059669] font-bold text-sm">
              sacou R$ {notification.amount.toFixed(2).replace('.', ',')}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
