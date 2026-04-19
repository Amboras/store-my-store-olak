'use client'

import { useState } from 'react'
import { X, Truck, Scissors, Sparkles } from 'lucide-react'

const MESSAGES = [
  { icon: Truck, text: 'Free shipping on orders over $75' },
  { icon: Scissors, text: 'Custom embroidery — no minimums' },
  { icon: Sparkles, text: 'New drop: Heavyweight 500gsm Fleece' },
]

export default function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="relative bg-foreground text-primary-foreground overflow-hidden">
      <div className="container-custom flex items-center justify-center py-2.5 text-[12px] tracking-[0.15em] uppercase font-medium">
        <div className="hidden sm:flex items-center gap-10">
          {MESSAGES.map((m, i) => {
            const Icon = m.icon
            return (
              <div key={i} className="flex items-center gap-2">
                <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                <span>{m.text}</span>
              </div>
            )
          })}
        </div>
        <div className="sm:hidden flex items-center gap-2">
          <Truck className="h-3.5 w-3.5" strokeWidth={1.75} />
          <span>Free shipping over $75</span>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-4 p-1 hover:opacity-70 transition-opacity"
          aria-label="Dismiss announcement"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
