'use client'

import { useMemo, useState } from 'react'
import { useCart } from '@/hooks/use-cart'
import { Minus, Plus, Check, Loader2, Zap, Gift, Package } from 'lucide-react'
import { toast } from 'sonner'
import ProductPrice, { type VariantExtension } from './product-price'
import UrgencyStrip from './urgency-strip'
import TrustStrip from './trust-strip'
import { formatPrice } from '@/lib/utils/format-price'
import { trackAddToCart } from '@/lib/analytics'
import { trackMetaEvent, toMetaCurrencyValue } from '@/lib/meta-pixel'

type BundleTier = 'single' | 'pair' | 'trio'

interface ProductActionsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  product: any
  variantExtensions?: Record<string, VariantExtension>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  companionProduct?: any | null
}

interface VariantOption {
  option_id?: string
  option?: { id: string }
  value: string
}

interface ProductVariantWithPrice {
  id: string
  options?: VariantOption[]
  calculated_price?: {
    calculated_amount?: number
    currency_code?: string
  } | number
  [key: string]: unknown
}

interface ProductOptionValue {
  id?: string
  value: string
}

interface ProductOptionWithValues {
  id: string
  title: string
  values?: (string | ProductOptionValue)[]
}

function getVariantPriceAmount(variant: ProductVariantWithPrice | undefined): number | null {
  const cp = variant?.calculated_price
  if (!cp) return null
  return typeof cp === 'number' ? cp : cp.calculated_amount ?? null
}

export default function ProductActions({ product, variantExtensions, companionProduct }: ProductActionsProps) {
  const variants = useMemo(
    () => (product.variants || []) as unknown as ProductVariantWithPrice[],
    [product.variants],
  )
  const options = useMemo(() => product.options || [], [product.options])

  const companionVariants = useMemo(
    () => (companionProduct?.variants || []) as unknown as ProductVariantWithPrice[],
    [companionProduct],
  )

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {}
    const firstVariant = variants[0]
    if (firstVariant?.options) {
      for (const opt of firstVariant.options) {
        const optionId = opt.option_id || opt.option?.id
        if (optionId && opt.value) defaults[optionId] = opt.value
      }
    }
    return defaults
  })

  const [bundleTier, setBundleTier] = useState<BundleTier>('single')
  const [quantity, setQuantity] = useState(1)
  const [justAdded, setJustAdded] = useState(false)
  const { addItemAsync, isAddingItem } = useCart()
  const [isBundling, setIsBundling] = useState(false)

  const selectedVariant = useMemo(() => {
    if (variants.length <= 1) return variants[0]
    return (
      variants.find((v: ProductVariantWithPrice) => {
        if (!v.options) return false
        return v.options.every((opt: VariantOption) => {
          const optionId = opt.option_id || opt.option?.id
          if (!optionId) return false
          return selectedOptions[optionId] === opt.value
        })
      }) || variants[0]
    )
  }, [variants, selectedOptions])

  const ext = selectedVariant?.id ? variantExtensions?.[selectedVariant.id] : null
  const basePriceCents = getVariantPriceAmount(selectedVariant)
  const cp = selectedVariant?.calculated_price
  const currency =
    (cp && typeof cp !== 'number' ? cp.currency_code : undefined) || 'usd'

  const allowBackorder = ext?.allow_backorder ?? false
  const inventoryQuantity = ext?.inventory_quantity ?? null
  const isOutOfStock = !allowBackorder && inventoryQuantity != null && inventoryQuantity <= 0

  // ── Companion (for Pair tier) ─────────────────────────────────────────
  const matchingCompanionVariant = useMemo<ProductVariantWithPrice | undefined>(() => {
    if (!companionVariants.length) return undefined
    // Prefer a companion variant whose Color matches the selected color (if any).
    const selectedColor = Object.entries(selectedOptions)
      .map(([, v]) => v)
      .find((v) => ['Bone', 'Espresso', 'Olive', 'Sienna'].includes(v))
    if (selectedColor) {
      const matched = companionVariants.find((v) =>
        v.options?.some((o) => o.value === selectedColor),
      )
      if (matched) return matched
    }
    return companionVariants[0]
  }, [companionVariants, selectedOptions])

  const companionPriceCents = getVariantPriceAmount(matchingCompanionVariant)
  const companionTitle = companionProduct?.title || ''

  // ── Tier pricing ──────────────────────────────────────────────────────
  // single: base price × qty
  // pair:   hoodie + companion crewneck, $20 off via auto-promo
  // trio:   3× hoodie, one free via auto-promo (effective price = base × 2)
  const tierMath = useMemo(() => {
    const base = basePriceCents ?? 0
    const comp = companionPriceCents ?? 0
    const PAIR_DISCOUNT = 2000 // cents
    return {
      single: {
        subtotal: base * quantity,
        was: null as number | null,
      },
      pair: {
        subtotal: base + comp - PAIR_DISCOUNT,
        was: base + comp,
      },
      trio: {
        subtotal: base * 2,
        was: base * 3,
      },
    }
  }, [basePriceCents, companionPriceCents, quantity])

  const handleOptionChange = (optionId: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [optionId]: value }))
    setQuantity(1)
  }

  const handleAddToCart = async () => {
    if (!selectedVariant?.id || isOutOfStock) return
    try {
      setIsBundling(true)

      let totalQty = quantity

      if (bundleTier === 'single') {
        await addItemAsync({ variantId: selectedVariant.id, quantity })
      } else if (bundleTier === 'trio') {
        totalQty = 3
        await addItemAsync({ variantId: selectedVariant.id, quantity: 3 })
      } else if (bundleTier === 'pair' && matchingCompanionVariant) {
        totalQty = 2
        await addItemAsync({ variantId: selectedVariant.id, quantity: 1 })
        await addItemAsync({ variantId: matchingCompanionVariant.id, quantity: 1 })
      }

      setJustAdded(true)
      toast.success(
        bundleTier === 'trio'
          ? '3 added — one is free at checkout'
          : bundleTier === 'pair'
            ? `Hoodie + ${companionTitle} added — $20 off applied`
            : 'Added to bag',
      )

      const metaValue = toMetaCurrencyValue(basePriceCents)
      trackAddToCart(product?.id || '', selectedVariant.id, totalQty, basePriceCents ?? undefined)
      trackMetaEvent('AddToCart', {
        content_ids: [selectedVariant.id],
        content_type: 'product',
        content_name: product?.title,
        value: metaValue,
        currency,
        contents: [{ id: selectedVariant.id, quantity: totalQty, item_price: metaValue }],
        num_items: totalQty,
      })
      setTimeout(() => setJustAdded(false), 2500)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add to bag')
    } finally {
      setIsBundling(false)
    }
  }

  const hasMultipleVariants = variants.length > 1
  const busy = isAddingItem || isBundling

  return (
    <div className="space-y-6">
      {/* ── Urgency & social proof ───────────────────────────────── */}
      <UrgencyStrip inventoryQuantity={inventoryQuantity} allowBackorder={allowBackorder} />

      {/* ── Price ────────────────────────────────────────────────── */}
      <div className="pt-1">
        <ProductPrice
          amount={basePriceCents}
          currency={currency}
          compareAtPrice={ext?.compare_at_price}
          soldOut={isOutOfStock}
          size="detail"
        />
      </div>

      {/* ── Option Selectors ─────────────────────────────────────── */}
      {hasMultipleVariants &&
        options.map((option: ProductOptionWithValues) => {
          const values = (option.values || [])
            .map((v: string | ProductOptionValue) => (typeof v === 'string' ? v : v.value))
            .filter(Boolean) as string[]

          if (values.length <= 1 && (values[0] === 'One Size' || values[0] === 'Default')) {
            return null
          }

          const optionId = option.id
          const selectedValue = selectedOptions[optionId]

          return (
            <div key={optionId}>
              <h3 className="text-xs uppercase tracking-[0.15em] font-bold mb-3">
                {option.title}
                {selectedValue && (
                  <span className="ml-2 normal-case tracking-normal font-normal text-muted-foreground">
                    — {selectedValue}
                  </span>
                )}
              </h3>
              <div className="flex flex-wrap gap-2">
                {values.map((value) => {
                  const isSelected = selectedValue === value
                  const isAvailable = variants.some((v) => {
                    const hasValue = v.options?.some(
                      (o) =>
                        (o.option_id === optionId || o.option?.id === optionId) && o.value === value,
                    )
                    if (!hasValue) return false
                    const vExt = variantExtensions?.[v.id]
                    if (!vExt) return true
                    if (vExt.allow_backorder) return true
                    return vExt.inventory_quantity == null || vExt.inventory_quantity > 0
                  })

                  return (
                    <button
                      key={value}
                      onClick={() => handleOptionChange(optionId, value)}
                      disabled={!isAvailable}
                      className={`min-w-[48px] px-4 py-2.5 text-sm font-medium border transition-all ${
                        isSelected
                          ? 'border-foreground bg-foreground text-background'
                          : isAvailable
                            ? 'border-border hover:border-foreground'
                            : 'border-border text-muted-foreground/40 line-through cursor-not-allowed'
                      }`}
                    >
                      {value}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}

      {/* ── Bundle Offer ─────────────────────────────────────────── */}
      <div className="space-y-2">
        <h3 className="text-xs uppercase tracking-[0.15em] font-bold flex items-center gap-2">
          <Gift className="h-3.5 w-3.5 text-accent" strokeWidth={2} />
          Bundle &amp; save
        </h3>
        <div className="grid gap-2">
          {/* Tier: single */}
          <BundleTierOption
            selected={bundleTier === 'single'}
            onSelect={() => setBundleTier('single')}
            title="Single"
            description="Just me, thanks."
            priceLabel={
              basePriceCents != null ? formatPrice(tierMath.single.subtotal, currency) : ''
            }
            badge={null}
          />

          {/* Tier: pair (only if companion) */}
          {companionProduct && matchingCompanionVariant && companionPriceCents != null && (
            <BundleTierOption
              selected={bundleTier === 'pair'}
              onSelect={() => setBundleTier('pair')}
              title={`Hoodie + ${companionTitle}`}
              description="The everyday pair — matching colour."
              priceLabel={formatPrice(tierMath.pair.subtotal, currency)}
              wasLabel={
                tierMath.pair.was != null ? formatPrice(tierMath.pair.was, currency) : null
              }
              badge="SAVE $20"
              icon={Package}
            />
          )}

          {/* Tier: trio (buy 2 get 1 free) */}
          <BundleTierOption
            selected={bundleTier === 'trio'}
            onSelect={() => setBundleTier('trio')}
            title="Buy 2, Get 1 FREE"
            description="Three hoodies, pay for two."
            priceLabel={
              basePriceCents != null ? formatPrice(tierMath.trio.subtotal, currency) : ''
            }
            wasLabel={
              tierMath.trio.was != null ? formatPrice(tierMath.trio.was, currency) : null
            }
            badge="BEST VALUE"
            highlight
            icon={Zap}
          />
        </div>
      </div>

      {/* ── Quantity + Add to Cart ───────────────────────────────── */}
      <div className="flex gap-3">
        {bundleTier === 'single' ? (
          <div className="flex items-center border border-foreground">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-3 hover:bg-muted transition-colors"
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-12 text-center text-sm font-medium tabular-nums">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-3 hover:bg-muted transition-colors"
              disabled={
                isOutOfStock ||
                (!allowBackorder && inventoryQuantity != null && quantity >= inventoryQuantity)
              }
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        ) : null}

        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || busy}
          className={`flex-1 flex items-center justify-center gap-2 py-4 text-xs font-bold uppercase tracking-[0.2em] transition-all ${
            isOutOfStock
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : justAdded
                ? 'bg-green-700 text-white'
                : 'bg-foreground text-background hover:bg-accent'
          }`}
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : justAdded ? (
            <>
              <Check className="h-4 w-4" />
              Added to bag
            </>
          ) : isOutOfStock ? (
            'Sold Out'
          ) : (
            <>
              {bundleTier === 'trio'
                ? 'Add 3 to bag — 1 free'
                : bundleTier === 'pair'
                  ? 'Add pair to bag'
                  : 'Add to bag'}
            </>
          )}
        </button>
      </div>

      {/* ── Trust badges ─────────────────────────────────────────── */}
      <TrustStrip />
    </div>
  )
}

// ────────────────────────────────────────────────────────────────
// Bundle tier option row
// ────────────────────────────────────────────────────────────────

interface BundleTierOptionProps {
  selected: boolean
  onSelect: () => void
  title: string
  description: string
  priceLabel: string
  wasLabel?: string | null
  badge?: string | null
  highlight?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon?: React.ComponentType<any>
}

function BundleTierOption({
  selected,
  onSelect,
  title,
  description,
  priceLabel,
  wasLabel = null,
  badge = null,
  highlight = false,
  icon: Icon,
}: BundleTierOptionProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative w-full text-left px-4 py-3.5 border-2 transition-all ${
        selected
          ? highlight
            ? 'border-accent bg-accent/5'
            : 'border-foreground bg-muted/50'
          : 'border-border hover:border-foreground/50'
      }`}
    >
      {badge && (
        <span
          className={`absolute -top-2.5 left-4 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] ${
            highlight ? 'bg-accent text-accent-foreground' : 'bg-foreground text-background'
          }`}
        >
          {badge}
        </span>
      )}
      <div className="flex items-center gap-3">
        {/* Radio indicator */}
        <span
          className={`flex-shrink-0 h-4 w-4 rounded-full border-2 flex items-center justify-center ${
            selected ? 'border-foreground' : 'border-border'
          }`}
        >
          {selected && <span className="h-2 w-2 rounded-full bg-foreground" />}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-3.5 w-3.5 text-accent" strokeWidth={2} />}
            <p className="font-heading font-bold uppercase tracking-wide text-sm">{title}</p>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>
        </div>

        <div className="text-right flex-shrink-0">
          {wasLabel && (
            <p className="text-[11px] text-muted-foreground line-through leading-none">{wasLabel}</p>
          )}
          <p
            className={`font-heading font-bold text-base tabular-nums ${
              highlight ? 'text-accent' : 'text-foreground'
            }`}
          >
            {priceLabel}
          </p>
        </div>
      </div>
    </button>
  )
}
