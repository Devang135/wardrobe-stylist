import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  Layers,
  MessageSquareText,
  Shirt,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { BRAND_CONFIG, SUBSCRIPTION_PLANS } from '@/config/brand.config';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { createAvatarIllustration, createGarmentIllustration } from '@/assets/fashion-illustrations';
import { formatCurrencyInr } from '@/lib/format';

export default function LandingPage() {
  const [infoModal, setInfoModal] = useState<'privacy' | 'terms' | 'contact' | null>(null);

  const heroAvatar = createAvatarIllustration({
    topColor: '#8FB0C9',
    outerwearColor: '#4B3A32',
    bottomColor: '#343230',
    footwearColor: '#8C4E32',
    label: 'Your Studio Avatar',
  });

  const sampleItems = [
    {
      name: 'Oxford Shirt',
      img: createGarmentIllustration({ category: 'TOP', subcategory: 'Shirt', colorHex: '#8FB0C9' }),
    },
    {
      name: 'Espresso Blazer',
      img: createGarmentIllustration({ category: 'OUTERWEAR', subcategory: 'Blazer', colorHex: '#4B3A32' }),
    },
    {
      name: 'Pleated Trousers',
      img: createGarmentIllustration({ category: 'BOTTOM', subcategory: 'Trousers', colorHex: '#343230' }),
    },
    {
      name: 'Cognac Loafers',
      img: createGarmentIllustration({ category: 'FOOTWEAR', subcategory: 'Loafers', colorHex: '#8C4E32' }),
    },
  ];

  const features = [
    {
      icon: Shirt,
      title: 'Digital Wardrobe',
      description:
        'Upload photos of your clothes and organize them into a clean, searchable catalogue by category, color, season, and occasion.',
    },
    {
      icon: UserCheck,
      title: 'Your AI Avatar',
      description:
        'Generate a personal full-body avatar from a face and full-body reference photo so every look reflects your proportions.',
    },
    {
      icon: Layers,
      title: 'Virtual Try-On',
      description:
        'Mix tops, bottoms, outerwear, footwear, and accessories in Outfit Studio and preview complete outfits before getting dressed.',
    },
    {
      icon: MessageSquareText,
      title: 'Personal Stylist',
      description:
        'Ask for office, dinner, travel, or festive looks and receive curated pairings built strictly from clothes you already own.',
    },
  ];

  return (
    <div className="min-h-screen bg-canvas text-ink">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-canvas/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent font-display text-lg font-semibold text-white">
              {BRAND_CONFIG.shortMark}
            </span>
            <span className="text-base font-semibold text-ink">{BRAND_CONFIG.appName}</span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-ink-muted md:flex">
            <a href="#features" className="hover:text-ink transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-ink transition-colors">
              How it works
            </a>
            <a href="#pricing" className="hover:text-ink transition-colors">
              Pricing
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            <Button variant="ghost" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link to="/signup">Create your wardrobe</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-6">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-ink-muted">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Editorial Personal Styling Studio
            </span>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl lg:text-6xl">
              Your wardrobe. Reimagined.
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg">
              Digitize your clothes into a calm studio catalogue, create your personal full-body avatar,
              and preview complete outfits before getting dressed.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg" asChild>
                <Link to="/signup">
                  Create your wardrobe
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#how-it-works">Explore how it works</a>
              </Button>
              <Button size="lg" variant="ghost" asChild>
                <Link to="/login">Try live demo</Link>
              </Button>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="grid grid-cols-12 gap-4 rounded-2xl border border-border bg-surface p-5 shadow-elevated">
              <div className="col-span-7 overflow-hidden rounded-xl bg-surface-muted/50">
                <img
                  src={heroAvatar}
                  alt="Personal AI avatar wearing curated wardrobe garments"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="col-span-5 grid grid-cols-1 gap-3">
                {sampleItems.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center gap-2.5 rounded-xl border border-border bg-canvas/60 p-2"
                  >
                    <img
                      src={item.img}
                      alt={item.name}
                      className="h-12 w-12 shrink-0 rounded-lg object-cover"
                    />
                    <span className="text-xs font-medium text-ink leading-tight">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border bg-surface/60 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-10">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">
              Studio Capabilities
            </p>
            <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
              Everything you need to dress with clarity
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <Card key={feat.title} className="p-6 space-y-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-semibold text-ink">{feat.title}</h3>
                  <p className="text-sm leading-relaxed text-ink-muted">{feat.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-10">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">Workflow</p>
            <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
              From closet photos to curated looks in three steps
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Digitize your pieces',
                text: 'Drop in photos of your shirts, trousers, shoes, kurta, and accessories. Review suggested categories, colors, and tags.',
              },
              {
                step: '02',
                title: 'Build your personal avatar',
                text: 'Add a face and full-body reference photo to create your studio avatar for realistic outfit composition.',
              },
              {
                step: '03',
                title: 'Style, preview & plan',
                text: 'Pair garments in Outfit Studio, save tagged combinations, ask the AI Stylist, and schedule outfits on your calendar.',
              },
            ].map((item) => (
              <Card key={item.step} className="p-6 space-y-3">
                <span className="font-display text-2xl font-semibold text-accent">{item.step}</span>
                <h3 className="text-lg font-semibold text-ink">{item.title}</h3>
                <p className="text-sm leading-relaxed text-ink-muted">{item.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section id="pricing" className="border-t border-border bg-surface/60 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                Transparent Plans (Demo Pricing)
              </p>
              <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
                Start free, scale when you style more
              </h2>
            </div>
            <p className="text-xs text-ink-subtle">Illustrative INR pricing configured in demo mode</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <Card
                key={plan.id}
                className={`flex flex-col justify-between p-6 ${
                  plan.highlighted ? 'border-accent ring-1 ring-accent/30' : ''
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-ink">{plan.name}</h3>
                    {plan.highlighted && (
                      <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent">
                        Most Popular
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-ink-muted">{plan.tagline}</p>
                  <p className="text-3xl font-semibold text-ink">
                    {formatCurrencyInr(plan.monthlyPriceInr)}
                    <span className="text-sm font-normal text-ink-muted"> / month</span>
                  </p>
                  <ul className="space-y-2 pt-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-ink-muted">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-sage" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  className="mt-6 w-full"
                  variant={plan.highlighted ? 'default' : 'outline'}
                  asChild
                >
                  <Link to="/signup">Get started</Link>
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-canvas py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-xs text-ink-muted sm:flex-row sm:px-6">
          <p>
            {BRAND_CONFIG.appName} — {BRAND_CONFIG.tagline}
          </p>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => setInfoModal('privacy')}
              className="hover:text-ink underline-offset-4 hover:underline"
            >
              Privacy
            </button>
            <button
              type="button"
              onClick={() => setInfoModal('terms')}
              className="hover:text-ink underline-offset-4 hover:underline"
            >
              Terms
            </button>
            <button
              type="button"
              onClick={() => setInfoModal('contact')}
              className="hover:text-ink underline-offset-4 hover:underline"
            >
              Contact
            </button>
          </div>
        </div>
      </footer>

      <Dialog open={infoModal !== null} onOpenChange={(open) => !open && setInfoModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="capitalize">{infoModal ?? ''}</DialogTitle>
            <DialogDescription>
              {infoModal === 'privacy' &&
                'Reference photos and wardrobe images are stored solely to generate your personal avatar, catalogue items, and virtual try-ons. In this frontend demo, data remains in local browser memory.'}
              {infoModal === 'terms' &&
                'Use Wardrobe AI only with personal photos you own or have permission to process. Generated previews are illustrative approximations.'}
              {infoModal === 'contact' &&
                `Reach our studio team at ${BRAND_CONFIG.supportEmail} for backend integration inquiries or account support.`}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
