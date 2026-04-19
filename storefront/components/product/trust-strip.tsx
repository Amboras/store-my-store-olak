import { Truck, RotateCcw, Shield, Scissors, Award, CreditCard, Lock } from 'lucide-react'

/**
 * Conversion-focused trust row for the product page.
 * Emphasises the brand guarantees, not generic e-commerce badges.
 */
export default function TrustStrip() {
  return (
    <div className="space-y-4">
      {/* Brand promises */}
      <div className="grid grid-cols-2 gap-3 border-y py-5">
        <div className="flex items-start gap-3">
          <Scissors className="h-5 w-5 flex-shrink-0 text-accent mt-0.5" strokeWidth={1.5} />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider">Free Embroidery</p>
            <p className="text-[11px] text-muted-foreground leading-snug">On orders $120+</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Award className="h-5 w-5 flex-shrink-0 text-accent mt-0.5" strokeWidth={1.5} />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider">Lifetime Stitching</p>
            <p className="text-[11px] text-muted-foreground leading-snug">Guaranteed seams</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Truck className="h-5 w-5 flex-shrink-0 text-accent mt-0.5" strokeWidth={1.5} />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider">Free US Shipping</p>
            <p className="text-[11px] text-muted-foreground leading-snug">Orders over $75</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <RotateCcw className="h-5 w-5 flex-shrink-0 text-accent mt-0.5" strokeWidth={1.5} />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider">60-Day Returns</p>
            <p className="text-[11px] text-muted-foreground leading-snug">No questions asked</p>
          </div>
        </div>
      </div>

      {/* Secure checkout row */}
      <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
        <Lock className="h-3.5 w-3.5" strokeWidth={1.75} />
        <span className="uppercase tracking-wider">Secure checkout</span>
        <span className="opacity-40">•</span>
        <Shield className="h-3.5 w-3.5" strokeWidth={1.75} />
        <span className="uppercase tracking-wider">256-bit SSL</span>
        <span className="opacity-40">•</span>
        <CreditCard className="h-3.5 w-3.5" strokeWidth={1.75} />
        <span className="uppercase tracking-wider">Apple Pay / Stripe</span>
      </div>
    </div>
  )
}
