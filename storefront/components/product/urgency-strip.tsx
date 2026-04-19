'use client'

import { useEffect, useState } from 'react'
import { Flame, Eye, Clock } from 'lucide-react'

interface UrgencyStripProps {
  inventoryQuantity: number | null
  allowBackorder: boolean
}

/**
 * Shows live conversion urgency: limited-time countdown + active viewers + low-stock bar.
 * Deliberately designed to feel like real signals (not random churn on every render).
 */
export default function UrgencyStrip({ inventoryQuantity, allowBackorder }: UrgencyStripProps) {
  // Pick a viewer count that is stable per session rather than on every render.
  const [viewers, setViewers] = useState(() => 18)

  useEffect(() => {
    // On mount, set a realistic viewer count and nudge it every ~20s.
    setViewers(12 + Math.floor(Math.random() * 19))
    const interval = setInterval(() => {
      setViewers((v) => {
        const delta = Math.floor(Math.random() * 5) - 2
        const next = v + delta
        return Math.max(8, Math.min(42, next))
      })
    }, 20000)
    return () => clearInterval(interval)
  }, [])

  // Countdown to end of day (shows "Offer ends in HH:MM:SS")
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const endOfDay = new Date()
  endOfDay.setHours(23, 59, 59, 999)
  const remainingMs = Math.max(0, endOfDay.getTime() - now)
  const hours = Math.floor(remainingMs / 3600000)
  const minutes = Math.floor((remainingMs % 3600000) / 60000)
  const seconds = Math.floor((remainingMs % 60000) / 1000)

  const pad = (n: number) => n.toString().padStart(2, '0')

  // Low-stock bar (only when tracking inventory and <15 left)
  const showStockBar =
    !allowBackorder && inventoryQuantity != null && inventoryQuantity > 0 && inventoryQuantity < 15
  const stockPct = showStockBar
    ? Math.max(6, Math.min(100, ((inventoryQuantity ?? 0) / 15) * 100))
    : 0

  return (
    <div className="space-y-3">
      {/* Limited drop countdown */}
      <div className="flex items-center justify-between gap-4 bg-foreground text-background px-4 py-3">
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-accent" strokeWidth={2} />
          <span className="text-xs font-bold uppercase tracking-[0.15em]">Drop offer ends in</span>
        </div>
        <div className="flex items-center gap-1 font-heading text-sm font-bold tabular-nums">
          <Clock className="h-3.5 w-3.5 mr-1 opacity-70" strokeWidth={2} />
          <span>{pad(hours)}</span>
          <span className="opacity-50">:</span>
          <span>{pad(minutes)}</span>
          <span className="opacity-50">:</span>
          <span className="text-accent">{pad(seconds)}</span>
        </div>
      </div>

      {/* Viewer social proof */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
        </span>
        <Eye className="h-3.5 w-3.5" strokeWidth={1.75} />
        <span>
          <strong className="text-foreground font-semibold">{viewers} people</strong> are looking at this right now
        </span>
      </div>

      {/* Low stock bar */}
      {showStockBar && (
        <div>
          <div className="flex items-center justify-between text-[11px] uppercase tracking-wider font-semibold mb-1.5">
            <span className="text-accent">Selling fast</span>
            <span className="text-muted-foreground">Only {inventoryQuantity} left</span>
          </div>
          <div className="h-1.5 bg-muted overflow-hidden rounded-full">
            <div
              className="h-full bg-accent transition-all duration-500"
              style={{ width: `${stockPct}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
