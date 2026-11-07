import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Card from '../components/Card';
import { useAuth } from '../features/auth/useAuth';
import { CONDITIONS, STEPS, SAMPLE_MEALS } from '../features/landing/landingData';

export default function Landing() {
  const { user, profileComplete } = useAuth();

  const ctaDestination = !user ? '/register' : profileComplete ? '/dashboard' : '/onboarding';
  const ctaLabel = !user
    ? "Get started — it's free"
    : profileComplete
    ? 'Go to Dashboard'
    : 'Complete your profile';

  return (
    <Layout fullWidth={true}>
      <div className="w-full">
        {/* 1. Hero Section: 98% viewport height with smooth gradient */}
        <section className="min-h-[98vh] flex flex-col justify-center items-center bg-gradient-to-b from-page via-surface-muted/40 to-surface-muted px-4 sm:px-6 py-12 text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-1.5 text-xs font-semibold text-fg shadow-sm">
              <span className="text-primary font-bold">✨ AI Nutrition</span>
              <span className="text-line">|</span>
              <span>Tailored for Nigerian Health &amp; Wallets</span>
            </div>

            <h1 className="text-3xl sm:text-6xl font-extrabold tracking-tight text-fg leading-tight sm:leading-tight">
              Delicious Nigerian Meals That Fit Your Health and Your Wallet
            </h1>

            <p className="mx-auto max-w-2xl text-sm sm:text-lg text-muted leading-relaxed">
              ChopWise takes the guesswork out of healthy Nigerian eating. Get customized weekly meal recommendations built around local ingredients, your medical conditions, and your exact Naira budget.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              <Link to={ctaDestination} className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto px-8 min-h-12 text-sm font-semibold shadow-md">
                  {ctaLabel} →
                </Button>
              </Link>
              <a href="#how-it-works" className="w-full sm:w-auto">
                <Button variant="secondary" className="w-full sm:w-auto px-6 min-h-12 text-sm font-medium">
                  How It Works
                </Button>
              </a>
            </div>

            <div className="pt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-muted">
              <span>✓ Real Nigerian Market Prices</span>
              <span>✓ Hypertension, Diabetes &amp; Ulcer Safe</span>
              <span>✓ Verified Nutritional Estimates</span>
            </div>
          </div>
        </section>

        {/* 2. Clinical Conditions Section: 60vh minimum with contrasting gradient */}
        <section className="min-h-[60vh] flex flex-col justify-center bg-gradient-to-b from-surface-muted via-surface to-surface border-t border-line/40 px-4 sm:px-6 py-16">
          <div className="max-w-6xl mx-auto w-full space-y-8">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-fg">
                Nutrition Tailored to Nigerian Health Realities
              </h2>
              <p className="text-xs sm:text-sm text-muted">
                Designed around evidence-based dietary guidelines for prevalent cardiovascular and metabolic conditions.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {CONDITIONS.map((c, i) => (
                <Card key={i} className="p-5 flex flex-col justify-between hover:border-field-line transition-all">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-3xl" aria-hidden="true">{c.icon}</span>
                      <span className="rounded-full bg-surface-muted border border-line px-2 py-0.5 text-[10px] font-semibold text-fg">
                        {c.badge}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-fg">{c.name}</h3>
                    <p className="text-xs text-muted leading-relaxed">{c.desc}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* 3. How It Works Section: 60vh minimum with alternating gradient */}
        <section id="how-it-works" className="min-h-[60vh] flex flex-col justify-center bg-gradient-to-b from-surface via-surface-muted/50 to-surface-muted border-t border-line/40 px-4 sm:px-6 py-16 scroll-mt-16">
          <div className="max-w-6xl mx-auto w-full space-y-8">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-fg">
                How ChopWise Works
              </h2>
              <p className="text-xs sm:text-sm text-muted">
                Three simple steps to personalized, budget-friendly Nigerian meal plans.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              {STEPS.map((s, i) => (
                <div key={i} className="rounded-xl border border-line bg-surface p-6 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl" aria-hidden="true">{s.icon}</span>
                    <span className="text-xs font-mono font-bold text-muted">{s.step}</span>
                  </div>
                  <h3 className="text-base font-bold text-fg">{s.title}</h3>
                  <p className="text-xs text-muted leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Sample Recipe Showcase: Expansive section with natural height for detailed cards */}
        <section className="bg-gradient-to-b from-surface-muted via-page to-page border-t border-line/40 px-4 sm:px-6 py-20 sm:py-24">
          <div className="max-w-6xl mx-auto w-full space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 border-b border-line pb-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-fg">
                  Sample Recipes You Can Cook
                </h2>
                <p className="text-xs sm:text-sm text-muted mt-1">
                  Real Nigerian meals with calculated costs, directions, and health safety flags.
                </p>
              </div>
              <Link to={ctaDestination} className="text-xs font-semibold text-primary underline">
                Create your plan →
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              {SAMPLE_MEALS.map((m, i) => (
                <Card key={i} className="p-5 flex flex-col justify-between space-y-4 hover:border-field-line transition-all">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-muted">
                      <span className="font-semibold text-fg uppercase tracking-wider text-[11px]">{m.type}</span>
                      <span>⏱ {m.time}</span>
                    </div>
                    <h3 className="text-base font-bold text-fg leading-snug">{m.name}</h3>
                    <p className="text-xs text-muted leading-relaxed line-clamp-3">{m.desc}</p>
                  </div>

                  <div className="border-t border-line pt-3 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-muted">Estimated cost:</span>
                      <span className="text-base font-extrabold text-primary">{m.cost}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {m.tags.map((t, idx) => (
                        <span key={idx} className="rounded bg-surface-muted border border-line px-1.5 py-0.5 text-[10px] text-fg">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Closing Call-to-Action Section: 60vh minimum with closing gradient */}
        <section className="min-h-[60vh] flex flex-col justify-center bg-gradient-to-b from-page via-surface-muted/60 to-surface border-t border-line/40 px-4 sm:px-6 py-16 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-fg leading-tight">
              Take Control of Your Health &amp; Food Budget Today
            </h2>
            <p className="mx-auto max-w-xl text-xs sm:text-sm text-muted leading-relaxed">
              Stop worrying about what to cook. Get customized, budget-conscious Nigerian meal plans designed specifically for your body and your pocket.
            </p>
            <div className="pt-2">
              <Link to={ctaDestination}>
                <Button className="px-8 min-h-12 text-sm font-semibold shadow-md">
                  {ctaLabel} →
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
