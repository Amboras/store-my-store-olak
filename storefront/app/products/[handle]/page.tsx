import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const revalidate = 3600 // ISR: revalidate every hour
import { medusaServerClient } from '@/lib/medusa-client'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight, Flame, Scissors, Ruler, Award } from 'lucide-react'
import ProductActions from '@/components/product/product-actions'
import ProductAccordion from '@/components/product/product-accordion'
import { ProductViewTracker } from '@/components/product/product-view-tracker'
import { getProductPlaceholder } from '@/lib/utils/placeholder-images'
import { type VariantExtension } from '@/components/product/product-price'

async function getProduct(handle: string) {
  try {
    const regionsResponse = await medusaServerClient.store.region.list()
    const regionId = regionsResponse.regions[0]?.id
    if (!regionId) throw new Error('No region found')

    const response = await medusaServerClient.store.product.list({
      handle,
      region_id: regionId,
      fields: '*variants.calculated_price',
    })
    return response.products?.[0] || null
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

async function getCompanionProduct(currentProductId: string) {
  try {
    const regionsResponse = await medusaServerClient.store.region.list()
    const regionId = regionsResponse.regions[0]?.id
    if (!regionId) return null

    const response = await medusaServerClient.store.product.list({
      region_id: regionId,
      fields: '*variants.calculated_price',
      limit: 10,
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const others = (response.products || []).filter((p: any) => p.id !== currentProductId)
    // Prefer a product whose title contains "Crewneck" for a clear
    // complementary pairing when available.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const preferred = others.find((p: any) => /crewneck|classic/i.test(p.title))
    return preferred || others[0] || null
  } catch (error) {
    console.error('Error fetching companion:', error)
    return null
  }
}

async function getVariantExtensions(productId: string): Promise<Record<string, VariantExtension>> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
    const storeId = process.env.NEXT_PUBLIC_STORE_ID
    const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    const headers: Record<string, string> = {}
    if (storeId) headers['X-Store-Environment-ID'] = storeId
    if (publishableKey) headers['x-publishable-api-key'] = publishableKey

    const res = await fetch(
      `${baseUrl}/store/product-extensions/products/${productId}/variants`,
      { headers, next: { revalidate: 30 } },
    )
    if (!res.ok) return {}

    const data = await res.json()
    const map: Record<string, VariantExtension> = {}
    for (const v of data.variants || []) {
      map[v.id] = {
        compare_at_price: v.compare_at_price,
        allow_backorder: v.allow_backorder ?? false,
        inventory_quantity: v.inventory_quantity,
      }
    }
    return map
  } catch {
    return {}
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>
}): Promise<Metadata> {
  const { handle } = await params
  const product = await getProduct(handle)

  if (!product) {
    return { title: 'Product Not Found' }
  }

  return {
    title: product.title,
    description: product.description || `Shop ${product.title}`,
    openGraph: {
      title: product.title,
      description: product.description || `Shop ${product.title}`,
      ...(product.thumbnail ? { images: [{ url: product.thumbnail }] } : {}),
    },
  }
}

const SPEC_ROWS = [
  { icon: Flame, label: 'Weight', value: '500gsm / 380gsm' },
  { icon: Scissors, label: 'Finish', value: 'Chain-stitch ready' },
  { icon: Ruler, label: 'Fit', value: 'Dropped shoulder, relaxed' },
  { icon: Award, label: 'Made in', value: 'Portugal · Finished in NY' },
]

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  const { handle } = await params
  const product = await getProduct(handle)

  if (!product) {
    notFound()
  }

  const variantExtensions = await getVariantExtensions(product.id)
  const companionProduct = await getCompanionProduct(product.id)

  const allImages = [
    ...(product.thumbnail ? [{ url: product.thumbnail }] : []),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(product.images || []).filter((img: any) => img.url !== product.thumbnail),
  ]

  const displayImages = allImages.length > 0
    ? allImages
    : [{ url: getProductPlaceholder(product.id) }]

  return (
    <>
      {/* Breadcrumbs */}
      <div className="border-b">
        <div className="container-custom py-3">
          <nav className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/products" className="hover:text-foreground transition-colors">Shop</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">{product.title}</span>
          </nav>
        </div>
      </div>

      <div className="container-custom py-6 lg:py-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
          {/* ── Product Images ─────────────────────────────── */}
          <div className="space-y-3">
            <div className="relative aspect-[3/4] overflow-hidden bg-muted">
              <Image
                src={displayImages[0].url}
                alt={product.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute top-4 left-4 bg-foreground text-background px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em]">
                Drop No.09
              </div>
            </div>

            {displayImages.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {displayImages.slice(1, 5).map((image: { url: string }, idx: number) => (
                  <div
                    key={idx}
                    className="relative aspect-[3/4] overflow-hidden bg-muted"
                  >
                    <Image
                      src={image.url}
                      alt={`${product.title} ${idx + 2}`}
                      fill
                      sizes="12vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Spec strip */}
            <div className="hidden lg:grid grid-cols-2 gap-px bg-border border border-border mt-6">
              {SPEC_ROWS.map((s) => {
                const Icon = s.icon
                return (
                  <div key={s.label} className="bg-background p-4 flex items-center gap-3">
                    <Icon className="h-4 w-4 text-accent flex-shrink-0" strokeWidth={1.75} />
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
                      <p className="text-sm font-semibold truncate">{s.value}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Product Info ───────────────────────────────── */}
          <div className="lg:sticky lg:top-24 lg:self-start space-y-6">
            <div>
              {product.subtitle && (
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
                  {product.subtitle}
                </p>
              )}
              <h1 className="text-h2 lg:text-h1 font-heading font-bold uppercase tracking-tight leading-[1.05]">
                {product.title}
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                Garment-dyed heavyweight fleece. Chain-stitch embroidery available.
              </p>
            </div>

            <ProductViewTracker
              productId={product.id}
              productTitle={product.title}
              variantId={product.variants?.[0]?.id || null}
              currency={product.variants?.[0]?.calculated_price?.currency_code || 'usd'}
              value={product.variants?.[0]?.calculated_price?.calculated_amount ?? null}
            />

            <ProductActions
              product={product}
              variantExtensions={variantExtensions}
              companionProduct={companionProduct}
            />

            <ProductAccordion
              description={product.description}
              details={product.metadata as Record<string, string> | undefined}
            />
          </div>
        </div>
      </div>
    </>
  )
}
