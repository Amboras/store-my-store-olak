'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import {
  ArrowRight,
  Truck,
  Shield,
  RotateCcw,
  Scissors,
  Flame,
  Ruler,
  PenTool,
  Package,
  CheckCircle2,
  Star,
} from 'lucide-react'
import CollectionSection from '@/components/marketing/collection-section'
import { useCollections } from '@/hooks/use-collections'
import { trackMetaEvent } from '@/lib/meta-pixel'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1600&q=80'
const LIFESTYLE_IMAGE =
  'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=1600&q=80'

const LOOKBOOK = [
  'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=900&q=80',
  'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=900&q=80',
  'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=900&q=80',
  'https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?w=900&q=80',
  'https://images.unsplash.com/photo-1578681994506-b8f463449011?w=900&q=80',
  'https://images.unsplash.com/photo-1572307480813-ceb0e59d8325?w=900&q=80',
]

const MARQUEE_WORDS = [
  '500GSM Heavyweight',
  'Garment Dyed',
  'Chain-stitch Embroidery',
  'Made in Small Batches',
  'Free US Shipping $75+',
  'Built to Last Decades',
]

const PILLARS = [
  {
    icon: Flame,
    title: 'Heavyweight 500gsm',
    body: 'Brushed-back cotton fleece that only gets better with every wash.',
  },
  {
    icon: Scissors,
    title: 'Custom Embroidery',
    body: 'Your name, crew, or logo — chain-stitched by hand on every order.',
  },
  {
    icon: Ruler,
    title: 'Tailored Boxy Fit',
    body: 'Dropped shoulders, cropped hem, relaxed sleeve. No shrink, ever.',
  },
]

const STEPS = [
  { icon: PenTool, title: 'Pick your piece', body: 'Hoodie, crewneck or zip-up.' },
  { icon: Scissors, title: 'Add your mark', body: 'Text, monogram, or upload artwork.' },
  { icon: Package, title: 'Shipped in 7 days', body: 'Stitched and dispatched from our workshop.' },
]

export default function HomePage() {
  const { data: collections, isLoading } = useCollections()
  const [newsletterEmail, setNewsletterEmail] = useState('')

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newsletterEmail.trim()) return
    trackMetaEvent('Lead', {
      content_name: 'newsletter_signup',
      status: 'submitted',
    })
  }

  return (
    <>
      {/* ================= HERO ================= */}
      <section className="relative bg-background">
        <div className="container-custom grid lg:grid-cols-12 gap-8 lg:gap-12 items-stretch pt-10 pb-12 lg:pt-16 lg:pb-20">
          {/* Left — copy */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-10 animate-fade-in-up">
            <div>
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-6">
                <span className="inline-block h-px w-8 bg-foreground/40" />
                <span>No. 09 — Winter Drop</span>
              </div>
              <h1 className="font-heading font-bold uppercase tracking-[-0.02em] leading-[0.9] text-[clamp(3rem,8vw,6.5rem)]">
                Heavy<br />
                <span className="italic font-normal">weight.</span><br />
                <span className="text-accent">Built&nbsp;yours.</span>
              </h1>
              <p className="mt-8 max-w-md text-base lg:text-lg text-muted-foreground leading-relaxed">
                Premium 500gsm hoodies and sweatshirts, garment-dyed in small batches and
                custom-embroidered by hand. One drop. No restocks.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/products"
                  className="group inline-flex items-center gap-2 bg-foreground text-background px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-accent transition-colors"
                  prefetch={true}
                >
                  Shop the drop
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 border border-foreground px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-foreground hover:text-background transition-colors"
                  prefetch={true}
                >
                  Our craft
                </Link>
              </div>

              <div className="flex items-center gap-6 pt-4 border-t border-border/60">
                <div>
                  <p className="text-2xl font-heading font-bold">4.9<span className="text-accent">/</span>5</p>
                  <div className="flex gap-0.5 mt-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-accent text-accent" />
                    ))}
                  </div>
                </div>
                <div className="h-10 w-px bg-border" />
                <div>
                  <p className="text-sm font-semibold">12,400+</p>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Hoodies shipped</p>
                </div>
                <div className="h-10 w-px bg-border hidden sm:block" />
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold">Since 2019</p>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Brooklyn, NY</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right — image stack */}
          <div className="lg:col-span-7 relative">
            <div className="relative aspect-[4/5] lg:aspect-auto lg:h-full overflow-hidden bg-muted animate-fade-in">
              <Image
                src={HERO_IMAGE}
                alt="Threadhaus heavyweight hoodie"
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
                priority
              />
              {/* Overlay badge */}
              <div className="absolute top-5 left-5 bg-background/90 backdrop-blur-sm px-4 py-3 border border-foreground/10">
                <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Drop No.09</p>
                <p className="text-sm font-bold mt-0.5">Limited to 500 units</p>
              </div>
              {/* Bottom price tag */}
              <div className="absolute bottom-5 right-5 bg-foreground text-background px-5 py-4 max-w-[240px]">
                <p className="text-[10px] uppercase tracking-[0.25em] opacity-70">Starting from</p>
                <p className="font-heading text-2xl font-bold mt-0.5">$89</p>
                <p className="text-[11px] opacity-70 mt-1 leading-snug">with free embroidery on orders over $120</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= MARQUEE ================= */}
      <section className="bg-foreground text-background border-y border-foreground overflow-hidden">
        <div className="flex overflow-hidden whitespace-nowrap py-4">
          <div className="marquee-track flex shrink-0 items-center gap-10">
            {[...MARQUEE_WORDS, ...MARQUEE_WORDS].map((w, i) => (
              <span
                key={i}
                className="flex items-center gap-10 text-sm uppercase tracking-[0.3em] font-medium"
              >
                {w}
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PILLARS ================= */}
      <section className="py-section">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-14">
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">The standard</p>
              <h2 className="text-h2 lg:text-h1 font-heading font-bold uppercase tracking-tight max-w-2xl">
                Three things we <span className="italic font-normal">never</span> compromise on.
              </h2>
            </div>
            <Link
              href="/about"
              className="hidden lg:inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] link-underline pb-0.5"
            >
              Read the full spec <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border">
            {PILLARS.map((p) => {
              const Icon = p.icon
              return (
                <div key={p.title} className="bg-background p-8 lg:p-10 group hover:bg-muted/60 transition-colors">
                  <Icon className="h-8 w-8 text-accent mb-6" strokeWidth={1.5} />
                  <h3 className="font-heading font-bold text-xl uppercase tracking-wide mb-3">
                    {p.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.body}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ================= COLLECTIONS / FEATURED ================= */}
      {isLoading ? (
        <section className="py-section-sm">
          <div className="container-custom">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-[3/4] bg-muted animate-pulse" />
              ))}
            </div>
          </div>
        </section>
      ) : collections && collections.length > 0 ? (
        <>
          {collections.map((collection: { id: string; handle: string; title: string; metadata?: Record<string, unknown> }, index: number) => (
            <CollectionSection
              key={collection.id}
              collection={collection}
              alternate={index % 2 === 1}
            />
          ))}
        </>
      ) : null}

      {/* ================= CUSTOMIZATION / BUILD YOURS ================= */}
      <section className="relative bg-foreground text-background overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Image
            src={LIFESTYLE_IMAGE}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="container-custom relative py-section">
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5 lg:sticky lg:top-24">
              <p className="text-[11px] uppercase tracking-[0.25em] text-accent mb-4">
                Build yours
              </p>
              <h2 className="text-h2 lg:text-h1 font-heading font-bold uppercase tracking-tight leading-[1.05] mb-6">
                Make it<br /><span className="italic font-normal">unmistakably</span><br />yours.
              </h2>
              <p className="text-base text-background/75 leading-relaxed max-w-md mb-10">
                Every Threadhaus piece can be personalised with chain-stitch embroidery
                — name, initials, team, or your own artwork. Free on orders over $120.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-accent hover:bg-background hover:text-foreground px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] transition-colors"
                prefetch={true}
              >
                Start customising <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="lg:col-span-7 grid sm:grid-cols-3 gap-px bg-background/15 border border-background/15">
              {STEPS.map((s, i) => {
                const Icon = s.icon
                return (
                  <div key={s.title} className="bg-foreground/95 p-8 min-h-[240px] flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                      <span className="text-5xl font-heading font-bold text-accent/90 leading-none">
                        0{i + 1}
                      </span>
                      <Icon className="h-6 w-6 text-background/60" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-lg uppercase tracking-wide">
                        {s.title}
                      </h3>
                      <p className="text-sm text-background/70 mt-2 leading-relaxed">{s.body}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ================= LOOKBOOK ================= */}
      <section className="py-section">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">Lookbook</p>
              <h2 className="text-h2 lg:text-h1 font-heading font-bold uppercase tracking-tight">
                In the wild.
              </h2>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm">
              Shot on our community — real people, real fits. Tag <span className="text-foreground font-semibold">#threadhaus</span> to be featured.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative aspect-[3/4] lg:row-span-2 lg:aspect-auto overflow-hidden bg-muted group">
              <Image src={LOOKBOOK[0]} alt="Lookbook 1" fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <div className="relative aspect-[3/4] overflow-hidden bg-muted group">
              <Image src={LOOKBOOK[1]} alt="Lookbook 2" fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <div className="relative aspect-[3/4] lg:row-span-2 lg:aspect-auto overflow-hidden bg-muted group hidden lg:block">
              <Image src={LOOKBOOK[2]} alt="Lookbook 3" fill sizes="25vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <div className="relative aspect-[3/4] overflow-hidden bg-muted group">
              <Image src={LOOKBOOK[3]} alt="Lookbook 4" fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <div className="relative aspect-[3/4] overflow-hidden bg-muted group">
              <Image src={LOOKBOOK[4]} alt="Lookbook 5" fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <div className="relative aspect-[3/4] overflow-hidden bg-muted group lg:block hidden">
              <Image src={LOOKBOOK[5]} alt="Lookbook 6" fill sizes="25vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
          </div>
        </div>
      </section>

      {/* ================= TRUST BAR ================= */}
      <section className="border-y bg-muted/40">
        <div className="container-custom py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <Truck className="h-6 w-6 flex-shrink-0 text-accent" strokeWidth={1.5} />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider">Free Shipping</p>
                <p className="text-[11px] text-muted-foreground">Orders over $75</p>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <RotateCcw className="h-6 w-6 flex-shrink-0 text-accent" strokeWidth={1.5} />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider">60-Day Returns</p>
                <p className="text-[11px] text-muted-foreground">No questions</p>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-accent" strokeWidth={1.5} />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider">Lifetime Stitching</p>
                <p className="text-[11px] text-muted-foreground">Guaranteed seams</p>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <Shield className="h-6 w-6 flex-shrink-0 text-accent" strokeWidth={1.5} />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider">Secure Checkout</p>
                <p className="text-[11px] text-muted-foreground">256-bit SSL</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= NEWSLETTER ================= */}
      <section className="py-section">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">The list</p>
              <h2 className="text-h2 font-heading font-bold uppercase tracking-tight leading-[1.05]">
                First dibs on<br />every drop.
              </h2>
              <p className="mt-4 text-muted-foreground max-w-md leading-relaxed">
                Subscribers get 48-hour early access, limited colourways, and 10% off
                their first custom order.
              </p>
            </div>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <div className="flex border-2 border-foreground">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 bg-transparent px-4 py-4 text-sm placeholder:text-muted-foreground focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  className="bg-foreground text-background px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-accent transition-colors whitespace-nowrap"
                >
                  Join
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                By subscribing you agree to receive marketing emails. Unsubscribe anytime.
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  )
}
