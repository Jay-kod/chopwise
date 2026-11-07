import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { APP_NAME, APP_TAGLINE } from '../lib/constants';
import { useAuth } from '../features/auth/useAuth';

const CONDITIONS = [
  {
    icon: '🫀',
    name: 'Hypertension',
    desc: 'Low-sodium meals minimizing artificial bouillon cubes; favors scent leaf, garlic, and potassium-rich local greens.',
    badge: 'Sodium Conscious',
  },
  {
    icon: '🩺',
    name: 'Diabetes',
    desc: 'Controlled glycemic impact with complex carbs: unripe plantain, beans, and nutrient-packed soups that prevent glucose spikes.',
    badge: 'Low Glycemic',
  },
  {
    icon: '🥣',
    name: 'Peptic Ulcer',
    desc: 'Gentle, soothing preparations avoiding hot chili peppers, heavy frying, and citrus acidity for optimal digestive comfort.',
    badge: 'Non-Irritating',
  },
  {
    icon: '⚖️',
    name: 'Weight Management',
    desc: 'High-fiber, high-protein portions crafted from Nigerian soups and lean proteins that keep you full without excess calories.',
    badge: 'Calorie Balanced',
  },
];

const STEPS = [
  {
    step: '01',
    icon: '📋',
    title: 'Share Your Health Profile',
    desc: 'Enter your age, weight, medical conditions, foods to avoid, and your weekly food budget in Naira (₦).',
  },
  {
    step: '02',
    icon: '🍲',
    title: 'AI Crafts Your Nigerian Plan',
    desc: 'ChopWise curates authentic breakfast, lunch, and dinner options with ingredient amounts and cooking steps.',
  },
  {
    step: '03',
    icon: '📊',
    title: 'Cook with Verified Nutrition',
    desc: 'See verified calories, protein, carbs, fat, and sodium, paired with market-reconciled Naira cost estimates.',
  },
];

const SAMPLE_MEALS = [
  {
    type: 'Lunch',
    time: '35 mins',
    name: 'Efo Riro with Smoked Mackerel & Unripe Plantain',
    desc: 'Rich spinach stew cooked with locust beans (iru), smoked fish, and boiled green plantain.',
    cost: '₦1,250',
    tags: ['Hypertension Safe', 'Diabetes Friendly'],
  },
  {
    type: 'Dinner',
    time: '30 mins',
    name: 'Oat Swallow with Mild Fresh Okro & Chicken',
    desc: 'High-fiber oat swallow served with lightly stewed okro and tender skinless chicken breast.',
    cost: '₦950',
    tags: ['Ulcer Friendly', 'Weight Conscious'],
  },
  {
    type: 'Breakfast',
    time: '45 mins',
    name: 'Steamed Moi Moi with Egg & Garden Salad',
    desc: 'Protein-packed pureed brown beans steamed with boiled egg and garden greens.',
    cost: '₦800',
    tags: ['High Protein', 'Low Carb'],
  },
];

export default function Landing() {
  const { user, profileComplete } = useAuth();

  const ctaDestination = !user ? '/register' : profileComplete ? '/dashboard' : '/onboarding';
  const ctaLabel = !user
    ? "Get started — it's free"
    : profileComplete
    ? 'Go to Dashboard'
    : 'Complete your profile';

  return (
    <Layout>
      <div className="space-y-16 sm:space-y-24 py-4 sm:py-8">
        {/* 1. Hero Section */}
        <section className="text-center space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface-muted px-3.5 py-1 text-xs font-medium text-fg shadow-sm">
            <span className="text-primary font-bold">✨ AI Nutrition</span>
            <span className="text-line">|</span>
            <span>Tailored for Nigerian Health &amp; Wallets</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-fg leading-tight sm:leading-tight">
            Delicious Nigerian Meals That Fit Your Health and Your Wallet
          </h1>

          <p className="mx-auto max-w-2xl text-sm sm:text-base text-muted leading-relaxed">
            ChopWise takes the guesswork out of healthy Nigerian eating. Get customized weekly meal recommendations built around local ingredients, your medical conditions, and your exact Naira budget.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
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

          {/* Trust badges */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted">
            <span>✓ Real Nigerian Market Prices</span>
            <span>✓ Hypertension, Diabetes &amp; Ulcer Safe</span>
            <span>✓ Verified Nutritional Estimates</span>
          </div>
        </section>

        {/* 2. Clinical Conditions Section */}
        <section className="space-y-6">
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
        </section>

        {/* 3. How It Works Section */}
        <section id="how-it-works" className="space-y-8 scroll-mt-20">
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
              <div key={i} className="rounded-xl border border-line bg-surface p-6 space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="text-2xl" aria-hidden="true">{s.icon}</span>
                  <span className="text-xs font-mono font-bold text-muted">{s.step}</span>
                </div>
                <h3 className="text-base font-bold text-fg">{s.title}</h3>
                <p className="text-xs text-muted leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Sample Meal Recommendations Preview */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
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

          <div className="grid gap-5 sm:grid-cols-3">
            {SAMPLE_MEALS.map((m, i) => (
              <Card key={i} className="p-5 flex flex-col justify-between space-y-4">
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
        </section>

        {/* 5. Call To Action Banner */}
        <section className="rounded-2xl border border-line bg-surface-muted p-8 sm:p-12 text-center space-y-5">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-fg">
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
        </section>
      </div>
    </Layout>
  );
}
